# MLBB Vault — Skin Tracker

Tracker web instalable (PWA) para planificar el ahorro de Mobile Legends: Bang Bang.

## Incluye
- Fondo global compartido: diamantes, pases, días pendientes y precio del pase.
- Tres calculadoras independientes: evento Legend, Aspirants (con patrón previsto de 6) y colaboración Jujutsu Kaisen.
- **Objetivo prioritario de ahorro**: asigna el saldo global a una sola pestaña para evitar contabilizar los mismos diamantes en varios objetivos.
- Recalculo automático en las tres pestañas al modificar la billetera global.
- Guardado automático local en el navegador (`localStorage`).
- Interfaz adaptable a móvil y escritorio, instalación como aplicación y soporte offline básico.
- Preparado para publicar en GitHub Pages.

## Publicar en GitHub Pages
1. Crea un repositorio público en GitHub, por ejemplo `mlbb-vault`.
2. Sube todos los archivos de esta carpeta a la raíz del repositorio.
3. En **Settings → Pages**, selecciona **Deploy from a branch**, elige `main` y `/ (root)`, y guarda.
4. Espera a que GitHub Pages publique el sitio. Abre la URL HTTPS desde Chrome en Android.
5. En el menú del navegador, selecciona **Instalar aplicación** o **Añadir a pantalla de inicio**.

## Uso
- Edita los valores de **Billetera global** una sola vez; las tres pestañas usan el mismo saldo.
- Selecciona un objetivo prioritario en el panel global. Solo esa pestaña descuenta los diamantes disponibles y las recompensas pendientes estimadas; las otras dos muestran su déficit sin apropiarse del mismo saldo.
- Cambiar el objetivo prioritario reasigna el fondo global automáticamente. Es una planificación, no una reserva real dentro del juego.
- Ajusta las metas de diamantes, tickets, tiradas y costes cuando se anuncien las reglas del evento real.
- La app no se conecta a los servidores de MLBB ni realiza compras.

## Supuestos y límites
- El pase semanal se modela como 220 diamantes en 7 días.
- Los diamantes pendientes del pase activo se estiman como 20 por día restante. Ajusta el campo de días a lo que te falte reclamar; no es una lectura automática del juego.
- Los resultados de eventos y patrones son estimaciones editables, no garantías. Los patrones comunitarios no permiten predecir de forma fiable un resultado aleatorio.
- El precio del pase inicia en US$2.06 porque es el valor mostrado en la captura de referencia; puede cambiar por región, impuestos o plataforma.
- Proyecto fan-made, no afiliado a Moonton.
