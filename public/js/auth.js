// ==================== AUTENTICACIÓN ====================
import { supabase } from './config.js';

// Verificar si ya hay una sesión activa al cargar
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        // Si ya está logueado, redirigir al dashboard
        window.location.href = '/public/views/dashboard.html';
    }
});

// Manejo del formulario de login
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Limpiar mensajes de error previos
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';
    
    // Deshabilitar botón durante el login
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Iniciando sesión...';
    
    try {
        // Intentar iniciar sesión con Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        
        if (error) {
            throw error;
        }
        
        // Login exitoso
        console.log('Login exitoso:', data);
        
        // Redirigir al dashboard
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        console.error('Error en login:', error);
        
        // Mostrar mensaje de error al usuario
        errorMessage.style.display = 'block';
        
        if (error.message.includes('Invalid login credentials')) {
            errorMessage.textContent = 'Correo o contraseña incorrectos';
        } else if (error.message.includes('Email not confirmed')) {
            errorMessage.textContent = 'Por favor confirma tu correo electrónico';
        } else {
            errorMessage.textContent = 'Error al iniciar sesión. Inténtalo de nuevo.';
        }
        
        // Rehabilitar botón
        submitBtn.disabled = false;
        submitBtn.textContent = 'Iniciar Sesión';
    }
});

// Función para cerrar sesión (se usará en dashboard)
export async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        // Redirigir al login
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        alert('Error al cerrar sesión');
    }
}