import { Platform } from 'react-native';

/**
 * Utilidad para exportar datos en formato CSV con soporte de codificación UTF-8 para Excel
 */
export function exportToCsv(filename: string, headers: string[], rows: (string | number | undefined | null)[][]): void {
  // Construir las líneas en formato CSV separadas por coma y entre comillas para evitar rupturas de caracteres
  const csvLines: string[] = [];
  
  // Agregar encabezados
  csvLines.push(headers.map(h => `"${String(h ?? '').replace(/"/g, '""')}"`).join(','));

  // Agregar filas
  rows.forEach(row => {
    const formattedRow = row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',');
    csvLines.push(formattedRow);
  });

  // BOM UTF-8 (\uFEFF) para que Microsoft Excel abra correctamente las tildes y eñes
  const csvContent = '\uFEFF' + csvLines.join('\n');

  if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    // En entorno móvil / simulado, mostramos aviso o fallback de consola
    console.log(`[Export CSV] ${filename}:\n${csvContent}`);
    alert(`Reporte generado con éxito (${filename}). En web se descargará automáticamente.`);
  }
}
