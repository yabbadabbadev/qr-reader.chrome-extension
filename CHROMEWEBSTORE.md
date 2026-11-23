# Chrome Web Store Listing — QR Code Reader & Scanner

> Last Updated: 2026-11-23

## Store Listing

**Extension Name** [REQUIRED]
QR Code Reader & Scanner

**Short Description** [REQUIRED]
Escanea códigos QR en pantalla con un solo clic mediante detección automática o recorte manual y gestiona sus acciones en el popup.

**Detailed Description** [REQUIRED]
Escanea y lee cualquier código QR visible en tu navegador con total rapidez y comodidad.

Características principales:
- Activación directa con un clic desde el icono de la barra de herramientas.
- Detección automática que localiza y resalta todos los códigos QR presentes en la pantalla para leerlos con un solo clic.
- Modo de recorte manual para arrastrar el ratón y seleccionar cualquier área específica.
- Funciona sobre imágenes, fotogramas de vídeo (como YouTube), canvas, animaciones y páginas web completas.
- Ventana emergente (popup) inteligente que clasifica el contenido y ofrece acciones inmediatas:
  * Enlaces Web (URLs): Abrir en una pestaña nueva o copiar al portapapeles.
  * Redes Wi-Fi: Visualizar SSID y copiar contraseña directamente.
  * Correos electrónicos: Redactar mensaje o copiar dirección de correo.
  * Teléfonos: Llamar o copiar número telefónico.
  * Texto plano: Previsualizar y copiar con formato.
- Opción de reescaneo rápido para seguir leyendo códigos sin pasos intermedios.
- 100% privado y seguro: el procesamiento se realiza localmente en tu navegador sin enviar datos a servidores externos.

Cómo se utiliza:
1. Pulsa el botón de la extensión en la barra de herramientas del navegador.
2. Haz clic sobre cualquier código QR detectado y resaltado en verde, o arrastra el cursor para recortar un recuadro sobre él.
3. Se abrirá la ventana con el resultado y las opciones correspondientes para abrir el enlace o copiar la información.

Privacidad:
Esta extensión no almacena tus hábitos de navegación ni recopila datos personales. El análisis del código QR ocurre íntegramente en tu dispositivo.

**Category** [REQUIRED]
Productivity

**Single Purpose** [REQUIRED]
Permite detectar y escanear códigos QR visibles en la pantalla del navegador mediante detección automática o recorte manual.

**Primary Language** [REQUIRED]
Spanish

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|---|---|---|---|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `icons/icon-128.png` |
| Screenshot 1 [REQUIRED] | 1280×800 or 640×400 | ✅ Ready | `test/screenshots/01-test-page.png` |
| Screenshot 2 [RECOMMENDED] | 1280×800 or 640×400 | ✅ Ready | `test/screenshots/02-auto-detection-highlight.png` |
| Screenshot 3 [RECOMMENDED] | 1280×800 or 640×400 | ✅ Ready | `test/screenshots/03-manual-crop-selection.png` |
| Screenshot 4 | 1280×800 or 640×400 | ✅ Ready | `test/screenshots/04-popup-ui-result.png` |

## Permissions Justification

| Permission | Type | Justification |
|---|---|---|
| `activeTab` | permissions | Permite capturar la imagen de la pestaña activa únicamente cuando el usuario hace clic en el botón de la extensión para iniciar el escaneo visual de códigos QR. |
| `storage` | permissions | Necesario para almacenar temporalmente el contenido del último código QR escaneado y permitir que la ventana emergente (popup) lo muestre y ejecute sus acciones. |
| `scripting` | permissions | Permite insertar la interfaz visual de selección y el visor de recorte interactivo sobre la pestaña activa cuando el usuario inicia el modo escáner. |

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Distribution
**Visibility**: Public  
**Regions**: All regions

## Version History

| Version | Date | Changes | Status |
|---|---|---|---|
| 1.0.0 | 2026-11-23 | Versión inicial con detección automática, selección manual por recorte y popup dinámico por tipo de contenido. | Ready for Release |
