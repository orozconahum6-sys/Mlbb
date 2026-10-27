# MLBB Vault — Skin Tracker v3

Tracker web instalable (PWA) para planificar el ahorro de Mobile Legends: Bang Bang.

## Novedades v3
- **Ciclo de pase en tiempo real:** registra la hora del próximo reclamo y calcula los días transcurridos aunque la app esté cerrada.
- Cada día vencido con pase activo suma automáticamente **20 diamantes** al saldo real guardado y reduce un día pendiente.
- Cuando los días llegan a cero, la app pregunta si compraste un pase nuevo y cuántos.
- **Compra durante un ciclo activo:** suma 80 diamantes por pase y añade 7 días por pase; no vuelve a sumar los 20 del día ya reclamado.
- **Compra con el contador en cero:** suma 80 por pase y 20 del día una sola vez; el contador queda en `7 × pases − 1` días pendientes porque el reclamo del día se contabilizó al comprar.
- Botón manual para registrar pases en cualquier momento, con la misma lógica de compra.
- Navegación lateral en escritorio y barra lateral desplazable en móvil; interfaz visual renovada.
- Se conserva la selección de objetivo prioritario y los tres escenarios independientes.

## Publicar en GitHub Pages
1. Descarga y descomprime el ZIP.
2. Sube los siete archivos de `mlbb-vault` a la raíz del repositorio GitHub (reemplaza los anteriores).
3. En **Settings → Pages**, selecciona **Deploy from a branch**, `main` y `/ (root)`.
4. Abre el sitio publicado en HTTPS y recarga. Si ya estaba instalada, cierra y vuelve a abrir la PWA para que tome el nuevo caché.

## Importante sobre el conteo
El navegador no puede verificar compras ni reclamos reales con los servidores de MLBB. El contador usa el reloj del dispositivo y avanza por periodos de 24 horas desde la próxima fecha estimada de reclamo. Mantén la fecha y hora del teléfono correctas. La aplicación solo simula y registra los valores que confirmes.

El pase se modela con 80 diamantes inmediatos y 20 por reclamo diario durante siete días (220 en total). Si la compra ocurre con el ciclo en cero, se contabilizan 80 + 20 del día y se dejan seis días de reclamo pendientes para un pase; con el ciclo activo, la compra no duplica el reclamo del día. Ajusta el saldo inicial al saldo real de tu cuenta.

## Funciones
- Billetera global compartida: saldo actual, pases registrados, días restantes y precio del pase.
- Objetivos Legend, Aspirantes y Jujutsu Kaisen.
- Objetivo prioritario para no descontar el mismo saldo en varias pestañas.
- Guardado automático local y soporte offline básico.
- Sin inicio de sesión, compras ni integración directa con MLBB.
