// ==================== APLICACIÓN PRINCIPAL ====================
import { supabase } from './config.js';
import { logout } from './auth.js';
import { exportToExcel } from './export.js';

// Estado global de la aplicación
let currentDay = 1;
let personas = [];
let asistencias = [];

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar si hay sesión activa
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        // Si no está logueado, redirigir al login
        window.location.href = '../../index.html';
        return;
    }
    
    console.log('Usuario autenticado:', session.user.email);
    
    // Inicializar la aplicación
    initializeApp();
});

function initializeApp() {
    // Event Listeners
    setupEventListeners();
    
    // Cargar datos iniciales
    loadData();
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Botones de día
    document.getElementById('day1Btn').addEventListener('click', () => switchDay(1));
    document.getElementById('day2Btn').addEventListener('click', () => switchDay(2));
    
    // Botón agregar persona
    document.getElementById('addPersonBtn').addEventListener('click', openModal);
    
    // Botón exportar
    document.getElementById('exportBtn').addEventListener('click', handleExport);
    
    // Botón cerrar sesión
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Modal
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('addPersonForm').addEventListener('submit', handleAddPerson);
    
    // Cerrar modal al hacer clic fuera
    document.getElementById('addPersonModal').addEventListener('click', (e) => {
        if (e.target.id === 'addPersonModal') {
            closeModal();
        }
    });
}

// ==================== CAMBIO DE DÍA ====================
function switchDay(day) {
    currentDay = day;
    
    // Actualizar botones activos
    document.getElementById('day1Btn').classList.toggle('active', day === 1);
    document.getElementById('day2Btn').classList.toggle('active', day === 2);
    
    // Recargar tarjetas con el nuevo día
    renderCards();
}

// ==================== CARGA DE DATOS ====================
async function loadData() {
    showLoading(true);
    
    try {
        // Cargar personas
        const { data: personasData, error: personasError } = await supabase
            .from('personas')
            .select('*')
            .order('nombre');
        
        if (personasError) throw personasError;
        personas = personasData || [];
        
        // Cargar asistencias
        const { data: asistenciasData, error: asistenciasError } = await supabase
            .from('asistencias')
            .select('*');
        
        if (asistenciasError) throw asistenciasError;
        asistencias = asistenciasData || [];
        
        // Renderizar
        renderCards();
        updateStats();
        
    } catch (error) {
        console.error('Error cargando datos:', error);
        alert('Error al cargar los datos. Por favor recarga la página.');
    } finally {
        showLoading(false);
    }
}

// ==================== RENDERIZADO DE TARJETAS ====================
function renderCards() {
    const container = document.getElementById('cardsContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (personas.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    emptyState.style.display = 'none';
    
    container.innerHTML = personas.map(persona => {
        const asistencia = asistencias.find(a => 
            a.persona_id === persona.id && a.dia === currentDay
        );
        
        return createPersonCard(persona, asistencia);
    }).join('');
    
    // Agregar event listeners a los botones de asistencia
    setupAttendanceButtons();
}

function createPersonCard(persona, asistencia) {
    const hasEntrada = asistencia && asistencia.entrada;
    const hasSalida = asistencia && asistencia.salida;
    
    const entradaTime = hasEntrada ? formatTime(asistencia.entrada) : 'Sin registrar';
    const salidaTime = hasSalida ? formatTime(asistencia.salida) : 'Sin registrar';
    
    return `
        <div class="person-card" data-person-id="${persona.id}">
            <div class="card-header">
                <h3 class="card-name">${persona.nombre}</h3>
                <span class="card-ooad">📍 ${persona.ooad}</span>
            </div>
            <div class="card-body">
                <div class="attendance-row">
                    <div class="attendance-label">
                        <span class="attendance-type">Entrada</span>
                        <span class="attendance-time ${hasEntrada ? 'marked' : ''}">${entradaTime}</span>
                    </div>
                    <button 
                        class="btn-attendance btn-entrada" 
                        data-person-id="${persona.id}"
                        data-type="entrada"
                        ${hasEntrada ? 'disabled' : ''}
                    >
                        ${hasEntrada ? '✓ Registrada' : 'Registrar'}
                    </button>
                </div>
                <div class="attendance-row">
                    <div class="attendance-label">
                        <span class="attendance-type">Salida</span>
                        <span class="attendance-time ${hasSalida ? 'marked' : ''}">${salidaTime}</span>
                    </div>
                    <button 
                        class="btn-attendance btn-salida" 
                        data-person-id="${persona.id}"
                        data-type="salida"
                        ${hasSalida ? 'disabled' : ''}
                    >
                        ${hasSalida ? '✓ Registrada' : 'Registrar'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
}

// ==================== BOTONES DE ASISTENCIA ====================
function setupAttendanceButtons() {
    const buttons = document.querySelectorAll('.btn-attendance');
    buttons.forEach(btn => {
        btn.addEventListener('click', handleAttendanceClick);
    });
}

async function handleAttendanceClick(e) {
    const button = e.currentTarget;
    const personId = button.dataset.personId;
    const type = button.dataset.type; // 'entrada' o 'salida'
    
    button.disabled = true;
    button.textContent = 'Registrando...';
    
    try {
        await registerAttendance(personId, type);
        
        // Recargar datos
        await loadData();
        
    } catch (error) {
        console.error('Error registrando asistencia:', error);
        alert('Error al registrar asistencia. Inténtalo de nuevo.');
        button.disabled = false;
        button.textContent = 'Registrar';
    }
}

async function registerAttendance(personId, type) {
    const now = new Date().toISOString();
    
    // Buscar si ya existe un registro de asistencia para esta persona y día
    const { data: existing, error: searchError } = await supabase
        .from('asistencias')
        .select('*')
        .eq('persona_id', personId)
        .eq('dia', currentDay)
        .single();
    
    if (searchError && searchError.code !== 'PGRST116') { // PGRST116 = no rows found
        throw searchError;
    }
    
    if (existing) {
        // Actualizar registro existente
        const updateData = {};
        updateData[type] = now;
        
        const { error: updateError } = await supabase
            .from('asistencias')
            .update(updateData)
            .eq('id', existing.id);
        
        if (updateError) throw updateError;
    } else {
        // Crear nuevo registro
        const insertData = {
            persona_id: personId,
            dia: currentDay,
            [type]: now
        };
        
        const { error: insertError } = await supabase
            .from('asistencias')
            .insert(insertData);
        
        if (insertError) throw insertError;
    }
}

// ==================== MODAL AGREGAR PERSONA ====================
function openModal() {
    const modal = document.getElementById('addPersonModal');
    modal.classList.add('active');
    document.getElementById('personName').focus();
}

function closeModal() {
    const modal = document.getElementById('addPersonModal');
    modal.classList.remove('active');
    document.getElementById('addPersonForm').reset();
    document.getElementById('formError').style.display = 'none';
}

async function handleAddPerson(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('personName').value.trim();
    const ooad = document.getElementById('personOOAD').value;
    const formError = document.getElementById('formError');
    
    formError.style.display = 'none';
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';
    
    try {
        // Insertar nueva persona
        const { data, error } = await supabase
            .from('personas')
            .insert([{ nombre, ooad }])
            .select();
        
        if (error) throw error;
        
        console.log('Persona agregada:', data);
        
        // Cerrar modal y recargar datos
        closeModal();
        await loadData();
        
    } catch (error) {
        console.error('Error agregando persona:', error);
        formError.style.display = 'block';
        formError.textContent = 'Error al agregar persona. Inténtalo de nuevo.';
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Guardar';
    }
}

// ==================== ESTADÍSTICAS ====================
function updateStats() {
    // Total de personas
    document.getElementById('totalPersonas').textContent = personas.length;
    
    // Contar entradas y salidas del día actual
    const asistenciasHoy = asistencias.filter(a => a.dia === currentDay);
    const totalEntradas = asistenciasHoy.filter(a => a.entrada).length;
    const totalSalidas = asistenciasHoy.filter(a => a.salida).length;
    
    document.getElementById('totalEntradas').textContent = totalEntradas;
    document.getElementById('totalSalidas').textContent = totalSalidas;
}

// ==================== EXPORTAR ====================
async function handleExport() {
    showLoading(true);
    
    try {
        await exportToExcel(personas, asistencias);
    } catch (error) {
        console.error('Error exportando:', error);
        alert('Error al exportar. Inténtalo de nuevo.');
    } finally {
        showLoading(false);
    }
}

// ==================== UTILIDADES ====================
function showLoading(show) {
    const loading = document.getElementById('loading');
    loading.style.display = show ? 'flex' : 'none';
}