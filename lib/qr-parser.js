// lib/qr-parser.js
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.QRParser = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function parseQRCode(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      return { type: 'TEXT', raw: '', data: { text: '' }, actions: ['copy'] };
    }
    const trimmed = rawText.trim();

    // 1. Wi-Fi: WIFI:T:WPA;S:SSID;P:PASSWORD;;
    if (/^WIFI:/i.test(trimmed)) {
      const ssidMatch = trimmed.match(/S:([^;]+)/i);
      const passMatch = trimmed.match(/P:([^;]+)/i);
      const typeMatch = trimmed.match(/T:([^;]+)/i);
      const hiddenMatch = trimmed.match(/H:([^;]+)/i);

      return {
        type: 'WIFI',
        raw: trimmed,
        title: 'Red Wi-Fi',
        data: {
          ssid: ssidMatch ? ssidMatch[1] : '',
          password: passMatch ? passMatch[1] : '',
          authType: typeMatch ? typeMatch[1] : 'WPA',
          hidden: hiddenMatch ? hiddenMatch[1] === 'true' : false
        },
        actions: ['copy_password', 'copy_all']
      };
    }

    // 2. Email: mailto:user@domain.com or MATMSG:
    if (/^mailto:/i.test(trimmed)) {
      try {
        const parsedUrl = new URL(trimmed);
        return {
          type: 'EMAIL',
          raw: trimmed,
          title: 'Correo Electrónico',
          data: {
            email: parsedUrl.pathname,
            subject: parsedUrl.searchParams.get('subject') || '',
            body: parsedUrl.searchParams.get('body') || ''
          },
          actions: ['send_email', 'copy_email']
        };
      } catch {
        const email = trimmed.replace(/^mailto:/i, '').split('?')[0];
        return {
          type: 'EMAIL',
          raw: trimmed,
          title: 'Correo Electrónico',
          data: { email, subject: '', body: '' },
          actions: ['send_email', 'copy_email']
        };
      }
    }

    // 3. Teléfono: tel:+123456789
    if (/^tel:/i.test(trimmed)) {
      const phone = trimmed.replace(/^tel:/i, '');
      return {
        type: 'TEL',
        raw: trimmed,
        title: 'Número de Teléfono',
        data: { phone },
        actions: ['call', 'copy_phone']
      };
    }

    // 4. URL: http://, https://, o ftp://
    if (/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(trimmed)) {
      return {
        type: 'URL',
        raw: trimmed,
        title: 'Enlace Web',
        data: { url: trimmed },
        actions: ['open_url', 'copy_url']
      };
    }

    // 5. Texto Plano por defecto
    return {
      type: 'TEXT',
      raw: trimmed,
      title: 'Texto Plano',
      data: { text: trimmed },
      actions: ['copy_text']
    };
  }

  return { parseQRCode };
});
