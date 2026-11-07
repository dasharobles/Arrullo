# Administrador de Arrullo

Panel en `http://localhost:4317/admin.html` cuando la tienda esté iniciada. También se accede desde **Administración** al pie de la tienda o al iniciar sesión con una cuenta ADMIN.

## Funciones

- Resumen de ventas acumuladas, pedidos pagados, unidades y variantes con stock bajo.
- Inventario con búsqueda, categoría, edición de precio, stock y visibilidad de variantes (incluye pausadas).
- Alta de prendas con 3–4 imágenes y variantes de talla/color mediante campos, sin escribir JSON.
- Gestión de los 200 pedidos más recientes, estado, guía y avance de envío.
- Comprobante de empaque imprimible que respeta la opción de ocultar precios.
- Alertas de reposición: stock menor o igual al mínimo, configurable con `ADMIN_STOCK_MINIMUM` (por defecto 5).

## Microservicios utilizados

Se conservaron los servicios de login y seguimiento de envíos ya integrados. El módulo `services/admin-service/administracion.js` adapta consultas de **CRUD INVENTARIO**, la regla de **AlertaStockMinimo** y el criterio de agregación de **servicio-reporte-compras**. El alta con formulario toma como base el flujo de **soa-agregar-producto**, transformado al contrato de prendas, fotografías y variantes existente.

Las referencias de código utilizadas se conservan en `services/admin-service/referencias/`. Estas adaptaciones se ejecutan dentro del servidor Node de Arrullo; no se levantaron nuevos procesos .NET ni una segunda base con tablas de productos incompatibles. El reporte se adaptó de compras a ventas, no representa compras a proveedores.

## Inicio y acceso

Desde `tienda-online`, instalar las dependencias con `npm ci`, completar la configuración indicada en `.env.example` y ejecutar `npm start`. Se necesitan MySQL y, cuando estén configurados, los servicios de login y envíos existentes.

Usa una cuenta administrativa existente. Si todavía no existe, el servicio de login incluye `scripts/crear-admin-arrullo.js` y su documentación de configuración. No se creó una contraseña predeterminada ni se alteraron cuentas. No se imprime ni guarda ninguna credencial nueva.

## Verificación del cambio

- Comprobación de sintaxis de servidor, tienda y administrador: correcta.
- 3 pruebas del módulo: regla de mínimo inclusiva, variantes pausadas/productos vacíos y reporte sin duplicar ventas: correctas.
- 12 comprobaciones HTTP de acceso (sin sesión, cliente, administrador) y rechazo de estado inválido junto con guía: correctas con base de datos sustituida.
- Revisión en navegador de acceso, resumen, inventario, pedidos y formulario: realizada con datos ficticios en un servidor aislado. Sin errores de JavaScript registrados.
- No se ejecutaron las pruebas de integración sobre MySQL ni el flujo real de login/envíos: requieren dependencias y servicios configurados. No se afirma validación integral.
- La cancelación conserva el comportamiento previo: no repone stock ni realiza reembolso. Los pagos siguen siendo de demostración.

Prueba del módulo: `node --test services/admin-service/administracion.test.js`.

## Revisión antes del hosting

Iniciar el entorno real, entrar con ADMIN, revisar una variante de prueba, dar de alta una prenda, actualizar un pedido de prueba y revisar el comprobante. Después se puede continuar con el hosting. No se publicó esta versión.

 Prueba HTTP reproducible con base sustituida: `node services/admin-service/api-access.test.cjs`.

## Arranque local recuperado — 2026-11-06

Desde tienda-online ejecuta `npm.cmd start`. Con LOCAL_SERVICES=true, inicia MySQL local recuperado si hace falta, el login y la tienda. La copia activa de datos está en mysql-data-local (excluida de Git); la fuente anterior no se modificó. Bases: arrullo_test para tienda, ventas_db para login, puerto 56442. Login en 4318, tienda en 4317. No ejecutar db:setup ni volver a sembrar para recuperar cuentas. No compartir .env. El seguimiento de envíos se configura por separado y no impide iniciar sesión.

## Envíos conectados — 2026-11-06

La base recuperada conserva 1,142 códigos postales únicos de Sinaloa, 20 municipios; fuente registrada SEPOMEX · Correos de México. No se reimportaron ni sustituyeron códigos. SHIPPING_MODE=simulator habilita la tarifa local de demostración: base registrada + 18 MXN por cada 500 gramos o fracción. No representa cotización de paquetería real. PAYMENT_MODE=simulator mantiene el checkout de prueba, sin cobros.

Seguimiento: services/shipping-service con entorno .venv, Flask y MySQL. Configuración .env privada, clave interna compartida y base arrullo_test del puerto 56442. Servicios: tienda 4317, login 4318, envíos 4320. npm.cmd start coordina su arranque. /health de envíos comprueba conexión y tabla shipments, además de configuración de la clave. Los importadores ahora cargan el .env principal.

Prueba real de integración: node scripts/check-shipping.cjs. Crea exclusivamente cuentas/pedido temporales, comprueba CP, peso, checkout simulado, guía, estado, aislamiento por cliente y protección interna, y elimina las identidades de prueba/restaura la unidad de stock usada al finalizar. No ejecutar simultáneamente dos copias de esta prueba.


## Cotizador para el comprador

Agregar una prenda, abrir Bolsa y pulsar Continuar con mi pedido. El cálculo aparece únicamente dentro de Completa tu pedido: ingresar CP y pulsar Calcular envío. Muestra destino, costo por CP/peso y total; permite cotizar antes de completar el resto de la dirección. La dirección completa se exige para confirmar el pedido. CP81200 y180g produce 107 MXN con la tarifa de demostración actual.

## Tarjeta conectada — 2026-11-06

Dentro de Completa tu pedido: completar dirección, calcular envío, elegir tarjeta ficticia, Validar tarjeta de prueba y confirmar. Escenarios: aprobada, tarjeta rechazada, fondos insuficientes y rechazo al pagar. Mes/año se validan con lógica original. No hay cobros reales. La confirmación requiere un comprobante vigente vinculado al cliente, carrito, envío e importe calculado por servidor. Solo referencia opaca se almacena; número/CVV no se guardan.

npm.cmd start inicia también services/card-service en4321. Claves privadas en los .env locales. Pruebas del validador: npm.cmd test desde services/card-service. Prueba integral: node scripts/check-card-integration.cjs desde tienda-online; crea y limpia datos temporales, ejecutar una sola instancia. Código original TypeScript preservado en referencias/; módulos ejecutables en original/.

## Corrección de bolsa y Visa

El selector de tipo de tarjeta muestra solo Visa; aprobación/rechazo se obtienen del servicio. Al recargar se concilia la bolsa antigua con catálogo vigente por SKU o nombre/talla/color inequívocos. Si falta selección o stock se indica en la bolsa. Recalcular envío y revalidar tarjeta si cambian precio/peso/selección. Prueba de conciliación: node --test scripts/cart-sync.test.cjs.

## Tienda y administración en un mismo sitio

Iniciar todo con npm.cmd start desde tienda-online. Tienda: http://127.0.0.1:4317/ (también /tienda). Administración: http://127.0.0.1:4317/admin (se conserva /admin.html).

La sesión se comparte entre vistas y pestañas. La cuenta ADMIN ve el selector Tienda/Administración. Cada entrada al panel administrativo exige iniciar sesión de nuevo; volver a tienda conserva su sesión. Las cuentas de cliente conservan acceso a la tienda y no obtienen acceso al panel. Cerrar sesión se sincroniza entre pestañas. No se cambiaron pantallas ni datos. Tras actualizar, Ctrl+F5 en ambas pestañas.

Pruebas sin crear cuentas: node --test scripts/session-tests/site-session.test.cjs scripts/session-tests/unified-site.test.cjs. Las pruebas de backend usan BD sustituida; revisión autenticada real corresponde al usuario con su cuenta.

Acceso administrativo actualizado: cada visita y regreso mediante historial muestra formulario. Solo login exitoso con rol ADMIN abre panel. El subtítulo de Pedidos y envíos ahora es Información y detalle de pedidos. Pruebas: node --test scripts/session-tests/admin-gate.test.cjs.
