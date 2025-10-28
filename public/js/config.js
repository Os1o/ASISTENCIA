// ==================== CONFIGURACIÓN DE SUPABASE ====================
// IMPORTANTE: Reemplaza estos valores con tus credenciales reales de Supabase
// Los encuentras en: Project Settings → API

const SUPABASE_URL = 'https://ncirylmidywsglanduve.supabase.co'; // Ejemplo: https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jaXJ5bG1pZHl3c2dsYW5kdXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1ODI2MzQsImV4cCI6MjA3NzE1ODYzNH0.DdBurKIme1dmwgAZfdBFP04Pjf7cJVBOV1Vvsj3hu2E'; // Ejemplo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Inicializar cliente de Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exportar para uso en otros archivos
export { supabase };