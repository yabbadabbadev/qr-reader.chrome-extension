// scripts/generate-test-page.js
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

async function generateTestPage() {
  const testDir = path.join(__dirname, '..', 'test');
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

  const qrSamples = [
    {
      id: 'qr-url',
      title: '1. Enlace Web (URL)',
      desc: 'Al escanearlo, ofrecerá abrir en pestaña nueva o copiar el enlace.',
      value: 'https://github.com/yabbadabbadev/qr-reader.chrome-extension'
    },
    {
      id: 'qr-wifi',
      title: '2. Red Wi-Fi (WIFI:...)',
      desc: 'Ofrecerá mostrar/ocultar contraseña, copiar clave y copiar credenciales completas.',
      value: 'WIFI:S:DemoWiFi_5G;T:WPA;P:SuperPasswordDemo123!;;'
    },
    {
      id: 'qr-email',
      title: '3. Correo Electrónico (mailto:)',
      desc: 'Ofrecerá redactar correo al destinatario o copiar dirección.',
      value: 'mailto:demo@example.com?subject=Prueba%20QR%20Reader&body=Hola!'
    },
    {
      id: 'qr-phone',
      title: '4. Teléfono (tel:)',
      desc: 'Ofrecerá llamar al número o copiarlo al portapapeles.',
      value: 'tel:+34912345678'
    },
    {
      id: 'qr-text',
      title: '5. Texto Plano',
      desc: 'Texto formateado para previsualizar y copiar directamente.',
      value: 'Este es un código QR de prueba con texto plano escaneado exitosamente.'
    }
  ];

  let cardsHtml = '';
  for (const sample of qrSamples) {
    const dataUrl = await QRCode.toDataURL(sample.value, {
      width: 220,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' }
    });

    cardsHtml += `
      <div class="qr-card" id="${sample.id}">
        <h3>${sample.title}</h3>
        <p class="desc">${sample.desc}</p>
        <div class="qr-img-wrapper">
          <img src="${dataUrl}" alt="${sample.title}" class="qr-image">
        </div>
        <div class="value-preview">
          <code>${escapeHTML(sample.value)}</code>
        </div>
      </div>
    `;
  }

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Página de Pruebas: QR Code Reader Extension</title>
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --card-border: #334155;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #4f46e5;
      --accent: #10b981;
    }
    body {
      margin: 0;
      padding: 40px 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .header {
      text-align: center;
      max-width: 800px;
      margin-bottom: 40px;
    }
    .header h1 {
      font-size: 32px;
      margin: 0 0 12px 0;
      color: #ffffff;
    }
    .badge-test {
      display: inline-block;
      background: rgba(79, 70, 229, 0.2);
      color: #818cf8;
      border: 1px solid #6366f1;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .instructions {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 18px 24px;
      margin-bottom: 30px;
      line-height: 1.6;
      font-size: 15px;
      color: var(--text-muted);
    }
    .instructions strong {
      color: var(--text);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      max-width: 1000px;
      width: 100%;
    }
    .qr-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      transition: transform 0.2s, border-color 0.2s;
    }
    .qr-card:hover {
      transform: translateY(-3px);
      border-color: var(--primary);
    }
    .qr-card h3 {
      font-size: 17px;
      margin: 0 0 8px 0;
      color: #ffffff;
    }
    .desc {
      font-size: 12px;
      color: var(--text-muted);
      margin: 0 0 16px 0;
      min-height: 34px;
    }
    .qr-img-wrapper {
      background: #ffffff;
      padding: 12px;
      border-radius: 10px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
      margin-bottom: 16px;
    }
    .qr-image {
      display: block;
      width: 180px;
      height: 180px;
    }
    .value-preview {
      width: 100%;
      background: rgba(15, 23, 42, 0.6);
      border-radius: 6px;
      padding: 8px;
      overflow-x: auto;
      font-size: 11px;
      color: #94a3b8;
    }
    .value-preview code {
      word-break: break-all;
    }
    /* Sección simulada de banner / fotograma con QR */
    .banner-section {
      max-width: 1000px;
      width: 100%;
      margin-top: 40px;
      background: linear-gradient(135deg, #1e1b4b, #311042);
      border: 1px solid #4338ca;
      border-radius: 14px;
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }
    .banner-text h4 {
      font-size: 20px;
      margin: 0 0 8px 0;
      color: #fff;
    }
    .banner-text p {
      margin: 0;
      color: #c7d2fe;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="badge-test">Entorno de Pruebas</div>
    <h1>Extensión Chrome: Lector de Códigos QR</h1>
    <div class="instructions">
      👉 <strong>Instrucciones de prueba:</strong><br>
      1. Pulsa el botón de la extensión en la barra superior para entrar en <strong>Modo Selección</strong>.<br>
      2. <strong>Detección Automática:</strong> Verás que la extensión resalta automáticamente los códigos QR presentes con un recuadro verde iluminado. Haz clic en cualquiera para seleccionarlo.<br>
      3. <strong>Selección Manual:</strong> Haz clic y arrastra con el ratón sobre cualquier área para recortar manualmente.<br>
      4. El <strong>popup.html</strong> se abrirá con el tipo de datos detectado y botones de acción (abrir pestaña, copiar texto, copiar clave wifi, etc.).
    </div>
  </div>

  <div class="grid">
    ${cardsHtml}
  </div>

  <div class="banner-section">
    <div class="banner-text">
      <h4>🎬 Simulación de Fotograma / Vídeo</h4>
      <p>Este código QR está integrado en un banner con degradado complejo para verificar que la captura y detección de píxeles funciona sobre cualquier fondo o animación.</p>
    </div>
    <div class="qr-img-wrapper" style="margin: 0;">
      <img src="${await QRCode.toDataURL('https://youtube.com', { width: 140, margin: 1 })}" class="qr-image" style="width: 120px; height: 120px;" alt="Banner QR">
    </div>
  </div>
</body>
</html>`;

  const outputPath = path.join(testDir, 'index.html');
  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`Test page generated at: ${outputPath}`);
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

generateTestPage().catch(err => {
  console.error(err);
  process.exit(1);
});
