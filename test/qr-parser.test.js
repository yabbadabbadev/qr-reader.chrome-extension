const assert = require('assert');
const { parseQRCode } = require('../lib/qr-parser.js');

// Test 1: URL http/https
const urlRes = parseQRCode('https://github.com/yabbadabbadev');
assert.strictEqual(urlRes.type, 'URL');
assert.strictEqual(urlRes.data.url, 'https://github.com/yabbadabbadev');
assert.strictEqual(urlRes.actions.includes('open_url'), true);

// Test 2: Red Wi-Fi
const wifiRes = parseQRCode('WIFI:T:WPA;S:MiFibra-1234;P:SuperSecretPass;;');
assert.strictEqual(wifiRes.type, 'WIFI');
assert.strictEqual(wifiRes.data.ssid, 'MiFibra-1234');
assert.strictEqual(wifiRes.data.password, 'SuperSecretPass');
assert.strictEqual(wifiRes.data.authType, 'WPA');

// Test 3: Email mailto
const emailRes = parseQRCode('mailto:soporte@example.com?subject=Hola');
assert.strictEqual(emailRes.type, 'EMAIL');
assert.strictEqual(emailRes.data.email, 'soporte@example.com');

// Test 4: Teléfono
const telRes = parseQRCode('tel:+34912345678');
assert.strictEqual(telRes.type, 'TEL');
assert.strictEqual(telRes.data.phone, '+34912345678');

// Test 5: Texto general
const textRes = parseQRCode('Mensaje de prueba con texto simple');
assert.strictEqual(textRes.type, 'TEXT');
assert.strictEqual(textRes.data.text, 'Mensaje de prueba con texto simple');

console.log('Todos los tests de parseQRCode pasaron correctamente.');
