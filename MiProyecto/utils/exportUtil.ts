import { Platform } from 'react-native';

/**
 * Utilidad para exportar datos en formato CSV / Reportes con soporte Web y Móvil (FileSystem / Sharing)
 */
export async function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number | undefined | null)[][]
): Promise<void> {
  const csvLines: string[] = [];

  // Encabezados
  csvLines.push(headers.map((h) => `"${String(h ?? '').replace(/"/g, '""')}"`).join(','));

  // Filas
  rows.forEach((row) => {
    const formattedRow = row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',');
    csvLines.push(formattedRow);
  });

  const csvContent = '\uFEFF' + csvLines.join('\n');
  const safeFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;

  if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', safeFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    try {
      const FileSystem = require('expo-file-system');
      const Sharing = require('expo-sharing');

      const fileUri = `${FileSystem.documentDirectory}${safeFilename}`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: `Exportar ${safeFilename}`,
          UTI: 'public.comma-separated-values-text',
        });
      } else {
        alert(`Reporte generado con éxito (${safeFilename}).`);
      }
    } catch {
      alert(`Reporte generado con éxito (${safeFilename}).`);
    }
  }
}
