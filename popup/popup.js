// popup/popup.js
document.addEventListener('DOMContentLoaded', async () => {
  const resultView = document.getElementById('result-view');
  const emptyView = document.getElementById('empty-view');
  const contentCard = document.getElementById('content-card');
  const actionButtons = document.getElementById('action-buttons');
  const qrBadge = document.getElementById('qr-badge');
  const btnRescan = document.getElementById('btn-rescan');
  const btnStartScan = document.getElementById('btn-start-scan');

  // Consulta el último escaneo en chrome.storage.local
  const { lastScannedQR } = await chrome.storage.local.get('lastScannedQR');

  if (lastScannedQR && lastScannedQR.rawText) {
    emptyView.classList.add('hidden');
    resultView.classList.remove('hidden');
    renderScannedResult(lastScannedQR.rawText);
  } else {
    resultView.classList.add('hidden');
    emptyView.classList.remove('hidden');
    btnRescan.classList.add('hidden');
  }

  // Eventos para escanear otro QR
  btnRescan.addEventListener('click', triggerRescan);
  btnStartScan.addEventListener('click', triggerRescan);

  async function triggerRescan() {
    await chrome.runtime.sendMessage({ action: 'RESTART_SCAN' });
    window.close();
  }

  function renderScannedResult(rawText) {
    const parsed = QRParser.parseQRCode(rawText);
    qrBadge.textContent = parsed.type;

    contentCard.innerHTML = '';
    actionButtons.innerHTML = '';

    if (parsed.type === 'URL') {
      contentCard.innerHTML = `
        <div style="font-weight: 600; color: var(--primary); margin-bottom: 4px;">Enlace detectado:</div>
        <div style="word-break: break-all; font-family: monospace; font-size: 12px;">${escapeHTML(parsed.data.url)}</div>
      `;

      const btnOpen = createButton('🔗 Abrir en pestaña nueva', 'btn-primary', () => {
        if (/^https?:\/\//i.test(parsed.data.url)) {
          chrome.tabs.create({ url: parsed.data.url });
        }
      });
      const btnCopy = createButton('📋 Copiar enlace', 'btn-secondary', (btn) => {
        copyToClipboard(parsed.data.url, btn);
      });
      actionButtons.appendChild(btnOpen);
      actionButtons.appendChild(btnCopy);
    } else if (parsed.type === 'WIFI') {
      contentCard.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 6px;">📶 Credenciales Wi-Fi</div>
        <div><strong>SSID:</strong> ${escapeHTML(parsed.data.ssid)}</div>
        <div style="margin-top: 4px;"><strong>Seguridad:</strong> ${escapeHTML(parsed.data.authType)}</div>
        <div style="margin-top: 4px;">
          <strong>Contraseña:</strong> <span id="wifi-pass">••••••••</span> 
          <button id="btn-toggle-pass" style="background:none;border:none;cursor:pointer;color:var(--primary);font-size:11px;font-weight:600;margin-left:4px;">(Mostrar)</button>
        </div>
      `;

      let passVisible = false;
      contentCard.querySelector('#btn-toggle-pass').addEventListener('click', (e) => {
        passVisible = !passVisible;
        contentCard.querySelector('#wifi-pass').textContent = passVisible ? parsed.data.password : '••••••••';
        e.target.textContent = passVisible ? '(Ocultar)' : '(Mostrar)';
      });

      const btnCopyPass = createButton('🔑 Copiar contraseña', 'btn-primary', (btn) => {
        copyToClipboard(parsed.data.password, btn);
      });
      const btnCopyAll = createButton('📋 Copiar datos completos', 'btn-secondary', (btn) => {
        copyToClipboard(`Red: ${parsed.data.ssid}\nContraseña: ${parsed.data.password}\nSeguridad: ${parsed.data.authType}`, btn);
      });
      actionButtons.appendChild(btnCopyPass);
      actionButtons.appendChild(btnCopyAll);
    } else if (parsed.type === 'EMAIL') {
      contentCard.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 4px;">✉️ Correo electrónico</div>
        <div><strong>Para:</strong> ${escapeHTML(parsed.data.email)}</div>
        ${parsed.data.subject ? `<div style="margin-top: 4px;"><strong>Asunto:</strong> ${escapeHTML(parsed.data.subject)}</div>` : ''}
      `;
      const cleanEmail = encodeURIComponent(parsed.data.email.trim());
      const safeMailto = `mailto:${cleanEmail}${parsed.data.subject ? `?subject=${encodeURIComponent(parsed.data.subject)}` : ''}`;
      const btnSend = createButton('✉️ Redactar correo', 'btn-primary', () => {
        chrome.tabs.create({ url: safeMailto });
      });
      const btnCopy = createButton('📋 Copiar dirección', 'btn-secondary', (btn) => {
        copyToClipboard(parsed.data.email, btn);
      });
      actionButtons.appendChild(btnSend);
      actionButtons.appendChild(btnCopy);
    } else if (parsed.type === 'TEL') {
      contentCard.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 4px;">📞 Número de teléfono</div>
        <div style="font-size: 14px; font-weight: 600;">${escapeHTML(parsed.data.phone)}</div>
      `;
      const cleanPhone = encodeURIComponent(parsed.data.phone.replace(/[^0-9+*#]/g, ''));
      const btnCall = createButton('📞 Llamar', 'btn-primary', () => {
        chrome.tabs.create({ url: `tel:${cleanPhone}` });
      });
      const btnCopy = createButton('📋 Copiar número', 'btn-secondary', (btn) => {
        copyToClipboard(parsed.data.phone, btn);
      });
      actionButtons.appendChild(btnCall);
      actionButtons.appendChild(btnCopy);
    } else {
      // TEXT
      contentCard.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 4px;">📝 Contenido de texto:</div>
        <pre style="margin: 0; white-space: pre-wrap; font-family: inherit; font-size: 13px;">${escapeHTML(parsed.data.text)}</pre>
      `;
      const btnCopy = createButton('📋 Copiar texto', 'btn-primary', (btn) => {
        copyToClipboard(parsed.data.text, btn);
      });
      actionButtons.appendChild(btnCopy);
    }
  }

  function createButton(label, className, onClick) {
    const btn = document.createElement('button');
    btn.className = `btn ${className}`;
    btn.textContent = label;
    btn.addEventListener('click', () => onClick(btn));
    return btn;
  }

  async function copyToClipboard(text, btn) {
    try {
      await navigator.clipboard.writeText(text);
      const originalText = btn.textContent;
      btn.textContent = '✓ ¡Copiado!';
      btn.classList.add('btn-success');
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('btn-success');
      }, 1500);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  }

  function escapeHTML(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
});
