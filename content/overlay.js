// content/overlay.js
(function () {
  // Evitar duplicados si se llama varias veces
  const existing = document.getElementById('qr-scanner-overlay-root');
  if (existing) existing.remove();

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'START_SELECTION') {
      initScannerOverlay(request.screenshot);
      sendResponse({ status: 'started' });
    }
  });

  async function initScannerOverlay(screenshotDataUrl) {
    const rootHost = document.createElement('div');
    rootHost.id = 'qr-scanner-overlay-root';
    const shadow = rootHost.attachShadow({ mode: 'open' });

    // Estilos CSS encapsulados en el Shadow DOM
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = chrome.runtime.getURL('content/overlay.css');
    shadow.appendChild(styleLink);

    // Fondo oscurecido
    const backdrop = document.createElement('div');
    backdrop.className = 'qr-backdrop';
    shadow.appendChild(backdrop);

    // Barra informativa superior
    const topBar = document.createElement('div');
    topBar.className = 'qr-top-bar';
    topBar.innerHTML = `
      <span>🔍 <strong>Modo Escáner:</strong> Haz clic en un código resaltado o arrastra para recortar</span>
      <button class="qr-close-btn" title="Cerrar (Esc)">✕</button>
    `;
    shadow.appendChild(topBar);

    topBar.querySelector('.qr-close-btn').addEventListener('click', closeOverlay);

    // Cargar imagen de captura en canvas fuera de pantalla
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const img = new Image();

    // 1. Bloquear el scroll de la página para congelar la pantalla con la captura
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // Prevenir eventos de rueda de ratón y desplazamiento táctil sobre el overlay
    let lastWheelTip = 0;
    function onWheelOrTouch(e) {
      e.preventDefault();
      e.stopPropagation();
      const now = Date.now();
      if (now - lastWheelTip > 2000) {
        lastWheelTip = now;
        showToast('ℹ️ Pantalla congelada para escaneo. Pulsa Esc o ✕ para moverte por la página.', shadow);
      }
    }

    rootHost.addEventListener('wheel', onWheelOrTouch, { passive: false });
    rootHost.addEventListener('touchmove', onWheelOrTouch, { passive: false });

    img.onload = async () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      // Factor de escala entre píxeles de imagen y viewport CSS (usando clientWidth para excluir barras de scroll)
      const scaleX = img.naturalWidth / (document.documentElement.clientWidth || window.innerWidth);
      const scaleY = img.naturalHeight / (document.documentElement.clientHeight || window.innerHeight);

      // 1. Detección automática (BarcodeDetector si está disponible, o jsQR)
      await detectAndHighlightAllQRs(canvas, ctx, scaleX, scaleY, shadow, closeOverlay);

      // 2. Selección Manual por recorte (Marquee Crop)
      setupManualCrop(backdrop, canvas, ctx, scaleX, scaleY, shadow, closeOverlay);
    };

    img.src = screenshotDataUrl;

    // Manejador tecla Escape
    function onKeyDown(e) {
      if (e.key === 'Escape') closeOverlay();
    }
    window.addEventListener('keydown', onKeyDown);

    function closeOverlay() {
      window.removeEventListener('keydown', onKeyDown);
      rootHost.removeEventListener('wheel', onWheelOrTouch);
      rootHost.removeEventListener('touchmove', onWheelOrTouch);
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      rootHost.remove();
    }

    document.documentElement.appendChild(rootHost);
  }

  // Detecta códigos en la imagen y dibuja los marcos interactivos
  async function detectAndHighlightAllQRs(canvas, ctx, scaleX, scaleY, shadow, closeOverlay) {
    let foundBoxes = [];

    // Intenta usar BarcodeDetector nativo de Chrome (detecta múltiples códigos simultáneamente)
    if ('BarcodeDetector' in window) {
      try {
        const formats = await BarcodeDetector.getSupportedFormats();
        if (formats.includes('qr_code')) {
          const detector = new BarcodeDetector({ formats: ['qr_code'] });
          const barcodes = await detector.detect(canvas);
          for (const barcode of barcodes) {
            foundBoxes.push({
              data: barcode.rawValue,
              box: {
                x: barcode.boundingBox.x / scaleX,
                y: barcode.boundingBox.y / scaleY,
                width: barcode.boundingBox.width / scaleX,
                height: barcode.boundingBox.height / scaleY
              }
            });
          }
        }
      } catch (err) {
        console.warn('BarcodeDetector no disponible o falló:', err);
      }
    }

    // Fallback o complemento con jsQR si no se detectó ninguno con BarcodeDetector
    if (foundBoxes.length === 0 && typeof jsQR === 'function') {
      try {
        const fullImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(fullImageData.data, fullImageData.width, fullImageData.height);
        if (code && code.data && code.location) {
          const loc = code.location;
          const minX = Math.min(loc.topLeftCorner.x, loc.bottomLeftCorner.x) / scaleX;
          const maxX = Math.max(loc.topRightCorner.x, loc.bottomRightCorner.x) / scaleX;
          const minY = Math.min(loc.topLeftCorner.y, loc.topRightCorner.y) / scaleY;
          const maxY = Math.max(loc.bottomLeftCorner.y, loc.bottomRightCorner.y) / scaleY;

          foundBoxes.push({
            data: code.data,
            box: {
              x: minX,
              y: minY,
              width: maxX - minX,
              height: maxY - minY
            }
          });
        }
      } catch (err) {
        console.warn('jsQR scan falló:', err);
      }
    }

    // Renderiza cada marco detectado
    for (const item of foundBoxes) {
      renderDetectedBox(item.data, item.box, shadow, closeOverlay);
    }
  }

  function renderDetectedBox(text, box, shadow, closeOverlay) {
    const boxEl = document.createElement('div');
    boxEl.className = 'qr-detected-box';
    boxEl.style.left = `${Math.max(box.x - 4, 0)}px`;
    boxEl.style.top = `${Math.max(box.y - 4, 0)}px`;
    boxEl.style.width = `${Math.max(box.width + 8, 32)}px`;
    boxEl.style.height = `${Math.max(box.height + 8, 32)}px`;

    const tag = document.createElement('div');
    tag.className = 'qr-detected-tag';
    tag.textContent = 'QR Detectado — Clic para leer';
    boxEl.appendChild(tag);

    boxEl.addEventListener('click', (e) => {
      e.stopPropagation();
      selectQRCode(text, closeOverlay);
    });

    shadow.appendChild(boxEl);
  }

  function setupManualCrop(backdrop, canvas, ctx, scaleX, scaleY, shadow, closeOverlay) {
    let startX = 0, startY = 0, isDragging = false;
    let marquee = null;

    backdrop.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      marquee = document.createElement('div');
      marquee.className = 'qr-marquee-box';
      marquee.style.left = `${startX}px`;
      marquee.style.top = `${startY}px`;
      shadow.appendChild(marquee);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging || !marquee) return;
      const currentX = e.clientX;
      const currentY = e.clientY;

      const left = Math.min(startX, currentX);
      const top = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);

      marquee.style.left = `${left}px`;
      marquee.style.top = `${top}px`;
      marquee.style.width = `${width}px`;
      marquee.style.height = `${height}px`;
    });

    window.addEventListener('mouseup', async (e) => {
      if (!isDragging) return;
      isDragging = false;

      const currentX = e.clientX;
      const currentY = e.clientY;
      const cropLeft = Math.min(startX, currentX);
      const cropTop = Math.min(startY, currentY);
      const cropWidth = Math.abs(currentX - startX);
      const cropHeight = Math.abs(currentY - startY);

      if (marquee) {
        marquee.remove();
        marquee = null;
      }

      if (cropWidth > 15 && cropHeight > 15) {
        const sx = Math.floor(cropLeft * scaleX);
        const sy = Math.floor(cropTop * scaleY);
        const sw = Math.floor(cropWidth * scaleX);
        const sh = Math.floor(cropHeight * scaleY);

        let decodedText = null;

        // Primero intenta con BarcodeDetector sobre un recorte
        if ('BarcodeDetector' in window) {
          try {
            const cropCanvas = document.createElement('canvas');
            cropCanvas.width = sw;
            cropCanvas.height = sh;
            const cropCtx = cropCanvas.getContext('2d');
            cropCtx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);

            const detector = new BarcodeDetector({ formats: ['qr_code'] });
            const barcodes = await detector.detect(cropCanvas);
            if (barcodes.length > 0) {
              decodedText = barcodes[0].rawValue;
            }
          } catch {}
        }

        // Fallback a jsQR
        if (!decodedText && typeof jsQR === 'function') {
          try {
            const croppedData = ctx.getImageData(sx, sy, sw, sh);
            const code = jsQR(croppedData.data, croppedData.width, croppedData.height);
            if (code && code.data) {
              decodedText = code.data;
            }
          } catch {}
        }

        if (decodedText) {
          selectQRCode(decodedText, closeOverlay);
        } else {
          showToast('No se detectó ningún código QR en la selección. Intenta de nuevo.', shadow);
        }
      }
    });
  }

  function selectQRCode(text, closeOverlay) {
    if (typeof closeOverlay === 'function') {
      closeOverlay();
    } else {
      const root = document.getElementById('qr-scanner-overlay-root');
      if (root) root.remove();
    }

    chrome.runtime.sendMessage({
      action: 'QR_SCANNED',
      text: text
    });
  }

  function showToast(message, shadow) {
    const existing = shadow.querySelector('.qr-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'qr-toast';
    toast.textContent = message;
    shadow.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 2800);
  }
})();
