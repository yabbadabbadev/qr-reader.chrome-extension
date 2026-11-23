# QR Code Reader & Scanner (Chrome Extension)

Extensión moderna de Google Chrome construida con **Manifest V3** para escanear y decodificar códigos QR visibles en la pantalla del navegador, con detección automática, selección manual por recorte y acciones contextuales inteligentes.

![Captura del flujo de escaneo](test/screenshots/02-auto-detection-highlight.png)

---

## ✨ Características Principales

1. **Activación con 1 Clic:** Al pulsar el icono en la barra de herramientas, se activa el modo de selección en la pestaña activa.
2. **Detección Automática:** Localiza todos los códigos QR presentes en pantalla mediante `BarcodeDetector` nativo y `jsQR` como motor local, resaltándolos con un marco interactivo clicable.
3. **Selección Manual (Marquee Crop):** Permite pulsar y arrastrar el cursor para recortar con precisión cualquier QR, por pequeño que sea.
4. **Popup con Acciones Inteligentes:** Al seleccionar un código, se abre automáticamente la ventana de la extensión ofreciendo acciones según el contenido:
   - 🔗 **Enlaces Web (URLs):** Abrir en pestaña nueva y copiar enlace al portapapeles.
   - 📶 **Redes Wi-Fi:** Visualizar SSID, mostrar/ocultar contraseña con botón de ojo y copiar clave o datos completos.
   - ✉️ **Correo Electrónico (`mailto:`):** Redactar correo directamente en el cliente predeterminado o copiar dirección.
   - 📞 **Teléfono (`tel:`):** Llamar o copiar número.
   - 📝 **Texto Plano:** Previsualizar texto y copiar con confirmación visual.
5. **Reescaneo Rápido:** Botón *"Escanear otro QR"* en el popup para encadenar lecturas sin pasos intermedios.
6. **Soporte Universal:** Funciona sobre imágenes, páginas web, vídeos (YouTube, Vimeo, etc.), canvas, fondos CSS y documentos PDF.
7. **Privacidad Total:** Procesamiento 100% en local en tu dispositivo, sin envío de datos a servidores externos.

---

## 🛠️ Instalación en Google Chrome (Modo Desarrollador)

Sigue estos sencillos pasos para instalarla en tu navegador:

1. Abre Google Chrome y ve a la barra de direcciones:
   ```text
   chrome://extensions
   ```
2. En la esquina superior derecha, activa el interruptor **"Modo de desarrollador"** (Developer mode).
3. Haz clic en el botón **"Cargar descomprimida"** (Load unpacked) en la esquina superior izquierda.
4. Selecciona la carpeta donde has clonado este repositorio:
   ```text
   /ruta/a/qr-reader.chrome-extension
   ```
5. ¡Listo! La extensión quedará instalada y visible.
   > 💡 **Consejo:** Haz clic en el icono del puzle (Extensiones) de la barra de Chrome y pulsa en la chincheta (pin) para fijar el icono de **Lector QR** en tu barra de herramientas.

### 📄 ¿Quieres escanear PDFs guardados en tu disco local?
Por seguridad de Chrome, las extensiones tienen deshabilitado por defecto el acceso a archivos locales (`file://`). Si deseas escanear PDFs abiertos desde tu disco:
1. En `chrome://extensions`, busca **QR Code Reader & Scanner**.
2. Haz clic en **"Detalles"**.
3. Activa la casilla **"Permitir acceso a URLs de archivo"**.

---

## 🧪 Cómo Probar la Extensión

### Opción A: Prueba Manual en el Navegador
Abre la página de pruebas incluida en este proyecto abriendo el archivo `test/index.html` en Chrome:
```text
file:///ruta/a/qr-reader.chrome-extension/test/index.html
```
Encontrarás 6 muestras de códigos QR reales (URL, Wi-Fi, Email, Teléfono, Texto y un banner con degradado complejo).
1. Haz clic en el icono de la extensión.
2. Observa cómo los códigos se resaltan automáticamente en verde.
3. Haz clic en uno o arrastra para recortar manualmente.
4. Comprueba las opciones del popup.

### Opción B: Ejecutar la Verificación Autónoma
Puedes ejecutar en cualquier momento la suite de pruebas automatizada con Chrome:
```bash
node test/autonomous-verify.js
```
El script lanzará una instancia limpia de Google Chrome, conectará con el protocolo DevTools (CDP), probará el escaneo automático y manual, y generará capturas de pantalla de evidencia en `test/screenshots/`.

---

## 📁 Estructura del Proyecto

```text
qr-reader.chrome-extension/
├── manifest.json              # Configuración Manifest V3
├── background.js              # Service Worker (captura visible, almacenamiento y apertura de popup)
├── content/
│   ├── overlay.js             # Content script con Shadow DOM y lógica de detección/recorte
│   └── overlay.css            # Estilos aislados del overlay
├── popup/
│   ├── popup.html             # Interfaz del popup
│   ├── popup.js               # Controlador de acciones inteligentes
│   └── popup.css              # Estilos responsivos con soporte para modo oscuro
├── lib/
│   ├── jsqr.js                # Motor de decodificación QR sin dependencias de red
│   └── qr-parser.js           # Parser clasificador de tipos de contenido QR
├── icons/                     # Iconos oficiales (16x16, 48x48, 128x128)
├── test/
│   ├── index.html             # Página de prueba con códigos QR
│   ├── autonomous-verify.js   # Script de pruebas autónomas con Chrome CDP
│   └── screenshots/           # Capturas de evidencia generadas durante las pruebas
├── docs/                      # Especificación técnica y planes de implementación
└── CHROMEWEBSTORE.md          # Metadatos para publicación en la Chrome Web Store
```
