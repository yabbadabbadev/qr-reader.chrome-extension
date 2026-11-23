// background.js

// Escucha el clic sobre la acción de la barra de herramientas cuando no hay popup configurado
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab || !tab.id) return;
  await startScanningFlow(tab);
});

async function startScanningFlow(tab) {
  try {
    // 1. Captura la pestaña visible en formato PNG
    const screenshotUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });

    // 2. Inyecta overlay y scripts en la pestaña activa
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ['content/overlay.css']
    });

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['lib/jsqr.js', 'content/overlay.js']
    });

    // 3. Envía el mensaje para activar el overlay con la captura
    await chrome.tabs.sendMessage(tab.id, {
      action: 'START_SELECTION',
      screenshot: screenshotUrl
    });
  } catch (err) {
    console.error('Error al iniciar modo escaneo:', err);
  }
}

// Escucha mensajes desde el overlay o desde el popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'QR_SCANNED') {
    (async () => {
      // Guarda en storage el resultado
      await chrome.storage.local.set({
        lastScannedQR: {
          rawText: message.text,
          scannedAt: Date.now()
        }
      });

      // Configura y abre el popup
      await chrome.action.setPopup({ popup: 'popup/popup.html' });

      // Abre el popup automáticamente en Chrome
      try {
        if (sender.tab && sender.tab.windowId) {
          await chrome.windows.update(sender.tab.windowId, { focused: true });
        }
        await chrome.action.openPopup();
      } catch (err) {
        console.warn('chrome.action.openPopup falló o requiere gesto en este entorno:', err);
      }

      sendResponse({ success: true });
    })();
    return true; // Mantiene el canal abierto para la respuesta asíncrona
  }

  if (message.action === 'RESTART_SCAN') {
    (async () => {
      // Restablece acción para que el siguiente clic vuelva a capturar
      await chrome.action.setPopup({ popup: '' });
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        await startScanningFlow(tab);
      }
      sendResponse({ success: true });
    })();
    return true;
  }
});
