// ============================================
// ESTADO DE LA APLICACIÓN
// ============================================

let people = [];
let currentFilter = 'all';

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderCards();
    updateStats();
    initEventListeners();
});

// ============================================
// EVENT LISTENERS
// ============================================

function initEventListeners() {
    // Botón agregar persona
    document.getElementById('addBtn').addEventListener('click', addPerson);
    
    // Enter en input para agregar
    document.getElementById('personName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addPerson();
        }
    });
    
    // Botón exportar
    document.getElementById('exportBtn').addEventListener('click', exportData);
    
    // Botón limpiar todo
    document.getElementById('clearBtn').addEventListener('click', clearAll);
    
    // Filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.target.dataset.filter;
            setFilter(filter);
        });
    });
}

// ============================================
// GESTIÓN DE DATOS (localStorage)
// ============================================

function loadData() {
    const saved = localStorage.getItem('attendanceData');
    if (saved) {
        try {
            people = JSON.parse(saved);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            people = [];
        }
    }
}

function saveData() {
    localStorage.setItem('attendanceData', JSON.stringify(people));
}

// ============================================
// CRUD OPERATIONS
// ============================================

function addPerson() {
    const input = document.getElementById('personName');
    const name = input.value.trim();
    
    if (name === '') {
        alert('Por favor ingresa un nombre');
        input.focus();
        return;
    }
    
    const newPerson = {
        id: Date.now(),
        name: name,
        status: 'pending', // pending, attended, not-attended
        timestamp: new Date().toISOString()
    };
    
    people.unshift(newPerson); // Agregar al inicio
    saveData();
    input.value = '';
    input.focus();
    
    renderCards();
    updateStats();
}

function markAttendance(id, status) {
    const person = people.find(p => p.id === id);
    if (person) {
        person.status = status;
        person.lastUpdate = new Date().toISOString();
        saveData();
        renderCards();
        updateStats();
    }
}

function deletePerson(id) {
    if (!confirm('¿Estás seguro de eliminar esta persona?')) {
        return;
    }
    
    people = people.filter(p => p.id !== id);
    saveData();
    renderCards();
    updateStats();
}

function clearAll() {
    if (people.length === 0) {
        alert('No hay datos para limpiar');
        return;
    }
    
    if (!confirm('⚠️ ¿Estás seguro? Esto eliminará TODAS las personas registradas.')) {
        return;
    }
    
    if (!confirm('Confirmación final: Esta acción no se puede deshacer.')) {
        return;
    }
    
    people = [];
    saveData();
    currentFilter = 'all';
    
    // Resetear filtros visuales
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('[data-filter="all"]').classList.add('active');
    
    renderCards();
    updateStats();
}

// ============================================
// FILTRADO
// ============================================

function setFilter(filter) {
    currentFilter = filter;
    
    // Actualizar botones activos
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    renderCards();
}

function getFilteredPeople() {
    if (currentFilter === 'all') {
        return people;
    }
    return people.filter(p => p.status === currentFilter);
}

// ============================================
// RENDERIZADO
// ============================================

function renderCards() {
    const container = document.getElementById('cardsContainer');
    const emptyState = document.getElementById('emptyState');
    
    const filteredPeople = getFilteredPeople();
    
    // Mostrar estado vacío si no hay personas
    if (people.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    // Mostrar mensaje si el filtro no tiene resultados
    if (filteredPeople.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h2>No hay resultados</h2>
                <p>No hay personas con este estado</p>
            </div>
        `;
        return;
    }
    
    // Renderizar tarjetas
    container.innerHTML = filteredPeople.map(person => createPersonCard(person)).join('');
    
    // Agregar event listeners a las tarjetas
    attachCardEventListeners();
}

function createPersonCard(person) {
    const statusClass = person.status; // attended, not-attended, pending
    const statusText = getStatusText(person.status);
    
    return `
        <div class="person-card ${statusClass}">
            <button class="delete-btn" data-id="${person.id}">×</button>
            <div class="person-name">${escapeHtml(person.name)}</div>
            <span class="person-status ${statusClass}">${statusText}</span>
            <div class="person-actions">
                <button 
                    class="btn btn-primary" 
                    data-id="${person.id}" 
                    data-action="attended"
                    ${person.status === 'attended' ? 'disabled' : ''}
                >
                    ✓ Asistió
                </button>
                <button 
                    class="btn btn-danger" 
                    data-id="${person.id}" 
                    data-action="not-attended"
                    ${person.status === 'not-attended' ? 'disabled' : ''}
                >
                    ✗ No asistió
                </button>
            </div>
        </div>
    `;
}

function attachCardEventListeners() {
    // Botones de asistencia
    document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            const action = e.target.dataset.action;
            markAttendance(id, action);
        });
    });
    
    // Botones de eliminar
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            deletePerson(id);
        });
    });
}

// ============================================
// ESTADÍSTICAS
// ============================================

function updateStats() {
    const total = people.length;
    const attended = people.filter(p => p.status === 'attended').length;
    const notAttended = people.filter(p => p.status === 'not-attended').length;
    const pending = people.filter(p => p.status === 'pending').length;
    
    document.getElementById('totalCount').textContent = total;
    document.getElementById('attendedCount').textContent = attended;
    document.getElementById('notAttendedCount').textContent = notAttended;
    document.getElementById('pendingCount').textContent = pending;
}

// ============================================
// EXPORTAR DATOS
// ============================================

function exportData() {
    if (people.length === 0) {
        alert('No hay datos para exportar');
        return;
    }
    
    const dataStr = JSON.stringify(people, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `asistencias_${getFormattedDate()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

// ============================================
// UTILIDADES
// ============================================

function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendiente',
        'attended': 'Asistió',
        'not-attended': 'No asistió'
    };
    return statusMap[status] || 'Pendiente';
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function getFormattedDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}