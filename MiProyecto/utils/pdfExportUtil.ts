import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export interface DocumentLearnerInfo {
  nombre: string;
  documento?: string;
  tipoDocumento?: string;
  correo?: string;
  ficha?: string;
  programa?: string;
  fechaEmision?: string;
  promedioNotas?: string | number;
  porcentajeAsistencia?: string | number;
  codigoVerificacion?: string;
}

/**
 * Genera el diseño HTML institucional de alta resolución para certificados y documentos SENA / AIMS
 */
export function generateDocumentHtml(tipoDocumento: string, data: DocumentLearnerInfo): string {
  const fecha = data.fechaEmision || new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const codigo = data.codigoVerificacion || `SENA-AIMS-${Math.floor(100000 + Math.random() * 900000)}`;
  const nombre = (data.nombre || 'APRENDIZ SENA').toUpperCase();
  const numDoc = data.documento || 'CC. 1.094.821.390';
  const ficha = data.ficha || '2758392';
  const programa = (data.programa || 'TECNÓLOGO EN ANÁLISIS Y DESARROLLO DE SOFTWARE (ADSO)').toUpperCase();

  const isCarne = tipoDocumento.toLowerCase().includes('carné') || tipoDocumento.toLowerCase().includes('carne');

  if (isCarne) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Carné Digital SENA</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f1f5f9;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .carne-card {
      width: 360px;
      background: #ffffff;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      border: 1px solid #cbd5e1;
    }
    .carne-header {
      background: #12103C;
      color: #ffffff;
      padding: 18px 16px;
      text-align: center;
      border-bottom: 4px solid #cfa235;
    }
    .sena-title {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 1.5px;
      margin: 0;
      color: #ffffff;
    }
    .sena-sub {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 3px;
      font-weight: 600;
    }
    .carne-body {
      padding: 22px 20px;
      text-align: center;
    }
    .avatar-box {
      width: 84px;
      height: 84px;
      border-radius: 42px;
      background: #e2e8f0;
      margin: 0 auto 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      color: #12103C;
      font-weight: 800;
      border: 3px solid #cfa235;
    }
    .nombre-apr {
      font-size: 16px;
      font-weight: 700;
      color: #12103C;
      margin: 0 0 6px 0;
    }
    .rol-badge {
      display: inline-block;
      background: #def7ec;
      color: #03543f;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 12px;
      margin-bottom: 16px;
      text-transform: uppercase;
    }
    .info-table {
      width: 100%;
      text-align: left;
      font-size: 12px;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    .info-table td {
      padding: 6px 4px;
      border-bottom: 1px solid #f1f5f9;
    }
    .info-table .lbl {
      color: #64748b;
      font-weight: 600;
      width: 35%;
    }
    .info-table .val {
      color: #0f172a;
      font-weight: 700;
    }
    .qr-section {
      background: #f8fafc;
      padding: 12px;
      border-radius: 10px;
      border: 1px dashed #cbd5e1;
      margin-top: 8px;
    }
    .qr-text {
      font-size: 11px;
      color: #475569;
      font-family: monospace;
      font-weight: 700;
    }
    .carne-footer {
      background: #12103C;
      color: #ffffff;
      padding: 10px;
      text-align: center;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="carne-card">
    <div class="carne-header">
      <div class="sena-title">SENA - AIMS</div>
      <div class="sena-sub">SISTEMA INTELIGENTE DE GESTIÓN ACADÉMICA</div>
    </div>
    <div class="carne-body">
      <div class="avatar-box">${nombre.slice(0, 2)}</div>
      <div class="nombre-apr">${nombre}</div>
      <div class="rol-badge">APRENDIZ EN FORMACIÓN</div>
      <table class="info-table">
        <tr><td class="lbl">DOCUMENTO:</td><td class="val">${numDoc}</td></tr>
        <tr><td class="lbl">FICHA:</td><td class="val">${ficha}</td></tr>
        <tr><td class="lbl">PROGRAMA:</td><td class="val">${programa}</td></tr>
        <tr><td class="lbl">VIGENCIA:</td><td class="val">2026 - ACTIVO</td></tr>
      </table>
      <div class="qr-section">
        <div>VALIDACIÓN DIGITAL QR</div>
        <div class="qr-text">${codigo}</div>
      </div>
    </div>
    <div class="carne-footer">DOCUMENTO DE IDENTIDAD INSTITUCIONAL VÁLIDO</div>
  </div>
</body>
</html>
    `;
  }

  // Certificados o Constancias Académicas Oficiales
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${tipoDocumento}</title>
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      margin: 0;
      padding: 40px;
      color: #1e293b;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .document-page {
      max-width: 720px;
      margin: 0 auto;
      border: 2px solid #12103C;
      padding: 40px 48px;
      position: relative;
    }
    .header-box {
      text-align: center;
      border-bottom: 2px solid #cfa235;
      padding-bottom: 18px;
      margin-bottom: 30px;
    }
    .institution-name {
      font-size: 20px;
      font-weight: bold;
      color: #12103C;
      letter-spacing: 1px;
      margin: 0;
    }
    .sub-name {
      font-size: 13px;
      color: #475569;
      font-style: italic;
      margin-top: 4px;
    }
    .doc-title {
      font-size: 18px;
      font-weight: bold;
      color: #12103C;
      text-transform: uppercase;
      margin: 24px 0 10px 0;
      letter-spacing: 0.8px;
      text-align: center;
    }
    .doc-certifies {
      text-align: center;
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 2px;
      color: #475569;
      margin: 18px 0;
    }
    .body-content {
      font-size: 14px;
      line-height: 1.8;
      text-align: justify;
      color: #1e293b;
      margin-bottom: 26px;
    }
    .highlight-name {
      font-size: 16px;
      font-weight: bold;
      color: #12103C;
      text-align: center;
      margin: 14px 0;
      display: block;
    }
    .details-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
    }
    .details-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      border-bottom: 1px solid #edf2f7;
    }
    .details-row:last-child {
      border-bottom: none;
    }
    .details-label {
      font-weight: 600;
      color: #64748b;
    }
    .details-value {
      font-weight: 700;
      color: #0f172a;
    }
    .signatures-box {
      display: flex;
      justify-content: space-between;
      margin-top: 60px;
      padding-top: 20px;
    }
    .sig-col {
      width: 45%;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .sig-line {
      border-top: 1px solid #12103C;
      margin-bottom: 6px;
    }
    .sig-title {
      font-weight: bold;
      font-size: 12px;
      color: #12103C;
    }
    .sig-sub {
      font-size: 11px;
      color: #64748b;
    }
    .verification-footer {
      margin-top: 40px;
      border-top: 1px dashed #cbd5e1;
      padding-top: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 10px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .qr-badge {
      background: #12103C;
      color: #ffffff;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="document-page">
    <div class="header-box">
      <div class="institution-name">SERVICIO NACIONAL DE APRENDIZAJE - SENA</div>
      <div class="sub-name">Sistema Inteligente de Gestión Académica (AIMS) • Regional Bogotá</div>
    </div>

    <div class="doc-title">${tipoDocumento}</div>
    <div class="doc-certifies">HACE CONSTAR QUE:</div>

    <div class="body-content">
      El (la) aprendiz identificado(a) como:
      <span class="highlight-name">${nombre}</span>
      Identificado(a) con documento de identidad No. <strong>${numDoc}</strong>, se encuentra legalmente matriculado(a) y en estado académico <strong>ACTIVO / EN FORMACIÓN</strong> en las instalaciones de este centro formativo.
    </div>

    <div class="details-box">
      <div class="details-row">
        <span class="details-label">Programa de Formación:</span>
        <span class="details-value">${programa}</span>
      </div>
      <div class="details-row">
        <span class="details-label">Ficha Académica:</span>
        <span class="details-value">${ficha}</span>
      </div>
      <div class="details-row">
        <span class="details-label">Fecha de Expedición:</span>
        <span class="details-value">${fecha}</span>
      </div>
      <div class="details-row">
        <span class="details-label">Estado Académico:</span>
        <span class="details-value">REGULAR / VIGENTE</span>
      </div>
    </div>

    <div class="body-content">
      Se expide la presente constancia a solicitud del interesado(a) a los ${new Date().getDate()} días del mes de ${new Date().toLocaleDateString('es-CO', { month: 'long' })} del año ${new Date().getFullYear()}, para los fines que estime pertinentes.
    </div>

    <div class="signatures-box">
      <div class="sig-col">
        <div class="sig-line"></div>
        <div class="sig-title">COORDINACIÓN ACADÉMICA</div>
        <div class="sig-sub">Centro de Gestión de Mercados y T.I.</div>
      </div>
      <div class="sig-col">
        <div class="sig-line"></div>
        <div class="sig-title">SISTEMA DIGITAL AIMS</div>
        <div class="sig-sub">Verificación de Firma Biométrica</div>
      </div>
    </div>

    <div class="verification-footer">
      <div>Código de Verificación Única: <strong>${codigo}</strong></div>
      <div class="qr-badge">DOCUMENTO VERIFICADO</div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Exporta o comparte un documento en formato PDF tanto en Móvil (Android/iOS) como en Web.
 */
export async function exportPdfDocument(
  docTitle: string,
  learnerData: DocumentLearnerInfo
): Promise<void> {
  const safeTitle = docTitle.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_');
  const filename = `${safeTitle}_SENA.pdf`;
  const html = generateDocumentHtml(docTitle, learnerData);

  if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
    // En Web, abrimos la ventana de impresión con estilos listos para guardar como PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        try {
          printWindow.print();
        } catch {
          // Si el diálogo no abre, descargamos el archivo HTML imprimible
          downloadHtmlFallback(html, filename);
        }
      }, 500);
    } else {
      downloadHtmlFallback(html, filename);
    }
  } else {
    // En Mobile (Android / iOS): compilar a PDF real en caché y abrir selector nativo
    try {
      const { uri } = await Print.printToFileAsync({ html });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: `Descargar o compartir ${filename}`,
        });
      } else {
        throw new Error('El dispositivo no soporta la apertura del diálogo de compartición.');
      }
    } catch (err: any) {
      console.error('Error generando documento PDF nativo:', err);
      throw err;
    }
  }
}

function downloadHtmlFallback(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename.replace('.pdf', '')}_Oficial.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
