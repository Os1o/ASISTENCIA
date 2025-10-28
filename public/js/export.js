// ==================== EXPORTAR A EXCEL ====================

export async function exportToExcel(personas, asistencias) {
    // Preparar datos para exportar
    const data = [];
    
    // Recorrer cada persona y sus asistencias
    personas.forEach(persona => {
        // Buscar asistencias del Día 1
        const asistenciaDia1 = asistencias.find(a => 
            a.persona_id === persona.id && a.dia === 1
        );
        
        // Buscar asistencias del Día 2
        const asistenciaDia2 = asistencias.find(a => 
            a.persona_id === persona.id && a.dia === 2
        );
        
        // Agregar fila con todos los datos
        data.push({
            'Nombre': persona.nombre,
            'OOAD': persona.ooad,
            'Día 1 - Entrada': formatDateTime(asistenciaDia1?.entrada),
            'Día 1 - Salida': formatDateTime(asistenciaDia1?.salida),
            'Día 2 - Entrada': formatDateTime(asistenciaDia2?.entrada),
            'Día 2 - Salida': formatDateTime(asistenciaDia2?.salida),
        });
    });
    
    // Crear hoja de cálculo con SheetJS
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Ajustar anchos de columna
    const columnWidths = [
        { wch: 30 }, // Nombre
        { wch: 25 }, // OOAD
        { wch: 20 }, // Día 1 - Entrada
        { wch: 20 }, // Día 1 - Salida
        { wch: 20 }, // Día 2 - Entrada
        { wch: 20 }, // Día 2 - Salida
    ];
    worksheet['!cols'] = columnWidths;
    
    // Crear libro de trabajo
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asistencias');
    
    // Generar nombre de archivo con fecha
    const now = new Date();
    const fileName = `Asistencias_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.xlsx`;
    
    // Descargar archivo
    XLSX.writeFile(workbook, fileName);
    
    console.log('Archivo exportado:', fileName);
}

function formatDateTime(timestamp) {
    if (!timestamp) return 'Sin registrar';
    
    const date = new Date(timestamp);
    return date.toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}