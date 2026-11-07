# Bitácora del proyecto Arrullo

Añadir las entradas nuevas al inicio. Usar hora local de `America/Mazatlan` y declarar la zona. Si se desconoce la hora exacta, indicarlo expresamente; no inventarla.

## 2026-11-06 — Preparación de GitHub y hosting

- **Fecha/hora local:** 2026-11-06 23:10 (America/Mazatlan).
- **Tarea:** preparar el repositorio completo para GitHub y establecer una base segura de despliegue en Render; corregir el error reportado en acceso.
- **Responsable:** Mantenimiento del proyecto, solicitado por el usuario.
- **Archivos afectados:** `README.md`, `.gitignore`, `render.yaml`; `tienda-online/README-DEPLOY.md`, `.gitignore`, `hosting.env.example`, `scripts/start-hosted.cjs`, `public/app.js`, `public/index.html`, `server.js`, `services/card-gateway.cjs`, `services/login-service/src/server.js`, `services/shipping-service/app.py`; matriz, registro de errores y esta bitácora.
- **Cambios realizados:** README raíz ampliado con arquitectura, ejecución local, pruebas y límites de producción. Añadidas exclusiones de credenciales, datos MySQL, respaldos, dependencias y entornos virtuales, manteniendo rastreables los `.env.example`. El manifiesto de Render quedó en la raíz y apunta al Dockerfile integrado; pagos/envíos quedan `unconfigured` y el servicio de tarjetas no arranca en ese modo. La guía de hosting documenta la dependencia de MySQL externo. Error de interfaz corregido: selectores de color múltiples usan `$$`; actualizado `app.js?v=32`. Añadidos comentarios breves de propósito a los puntos de entrada principales. No se encontraron marcadores de comentarios generados por IA en el código de ejecución.
- **Comandos/pruebas ejecutadas:** tienda `npm test` 5/5; login `npm test` 30/30 e indica MySQL disponible; tarjetas `npm test` 21 validaciones y 2 pruebas de comprobante correctas; pruebas de integración de tarjetas/seguimiento correctas y datos temporales limpiados; `node --check` de JavaScript modificado; health local de tienda/login/envíos HTTP 200 y tienda/envíos informan MySQL conectado. En navegador: 10 productos, modal de acceso abre y sin errores JS nuevos. `python validar_documentacion.py`: OK, 6 documentos/enlaces. Se confirmó que `.env`, `mysql-data-local` y `respaldos` se ignoran y que los ejemplos de entorno son rastreables. No se ejecutó Docker build ni despliegue remoto.
- **Decisiones:** no subir archivos `.env`, datos ni respaldos; no activar en hosting pagos o envíos simulados; no realizar commit, push ni migración de cuentas sin el proveedor y destino confirmados.
- **Riesgos/pendientes:** Render requiere MySQL externo, certificados TLS y variables privadas; la recuperación requiere correo; no existe pasarela bancaria ni transportista real configurado. No se ha probado conectividad contra una base alojada.
- **Siguiente paso:** elegir/provisionar MySQL compatible, establecer sus variables solo en el panel del hosting, revisar esquemas y ejecutar la migración privada antes de desplegar.
- **Referencias:** [README](../README.md), [despliegue](../tienda-online/README-DEPLOY.md), [matriz](MATRIZ_INTEGRACION.md), [errores y pruebas](ERRORES_Y_SOLUCIONES.md).

## 2026-11-06 — Diagnóstico de conexión local y error de acceso

- **Fecha/hora local:** 2026-11-06 22:51 (America/Mazatlan).
- **Tarea:** investigar el error reportado al registrarse/iniciar sesión y comprobar la conexión a MySQL.
- **Responsable:** Mantenimiento del proyecto.
- **Archivos afectados:** `tienda-online/public/app.js`, `tienda-online/public/index.html`; matriz, registro de errores y esta bitácora.
- **Cambios realizados:** causa observada `TypeError: $(...).forEach is not a function` en el renderizado del catálogo. Se cambió el enlace de los selectores de color repetidos al helper de selección múltiple (`$$`) y se actualizó el recurso a `app.js?v=32`. No se cambió la configuración de base de datos porque las conexiones locales verificaron correctamente.
- **Comandos/pruebas ejecutadas:** `/api/health` de tienda y `/health` de envíos respondieron con `connected`; salud de login HTTP 200 y pruebas indican MySQL disponible. `npm test` de tienda 5/5; pruebas de login 30/30; pruebas de tarjeta 21 de validación y 2 de comprobante correctas; `node --check public/app.js` y `server.js` correctos. Navegador tras recarga: 10 productos, modal de acceso abre y cero errores JS nuevos. No se envió un formulario de autenticación desde el navegador.
- **Decisiones:** no alterar credenciales, esquemas, cuentas ni datos de MySQL; corregir el error reproducible de interfaz que impedía completar la carga normal.
- **Riesgos/pendientes:** la comprobación cubre los servicios locales y pruebas automatizadas; no verifica credenciales/configuración de un hosting remoto ni envío de correo.
- **Siguiente paso:** si el inicio de sesión sigue fallando, capturar el mensaje HTTP posterior a la carga de `app.js?v=32`, sin compartir tokens ni contraseñas.
- **Referencias:** [matriz](MATRIZ_INTEGRACION.md), [errores y soluciones](ERRORES_Y_SOLUCIONES.md).

## 2026-11-06 — Aislar el modo de pago en pruebas de checkout

- **Fecha/hora local:** 2026-11-06 22:42 (America/Mazatlan).
- **Tarea:** depurar la suite de integración de tienda y corregir el fallo del checkout.
- **Responsable:** Codex, solicitado por el usuario.
- **Archivos afectados:** `tienda-online/integration.test.js`; matriz, registro de errores y esta bitácora.
- **Cambios realizados:** la suite fija `PAYMENT_MODE=test` y vacía `CARD_SERVICE_URL` antes de cargar el servidor para que el `.env` local no convierta un token sintético en un comprobante real. Eliminados registros duplicados del registro de usuario que imprimían el token de sesión en la salida de pruebas. Se conserva el diagnóstico del checkout solicitado.
- **Comandos/pruebas ejecutadas:** desde `tienda-online`, `npm test`: 5/5 pruebas aprobadas, incluida la cotización con peso incorrecto (400). `node scripts/check-card-integration.cjs`: OK en el simulador; los usuarios/pedidos temporales se eliminaron y el inventario se repuso. `python validar_documentacion.py`: OK (6 archivos, secciones y enlaces). El primer intento de `npm test` desde la raíz no se ejecutó porque ahí no existe `package.json`.
- **Decisiones:** aislar esta suite al gateway de pago de prueba; no alterar el comportamiento del servidor ni la configuración local de `.env`.
- **Riesgos/pendientes:** se probó el simulador, no un cobro bancario real. El resultado cubre estas pruebas de integración, no certifica que todo el proyecto esté libre de errores.
- **Siguiente paso:** revisar visualmente el checkout y mantener la prueba dedicada al cambiar la integración de pagos.
- **Referencias:** [matriz](MATRIZ_INTEGRACION.md), [errores y pruebas](ERRORES_Y_SOLUCIONES.md).

## 2026-11-06 — Preparación para publicación

- **Fecha/hora local:** 2026-11-06 16:50 (America/Mazatlan).
- **Tarea:** revisar publicación y preparar fuentes limpias.
- **Responsable:** Codex.
- **Archivos afectados:** registros de documentación; copia de fuentes Arrullo-fuentes-hosting.zip en outputs del chat. Sin cambios de runtime.
- **Cambios realizados:** auditado render.yaml, dependencias, configuración de servicios y esquema. Generado ZIP con113 archivos de fuentes, excluyendo .env privados, node_modules, entornos Python, datos MySQL, logs y respaldos. Revisión en memoria no detectó valores privados de los .env incluidos en fuentes.
- **Comandos/pruebas ejecutadas:** empaquetado Python estándar; integridad ZIP correcta y comprobación de exclusiones. Validador documental al cierre. No despliegue, migración ni transferencia a terceros.
- **Decisiones:** pedir hosting/cuenta al usuario antes de acciones dependientes del proveedor. No subir solo HTML ni publicar fuentes como si incluyeran BD activa.
- **Riesgos/pendientes:** hosting sin elegir; se requieren Node/Python y MySQL alojado. Configuración existente render.yaml incluye tienda/envíos pero no login/tarjetas y deja simulación desactivada. Falta completar despliegue según proveedor, configurar secretos y migrar bases actuales conservando cuentas/CP.
- **Siguiente paso:** recibir proveedor elegido y continuar preparación/despliegue/migración; no se declara página publicada.
- **Referencias:** [matriz](MATRIZ_INTEGRACION.md), [servicios](INVENTARIO_MICROSERVICIOS.md), [errores](ERRORES_Y_SOLUCIONES.md).

## 2026-11-06 — Diferenciar alertas e inventario vacío

- **Fecha/hora local:** 2026-11-06 16:45 (America/Mazatlan).
- **Tarea:** revisar captura de Pijamas sin variantes.
- **Responsable:** Codex.
- **Archivos afectados:** public/admin.js, admin.html; scripts/session-tests/inventory-filter.test.cjs; documentación.
- **Cambios realizados:** alcance y conteo explícitos en inventario/alertas. Mensaje de alertas informa que no hay stock bajo en categoría seleccionada; botón abre inventario completo conservando categoría/búsqueda. Ningún cambio de productos ni stock. Recurso v6 y respaldo creado.
- **Comandos/pruebas ejecutadas:** consulta real de inventario de solo lectura: Pijamas4 productos/66 variantes/0 bajas; Ropa diaria2/45/0; Mamelucos4/72/0; mínimo5.2 pruebas aisladas correctas: inventario no vacío aunque alertas0 y salto conserva categoría; variantes realmente bajo mínimo sí aparecen. Sintaxis, regresión acceso y validador al cierre. Sin cuentas nuevas.
- **Decisiones:** no mostrar stock normal como alerta; distinguir ausencia de alertas y ausencia de productos.
- **Riesgos/pendientes:** revisión visual con cuenta del usuario.
- **Siguiente paso:** Ctrl+F5; usar Productos e inventario o botón de inventario desde alertas.
- **Referencias:** [matriz](MATRIZ_INTEGRACION.md), [frontend](INVENTARIO_FRONTEND.md), [servicios](INVENTARIO_MICROSERVICIOS.md), [errores](ERRORES_Y_SOLUCIONES.md).

## 2026-11-06 — Textos informativos en administración

- **Fecha/hora local:** 2026-11-06 16:42 (America/Mazatlan).
- **Tarea:** retirar frases promocionales/decorativas del administrador.
- **Responsable:** Codex.
- **Archivos afectados:** public/admin.html y admin.js; documentación.
- **Cambios realizados:** login, encabezado, resumen, tarjeta de pedidos, inventario, alta y pie lateral usan títulos/descripciones operativas. Resumen de la tienda; Ventas registradas, pedidos e inventario disponible; Gestión de pedidos y acciones sobre estado/guías. Se conserva Información y detalle de pedidos. Diseño y lógica conservados. Respaldos creados; recurso v5.
- **Comandos/pruebas ejecutadas:** sintaxis, regresión de acceso y comprobación de texto servido al cierre; validador documental al cierre. Sin cuentas nuevas ni cambios de datos.
- **Decisiones:** textos informativos en administración; identidad visual conservada.
- **Riesgos/pendientes:** usuario recarga para revisión visual con su cuenta.
- **Siguiente paso:** Ctrl+F5 en administrador.
- **Referencias:** [matriz](MATRIZ_INTEGRACION.md), [frontend](INVENTARIO_FRONTEND.md), [errores](ERRORES_Y_SOLUCIONES.md).

## 2026-11-06 — Solo switch para administración

- **Fecha/hora local:** 2026-11-06 16:41 (America/Mazatlan).
- **Tarea:** retirar botón Administrar redundante según imagen del usuario.
- **Responsable:** Codex.
- **Archivos afectados:** public/app.js, index.html, site-navigation.css; registros de documentación.
- **Cambios realizados:** botón de cuenta oculto para sesión ADMIN cuando se muestra switch Tienda/Administración; Cuenta/Mi cuenta permanece disponible para visitantes/clientes y se restaura al cerrar sesión. Buscar y Bolsa conservados. Versiones de recursos actualizadas y app anterior respaldada.
- **Comandos/pruebas ejecutadas:** node --check public/app.js; comprobación de contenido HTTP al cierre. Sin nuevas cuentas ni cambios de permisos. Validador documental al cierre.
- **Decisiones:** switch como único acceso superior de ADMIN; diseño restante conservado.
- **Riesgos/pendientes:** usuario recarga para revisar visualmente con su cuenta.
- **Siguiente paso:** Ctrl+F5 en tienda.
- **Referencias:** [matriz](MATRIZ_INTEGRACION.md), [frontend](INVENTARIO_FRONTEND.md), [errores](ERRORES_Y_SOLUCIONES.md).

## 2026-11-06 — Login administrativo explícito y texto de pedidos

- **Fecha/hora local:** 2026-11-06 16:40 (America/Mazatlan).
- **Tarea:** pedir login ADMIN antes de panel y cambiar subtítulo según imagen.
- **Responsable:** Codex.
- **Archivos afectados:** public/admin.js, admin.html; scripts/session-tests/admin-gate.test.cjs; README-ADMIN.md; documentación.
- **Cambios realizados:** retirado acceso automático por token compartido; cada visita y regreso desde historial requiere login explícito exitoso con rol ADMIN. Cambios/cierre de sesión ocultan panel y no lo reabren automáticamente. La sesión de tienda se conserva. Subtítulo de Pedidos y envíos: Información y detalle de pedidos. Backup creado y versión de recurso actualizada a4.
- **Comandos/pruebas ejecutadas:**8/8 pruebas aisladas correctas, sin cuentas nuevas: sesión previa no abre ni consulta panel, login ADMIN correcto sí abre, cliente/contraseña incorrecta no, cambios de sesión/historial vuelven a login; pruebas previas de sesión/rutas/permisos correctas. Sintaxis correcta y archivo HTTP servido confirma texto nuevo y ausencia de arranque automático. Validador documental al cierre.
- **Decisiones:** compartir identidad de sitio sin usarla para omitir el formulario administrativo por visita. Texto reemplazado exactamente con ortografía española.
- **Riesgos/pendientes:** comprobación visual con cuenta real a cargo del usuario; sin crear cuentas por preferencia previa.
- **Siguiente paso:** recargar Ctrl+F5 y entrar con Admin.
- **Referencias:** [matriz](MATRIZ_INTEGRACION.md), [frontend](INVENTARIO_FRONTEND.md), [errores](ERRORES_Y_SOLUCIONES.md).

## 2026-11-06 — Tienda y administrador unidos en un sitio

- **Fecha/hora local:** 2026-11-06 16:35 (America/Mazatlan).
- **Tarea:** integrar ambas vistas preservando su diseño.
- **Responsable:** Codex.
- **Archivos afectados:** public/site-session.js, site-navigation.css; public/index.html, app.js, admin.html y admin.js; server.js; scripts/session-tests/; README-ADMIN.md; documentación.
- **Cambios realizados:** rutas / y /tienda para tienda; /admin para panel, conservando /admin.html. Sesión compartida, perfil canónico GET /api/auth/me y sincronización de cambios/cierre entre pestañas. Selector Tienda/Administración para ADMIN y regreso claro a tienda desde panel. Acceso administrativo verifica permisos; cliente conserva su sesión al abrir acceso sin permiso. Login y diseño de ambas vistas conservados, con navegación común añadida. Respaldos previos creados.
- **Comandos/pruebas ejecutadas:**4/4 pruebas aisladas (sesión/cierre, vencimiento, respuesta antigua y rutas/permisos) correctas; BD sustituida, sin crear cuentas ni modificar usuarios. Rutas reales /, /tienda, /admin y /admin.html:200. Navegador sin sesión: ida/vuelta tienda-admin correcta y consola sin errores. Sintaxis correcta; validador documental al cierre.
- **Decisiones:** un único proyecto/servidor y sesión; conservar pantallas, datos y estilos. Usuario indicó que probará con su cuenta: no se crearon cuentas nuevas ni se volvió a pedir autorización. Sin publicación.
- **Riesgos/pendientes:** comprobación visual autenticada con la cuenta real queda al usuario; roles/sesión probados en entorno aislado.
- **Siguiente paso:** recargar Ctrl+F5 y revisar navegación con Admin; hosting tras revisión.
- **Referencias:** [matriz](MATRIZ_INTEGRACION.md), [frontend](INVENTARIO_FRONTEND.md), [servicios](INVENTARIO_MICROSERVICIOS.md), [errores](ERRORES_Y_SOLUCIONES.md), [guía](../tienda-online/README-ADMIN.md).

## 2026-11-06 — Reparación de variantes antiguas y selector Visa

- **Fecha/hora local:** 2026-11-06 16:27 (America/Mazatlan).
- **Tarea:** corregir Variante no encontrada y mostrar solo Visa como opción.
- **Responsable:** Codex.
- **Archivos afectados:** public/cart-sync.js, app.js, index.html y styles.css; scripts/cart-sync.test.cjs; documentación.
- **Cambios realizados:** conciliación de bolsa persistida con inventario al cargar/entrar/preparar checkout. Coincide SKU o selección inequívoca de producto/talla/color; actualiza IDs/precio/peso/stock, sin sustituir selección ante ambigüedad. Variantes inexistentes/agotadas se señalan y bloquean continuar. Carrito remoto solo se considera preparado al terminar de agregar todas las prendas; fallo descarta ID parcial. Cambios de selección/precio/peso invalidan envío/comprobante. Selector Tipo de tarjeta tiene únicamente Visa; resultado se muestra tras servicio.
- **Comandos/pruebas ejecutadas:**5/5 pruebas de conciliación correctas. Integración real reprodujo404 con ID demo antiguo, reparó ID conservando talla/color, y completó tarjeta/pedido/seguimiento; datos temporales eliminados y stock repuesto. Navegador con fixture temporal de bolsa inicialmente vacía: reparación automática visible, selector DOM exactamente Visa y consola sin errores. Una nueva creación de cuenta temporal para prueba visual completa fue bloqueada por revisión automática por falta de autorización explícita; no se reintentó y se pidió autorización al usuario. Bolsa temporal vaciada y fixture retirado al cerrar. Sintaxis y validador documental al cierre.
- **Decisiones:** corregir variantes antes de atribuir fallo a tarjeta; no borrar bolsa del usuario ni sustituir talla/color ambiguos. No repetir creación de cuenta bloqueada sin aprobación.
- **Riesgos/pendientes:** repetición visual autenticada pendiente de autorización o prueba por usuario con su cuenta.
- **Siguiente paso:** recargar Ctrl+F5 y revisar; si autoriza, repetir prueba visual con cuenta temporal.
- **Referencias:** [matriz](MATRIZ_INTEGRACION.md), [frontend](INVENTARIO_FRONTEND.md), [errores](ERRORES_Y_SOLUCIONES.md).

## 2026-11-06 — Validador de tarjetas conectado al checkout

- **Fecha/hora local:** 2026-11-06 16:17 (America/Mazatlan).
- **Tarea:** conectar servicio-verificacion-tarjeta al pago de Arrullo, por instrucción del usuario.
- **Responsable:** Codex.
- **Archivos afectados:** services/card-service/ (servidor, comprobante, pruebas y código original adaptado/referencias); services/card-gateway.cjs; server.js; scripts/start-local.cjs, check-shipping.cjs y check-card-integration.cjs; public/app.js, index.html y styles.css; .env y .env.example (sin secretos en registros); README-ADMIN.md; documentación.
- **Cambios realizados:** servicio independiente local4321, clave interna y lógica original de tarjeta/pasarela/límite de intentos convertida de TypeScript a JS sin cambiar reglas. Adaptación a identidad/carrito/pedido de Arrullo, sin migrar ni sembrar BD02. Checkout elige tarjeta ficticia y valida antes de confirmar. Gateway calcula total desde BD; comprobante firmado vinculado a cliente/carrito/cotización/importe y con vencimiento. Pedido rechaza firma falsa o importe distinto; pagos guardan solo referencia opaca. Solo se aceptan tarjetas ficticias predefinidas; no hay cobros reales. npm start inicia también este servicio.
- **Comandos/pruebas ejecutadas:** 21/21 pruebas del validador original y2/2 de firmas correctas; sintaxis correcta. Prueba de integración real con MySQL/servicios: aprobación,3 rechazos, vencida, autenticación y propiedad, token inventado/alterado, importe cambiado, referencia opaca, checkout y seguimiento correctos. Navegador real: rechazo mantiene botón bloqueado; aprobación autoriza566 MXN y permite pedido; SQL confirmó envío107/total566. Consola sin errores. Cuentas y pedidos temporales eliminados, stock repuesto y sesión temporal cerrada. Validador documental al cierre.
- **Decisiones:** conservar originales; adaptar módulos útiles sin crear segunda identidad ni esquema incompatible. Captura y autorización exclusivamente de demostración. Cotización permanece solo en Completa tu pedido.
- **Riesgos/pendientes:** para cobros reales se requiere procesador de pagos real; servicio actual no se presenta como tal.
- **Siguiente paso:** usuario recarga y revisa pago de prueba; hosting después de revisión.
- **Referencias:** [matriz](MATRIZ_INTEGRACION.md), [servicios](INVENTARIO_MICROSERVICIOS.md), [frontend](INVENTARIO_FRONTEND.md), [errores](ERRORES_Y_SOLUCIONES.md), [guía](../tienda-online/README-ADMIN.md).

## 2026-11-06 — Cotización solo en checkout y revisión de tarjetas

- **Fecha/hora local:** 2026-11-06 16:07 (America/Mazatlan).
- **Tarea:** retirar cotizador de bolsa y localizar servicio de validación de tarjeta.
- **Responsable:** Codex.
- **Archivos afectados:** tienda-online/public/app.js, index.html, shipping-calculator.js, styles.css; README-ADMIN.md; registros de documentación. Fuentes de tarjeta solo leídas y copiadas a trabajo para pruebas.
- **Cambios realizados:** retirada UI y lógica del cotizador de bolsa; se conserva únicamente cálculo CP/peso y desglose de Completa tu pedido. Revisado servicio-verificacion-tarjeta original (TypeScript, Prisma, MySQL, JWT) y serviciopago (FastAPI). Ambos usan autorización simulada; no se conectaron al checkout en esta tarea de búsqueda.
- **Comandos/pruebas ejecutadas:** node --check app.js y shipping-calculator.js correctos. Navegador real: bolsa con subtotal y Continuar, sin cotizador (conteo0), botón de checkout conservado (conteo1), consola sin errores. Prenda temporal retirada. Validador original de tarjeta copiado al área de trabajo, único ajuste de import explícito .ts para Node24; 21/21 pruebas correctas, sin BD ni banco. Validador documental al cierre.
- **Decisiones:** cotización exclusivamente en checkout por solicitud expresa. Servicio de tarjetas identificado, sin declarar integración ni cobro real. Originales intactos.
- **Riesgos/pendientes:** integrar validador requeriría adaptar identidad, contratos y esquema BD02; pasarela original es simulada.
- **Siguiente paso:** revisión del usuario y definir integración de tarjeta si la solicita.
- **Referencias:** [matriz](MATRIZ_INTEGRACION.md), [frontend](INVENTARIO_FRONTEND.md), [servicios](INVENTARIO_MICROSERVICIOS.md), [errores](ERRORES_Y_SOLUCIONES.md).

## 2026-11-06 — Cotizador postal visible para compradores

- **Fecha/hora local:** 2026-11-06 15:56 (America/Mazatlan).
- **Tarea:** mostrar costo por código postal en la tienda; usuario confirmó alcance comprador.
- **Responsable:** Codex.
- **Archivos afectados:** tienda-online/public/shipping-calculator.js, app.js, index.html, styles.css; server.js; documentación.
- **Cambios realizados:** cotizador en bolsa sin exigir sesión/dirección completa; destino reconocido, tarifa base, componente por peso y total con envío. Checkout ahora cotiza con CP y peso; dirección y carrito se guardan al confirmar. Desglose de prendas/envío/empaque/total. Cotización invalidada al cambiar CP/carrito y revisada al vencer. Backend devuelve localidad/municipio y desglose de tarifa; peso real de variante usado al agregar. Respaldos previos en respaldos/cotizador.
- **Comandos/pruebas ejecutadas:** navegador con API/MySQL reales: producto 459 MXN + envío 107 = 566; CP 81200 Los Mochis/Ahome y peso 180g; CP 99999 rechazado y total invalidado. Checkout con demás campos vacíos cotizó; completar dirección y confirmar produjo pedido simulado correcto, verificado también en SQL. Cuenta/pedido de prueba eliminados y stock repuesto; sesión cerrada y bolsa de prueba vaciada. Consola sin errores JS. Sintaxis y validador documental al cierre.
- **Decisiones:** alcance tienda, sin cotizador administrativo. Catálogo postal anterior conservado, tarifas de demostración claramente indicadas.
- **Riesgos/pendientes:** no se integra transportista real; cargos son simulados.
- **Siguiente paso:** usuario recarga tienda y revisa bolsa/checkout; hosting después de revisión.
- **Referencias:** [matriz](MATRIZ_INTEGRACION.md), [frontend](INVENTARIO_FRONTEND.md), [errores](ERRORES_Y_SOLUCIONES.md), [guía](../tienda-online/README-ADMIN.md).

## 2026-11-06 — Cálculo y seguimiento de envíos conectados

- **Fecha/hora local:** 2026-11-06 15:37 (America/Mazatlan).
- **Tarea:** revisar cálculo, códigos postales y microservicio de seguimiento; preparar alta del administrador solicitado.
- **Responsable:** Codex.
- **Archivos afectados:** scripts/start-local.cjs, import-sepomex.js, setup-database.js, check-shipping.cjs; services/shipping-service/app.py, .env y .venv; .env principal; .gitignore; README-ADMIN.md; services/login-service/scripts/crear-admin-interactivo.js; documentación.
- **Cambios realizados:** confirmados 1,142 CP y 20 municipios existentes (fuente SEPOMEX), sin reemplazar catálogo. Habilitados modos locales de simulación de envío/pago para checkout de prueba. Configurado seguimiento con clave privada compartida y base correcta; dependencias Python instaladas en .venv. npm start coordina MySQL/login/envíos/tienda. Salud de logística comprueba BD y tabla. Importadores cargan .env. Preparado comando de alta privada para usuario Admin y correo elegido por el usuario, sin crear cuenta ni contraseña todavía.
- **Comandos/pruebas ejecutadas:** consulta SQL de catálogo y cobertura; npm.cmd start con tres servicios conectados; node scripts/check-shipping.cjs (equivalente en carpeta de trabajo) correcto: CP válidos 80000/81200/82000; inválido, estado fuera de cobertura y peso cero rechazados; 180g=107 MXN y 501g=125 MXN; registro, pedido simulado, seguimiento, guía y estado por microservicio reales; segundo cliente no ve el envío; petición sin clave interna 401. Datos temporales eliminados y stock repuesto; catálogo conservado. Sintaxis y validador al cierre.
- **Decisiones:** no descargar ni resembrar CP; conservar datos. Cálculo tarifario local usa BD; seguimiento usa microservicio Python, no transportista externo.
- **Riesgos/pendientes:** precios y pagos son de demostración; falta proveedor real para producción. El usuario debe ejecutar alta privada de Admin y definir su contraseña.
- **Siguiente paso:** revisión de cálculo y seguimiento por usuario; creación privada de Admin; hosting posterior.
- **Referencias:** [matriz](MATRIZ_INTEGRACION.md), [servicios](INVENTARIO_MICROSERVICIOS.md), [frontend](INVENTARIO_FRONTEND.md), [errores](ERRORES_Y_SOLUCIONES.md), [guía](../tienda-online/README-ADMIN.md).

## 2026-11-06 — Recuperación de cuentas y conexión del login

- **Fecha/hora local:** 2026-11-06 15:17 (America/Mazatlan).
- **Tarea:** reconectar cuenta creada en la tienda local anterior.
- **Responsable:** Codex.
- **Archivos afectados:** tienda-online/mysql-data-local; .env principal y del login (sin valores secretos en registro); services/login-service/src/server.js; scripts/start-local.cjs; package.json/package-lock.json; public/app.js e index.html; README-ADMIN.md; registros de documentación.
- **Cambios realizados:** localizada base previa en arrullo-auditoria/arrullo-backend/mysql-data2 del proyecto local. Copia completa conservadora a mysql-data-local; MySQL 8.0.46 en 127.0.0.1:56442. Tienda usa arrullo_test; login usa ventas_db, que conserva una cuenta CLIENTE anterior. Instaladas dependencias declaradas del login; configurado en puerto 4318 y AUTH_SERVICE_URL en tienda. npm start ahora inicia servicios locales cuando LOCAL_SERVICES=true; producción conserva arranque de servidor sin levantar base local. Fallo de seguimiento de envíos se presenta separado de una sesión correcta.
- **Comandos/pruebas ejecutadas:** consultas de solo lectura y salud de tienda/login: HTTP 200. Prueba real registro + login por API de tienda con cuenta temporal: correcta, cuenta temporal eliminada y conteo de cuentas previas conservado. Registro del servicio también confirmó login HTTP 200 de cuenta existente, sin registrar contraseña ni token. npm.cmd start unificado iniciado correctamente. Pruebas del cliente 5/5; permisos 12 más estado inválido; sintaxis y validador documental al cierre.
- **Decisiones:** preservar fuente anterior y credenciales de cuentas; no recrear esquema ni aplicar semillas. Base activa local queda dentro de Arrullo, excluida de Git.
- **Riesgos/pendientes:** seguimiento de envíos requiere configuración separada. MySQL local es la configuración recuperada de desarrollo, pendiente preparar hosting y credenciales de producción. La copia fuente no se modificó.
- **Siguiente paso:** usuario revisa cuenta en tienda; hosting después de revisión.
- **Referencias:** [matriz](MATRIZ_INTEGRACION.md), [servicios](INVENTARIO_MICROSERVICIOS.md), [frontend](INVENTARIO_FRONTEND.md), [errores](ERRORES_Y_SOLUCIONES.md), [guía](../tienda-online/README-ADMIN.md).

## 2026-11-06 — Diagnóstico del inicio de sesión

- **Fecha/hora local:** 2026-11-06 15:09 (America/Mazatlan).
- **Tarea:** revisar error interno al iniciar sesión con cuenta existente.
- **Responsable:** Codex.
- **Archivos afectados:** tienda-online/server.js; services/login-client.cjs y login-client.test.cjs; documentación.
- **Cambios realizados:** cliente del microservicio con tiempo máximo 5 segundos, validación de respuesta y conservación de errores de credenciales/bloqueo. Fallos MySQL se traducen a 503 con explicación, sin revelar secretos. Servidor anterior respaldado.
- **Comandos/pruebas ejecutadas:** diagnóstico MySQL de solo lectura: tienda apunta por defecto a puerto 56442, ECONNREFUSED; AUTH_SERVICE_URL ausente. Configuración de login original apunta 3306/ventas_db, ER_ACCESS_DENIED_ERROR. MySQL80 está activo. node --test login-client.test.cjs: 5/5 correctas. node --check: correcto. Verificación HTTP tras reinicio registrada en errores.
- **Decisiones:** conservar cuentas y contraseñas; no crear bases sustitutas ni reiniciar esquemas.
- **Riesgos/pendientes:** acceso real pendiente de configurar conexión válida y localizar origen de cuenta existente. No se declara login funcional.
- **Siguiente paso:** usuario confirma dónde creó cuenta; configurar base existente y dirección del servicio.
- **Referencias:** [errores](ERRORES_Y_SOLUCIONES.md), [servicios](INVENTARIO_MICROSERVICIOS.md), [matriz](MATRIZ_INTEGRACION.md).

## 2026-11-06 — Corrección de inicio local

- **Fecha/hora local:** 2026-11-06 14:57 (hora del equipo; America/Mazatlan).
- **Tarea:** resolver JWT_SECRET requerida al iniciar la tienda.
- **Responsable:** Codex.
- **Archivos afectados:** tienda-online/.env; bitácora, matriz y errores.
- **Cambios realizados:** creado .env local con NODE_ENV development, HOST 127.0.0.1, PORT 4317 y clave aleatoria de sesión. Valor secreto no registrado. Archivo excluido de Git por regla existente.
- **Comandos/pruebas ejecutadas:** npm.cmd start inicia servidor; GET /admin.html responde HTTP 200; /api/health falla, MySQL pendiente. Validador documental ejecutado al cierre.
- **Decisiones:** mantener servidor local activo para revisión; sin publicación ni alteración de cuentas.
- **Riesgos/pendientes:** conexión y configuración MySQL pendientes; no se declara login ni persistencia funcionales.
- **Siguiente paso:** revisar pantalla de acceso y configurar conexión MySQL real.
- **Referencias:** [matriz](MATRIZ_INTEGRACION.md), [errores](ERRORES_Y_SOLUCIONES.md).

## 2026-11-06 — Administrador web integrado

- **Fecha/hora local:** 2026-11-06 14:44 (America/Mazatlan).
- **Tarea:** crear administración basada en la tienda y adaptar microservicios originales, por solicitud del usuario.
- **Responsable:** Codex.
- **Archivos afectados:** tienda-online/public/admin.html, admin.css, admin.js; public/index.html, public/app.js; server.js; services/admin-service/; README-ADMIN.md; cinco registros de documentacion.
- **Cambios realizados:** panel de resumen, inventario, alta con variantes, alertas, pedidos, guías y comprobante; endpoints administrativos de identidad e inventario; módulo adaptado de CRUD INVENTARIO, AlertaStockMinimo y reporte-compras; flujo de alta adaptado de soa-agregar-producto. Restauradas funciones accountSubmit, beginCheckout y fillAddresses referidas pero ausentes en app.js. Respaldo de archivos sustituidos en respaldos.
- **Comandos/pruebas ejecutadas:** node --check sobre server.js, app.js y admin.js: correctos; node --test administracion.test.js: 3/3; comprobaciones HTTP aisladas: 12 de acceso y 1 de estado inválido, correctas; navegador: acceso/resumen/inventario/pedidos/alta con datos ficticios, sin errores JS. Validación documental ejecutada con Python 3.13.17: OK, 6 archivos, secciones y enlaces internos verificados.
- **Decisiones:** conservar originales; adaptar módulos al esquema Arrullo dentro del servidor existente; mantener login/envíos ya integrados; usuario solicita revisar antes de publicar, sin despliegue.
- **Riesgos/pendientes:** pruebas reales MySQL/login/envíos no ejecutadas; no hay node_modules ni configuración local .env en tienda-online. Cancelar no repone inventario ni reembolsa; pagos de demostración.
- **Siguiente paso:** revisión por usuario; iniciar servicios reales y verificar flujo integral antes de hosting.
- **Referencias:** [matriz](MATRIZ_INTEGRACION.md), [frontend](INVENTARIO_FRONTEND.md), [servicios](INVENTARIO_MICROSERVICIOS.md), [pruebas](ERRORES_Y_SOLUCIONES.md), [guía](../tienda-online/README-ADMIN.md).

## Plantilla de entrada

### AAAA-MM-DD — Título de tarea

- **Fecha/hora local:** AAAA-MM-DD HH:MM (America/Mazatlan; o indicar “hora no disponible”).
- **Tarea:** [objetivo y alcance].
- **Responsable:** Work / usuario / ambos (precisar).
- **Archivos afectados:** [rutas relativas; “ninguno” si aplica].
- **Cambios realizados:** [hechos verificables y límites].
- **Comandos/pruebas ejecutadas:** [comando o pasos, ambiente, resultado; o “no ejecutadas”].
- **Decisiones:** [decisión, proponente/autorización y estado].
- **Riesgos/pendientes:** [impacto y dueño si se conoce].
- **Siguiente paso:** [acción concreta o ninguno].
- **Referencias:** [matriz, inventarios, errores u otros registros].

## 2026-11-04 — Mecanismo de seguimiento documental

- **Fecha/hora local:** 2026-11-04 19:45 (America/Mazatlan).
- **Tarea:** implementar actualización explícita y validación de los archivos de seguimiento, como extensión del protocolo acordado.
- **Responsable:** Work.
- **Archivos afectados:** `README.md`; `documentacion/INVENTARIO_MICROSERVICIOS.md`; `documentacion/INVENTARIO_FRONTEND.md`; `documentacion/MATRIZ_INTEGRACION.md`; `documentacion/ERRORES_Y_SOLUCIONES.md`; `documentacion/BITACORA_PROYECTO.md`; `validar_documentacion.py`.
- **Cambios realizados:** definido protocolo previo y posterior a tarea, estados controlados, plantillas para servicios, componentes, requisitos, errores, pruebas, decisiones, cambios y pendientes, checklist de cierre y validador de solo lectura. Los originales bajo `Desktop/Arrullo microservicios` y `sources/` se mantienen fuera de alcance.
- **Comandos/pruebas ejecutadas:** `python validar_documentacion.py`: `VALIDACIÓN: OK — 6 archivos, secciones mínimas y enlaces internos verificados.` La primera pasada detectó un ancla incompleta y se corrigió antes de la validación aprobada. No se ejecutaron pruebas funcionales de servicios.
- **Decisiones:** la carpeta de integración será `Desktop/Arrullo`, ya que no existía; preservar `Desktop/Arrullo microservicios` como fuente original. No tomar decisiones técnicas de integración basadas solo en inspección estática.
- **Riesgos/pendientes:** la bitácora resume auditorías existentes; actualizarla en cada transferencia futura y ampliar evidencia de servicios solo tras pruebas. El ejecutable `python` del sistema remite a un instalador sin runtimes; en este entorno se usó el Python incluido con Codex. En una máquina distinta, instalar Python 3 o usar un ejecutor disponible.
- **Siguiente paso:** en cada tarea futura leer README, bitácora y matriz; al terminar completar checklist, actualizar registros pertinentes y validar antes del cierre.
- **Referencias:** [matriz](MATRIZ_INTEGRACION.md#última-actualización), [inventario servicios](INVENTARIO_MICROSERVICIOS.md), [inventario frontend](INVENTARIO_FRONTEND.md), [errores](ERRORES_Y_SOLUCIONES.md).

## Plantillas adicionales

### Decisión

| ID | Fecha/hora local | Contexto y opciones | Decisión y estado | Responsable/autorización | Razón/evidencia | Impacto/riesgo | Revisión |
|---|---|---|---|---|---|---|---|
| DEC-00 | [fecha/hora] | [opciones] | [decisión + estado permitido] | [Work/usuario] | [razón] | [impacto] | [fecha/condición] |

### Cambio

| ID | Fecha/hora local | Archivos/copia afectados | Cambio y motivo | Prueba/resultado | Estado | Referencia |
|---|---|---|---|---|---|---|
| CHG-00 | [fecha/hora] | [ruta] | [detalle] | [resultado o no ejecutada] | [estado permitido] | [enlace] |

### Pendiente

| ID | Fecha de alta | Acción / criterio de cierre | Responsable | Bloqueo/dependencia | Prioridad | Estado / referencia |
|---|---|---|---|---|---|---|
| TODO-00 | [fecha] | [acción y evidencia de cierre] | [Work/usuario] | [dependencia] | [P0/P1/P2] | pendiente · [enlace] |


## 2026-11-06 — Impedir guías duplicadas

- **Fecha/hora local:** 2026-11-06 (America/Mazatlan; hora no disponible).
- **Tarea:** rechazar guías repetidas entre pedidos.
- **Responsable:** Codex.
- **Archivos afectados:** tienda-online/server.js; tienda-online/services/admin-service/tracking.cjs; registros documentales.
- **Cambios realizados:** Guías únicas entre pedidos: normalización de espacios y mayúsculas, bloqueo MySQL por guía durante comprobación y guardado; respuesta 409 si pertenece a otro pedido. Pruebas de validación y concurrencia MySQL correctas sin crear cuentas ni modificar pedidos. Un grupo duplicado anterior conservado para corrección manual. Archivos: tienda-online/server.js y services/admin-service/tracking.cjs.
- **Comandos/pruebas ejecutadas:** node --check server.js; tracking.test.cjs: correcto, incluyendo bloqueo entre dos conexiones MySQL y rechazo de duplicado existente. Validador documental al cierre.
- **Decisiones:** conservar pedidos y guías existentes; no crear cuentas de prueba.
- **Riesgos/pendientes:** corregir manualmente uno de los pedidos con guía repetida; hosting aún no publicado.
- **Siguiente paso:** usuario recarga y corrige la guía correspondiente.
- **Referencias:** MATRIZ_INTEGRACION.md; INVENTARIO_MICROSERVICIOS.md; ERRORES_Y_SOLUCIONES.md.


## 2026-11-06 — Revisión de simulación de paquetería

- **Fecha/hora local:** 2026-11-06 (America/Mazatlan; hora no disponible).
- **Tarea:** revisar viabilidad de emitir guías simuladas usando validación de entregas.
- **Responsable:** Codex.
- **Archivos afectados:** documentación; originales solo lectura.
- **Cambios realizados:** AR-014 revisado: simulador paqueteria.py devuelve cuatro envíos fijos (1001–1004); no genera guías ni crea envíos. Lógica original aislada probada en cinco escenarios: tránsito pendiente, entregado con fecha validada, entregado sin fecha rechazada y desconocido sin resultado. API FastAPI y persistencia SQLAlchemy no iniciadas. Viable adaptar para emitir guías SIM únicas, guardar eventos y fecha de entrega y consumir la validación desde logística. Pendiente implementar; ninguna guía/pedido/cuenta modificada.
- **Comandos/pruebas ejecutadas:** check-delivery.py, cinco escenarios correctos con funciones originales aisladas; validador documental al cierre.
- **Decisiones:** propuesta de reutilización, sin integración en esta revisión.
- **Riesgos/pendientes:** implementar generación e historial persistente, autenticación interna y adaptación de IDs/BD; no afirmar entrega real.
- **Siguiente paso:** integrar simulador si se solicita.
- **Referencias:** MATRIZ_INTEGRACION.md; INVENTARIO_MICROSERVICIOS.md; ERRORES_Y_SOLUCIONES.md.


## 2026-11-06 — Integración de paquetería simulada

- **Fecha/hora local:** 2026-11-06 17:16 (America/Mazatlan).
- **Tarea:** integrar y adaptar AR-014 para generar guías y simular seguimiento.
- **Responsable:** Codex, autorizado por usuario.
- **Archivos afectados:** tienda-online/server.js; services/shipping-service/app.py, parcel_simulator.py, referencias-validacion-entregas y README-SIMULACION.md; public/admin.js, admin.html, admin.css, app.js, index.html; schema.sql y scripts/migrations/parcel-simulation.sql; documentación.
- **Cambios realizados:** AR-014 adaptado dentro del servicio de logística existente: regla original determinar_estado conservada y referencias originales copiadas. POST interno autenticado de simulación; gateway solo admin y SHIPPING_MODE=simulator. Guía SIM única e idempotente, avance explícito label_pending → shipped → delivered con expectedStage para evitar doble avance; fecha UTC obligatoria para validación. Transacciones y bloqueo de pedido; tablas parcel_simulations/parcel_simulation_events e historial visible al comprador solo para sus envíos. No sustituye guías anteriores; no modifica pedidos durante instalación. No hay traslado físico, correo ni avance automático.
- **Comandos/pruebas ejecutadas:** test-parcel.py, test-parcel-gateway.cjs, check-parcel-ui.cjs y node --check; correctos. Prueba MySQL temporal sin cambios en pedidos reales. Error de comillas en formato de fecha detectado al reiniciar y corregido; servicio reiniciado correctamente. Validador documental al cierre.
- **Decisiones:** reutilizar logística Python existente y adaptar regla AR-014, sin añadir otro proceso; originales conservados.
- **Riesgos/pendientes:** duplicados anteriores siguen pendientes de corrección manual; revisión visual autenticada por usuario; publicación aún pendiente. Para otra instalación importar migración antes de iniciar.
- **Siguiente paso:** recargar admin; generar guía en pedido elegible y usar Simular envío/Simular entrega.
- **Referencias:** MATRIZ_INTEGRACION.md; INVENTARIO_MICROSERVICIOS.md; INVENTARIO_FRONTEND.md; ERRORES_Y_SOLUCIONES.md.


## 2026-11-06 — Revisión de microservicios adaptables

- **Fecha/hora local:** 2026-11-06 (America/Mazatlan; hora no disponible).
- **Tarea:** identificar candidatos adicionales y adaptaciones necesarias.
- **Responsable:** Codex.
- **Archivos afectados:** documentación/REVISION_MICROSERVICIOS_ADAPTABLES.md, inventarios, matriz, errores y bitácora.
- **Cambios realizados:** Revisión comparativa de candidatos: historial (AR-012), recuperación (AR-028), reseñas (AR-003), ticket PDF (AR-019), devoluciones (AR-009), empaquetado (AR-006), bots (AR-029), ofertas (AR-015), proveedores (AR-020) y fondo (AR-018). Prioridad propuesta: historial/recuperación, después reseñas/comprobantes. Se identifican duplicidades con pedidos/inventario/roles/pago ya cubiertos; files/Parcial_1/RAR sin conciliación completa. No se integraron funciones nuevas ni se cambiaron datos.
- **Comandos/pruebas ejecutadas:** lectura de fuentes y contratos; check-bot-review.cjs confirma defecto IPv4 y control IPv6. No se instalaron ni iniciaron los candidatos; validador documental al cierre.
- **Decisiones:** prioridades propuestas, no exclusión autorizada ni nuevas integraciones.
- **Riesgos/pendientes:** identidades/datos de ejemplo/almacenamientos distintos requieren adaptación; recuperación necesita correo; política de ofertas/devoluciones por definir.
- **Siguiente paso:** seleccionar integración prioritaria usando informe.
- **Referencias:** REVISION_MICROSERVICIOS_ADAPTABLES.md; MATRIZ_INTEGRACION.md; inventarios; ERRORES_Y_SOLUCIONES.md.


## 2026-11-06 — Historial real y recuperación preparada

- **Fecha/hora local:** 2026-11-06 17:35 (America/Mazatlan).
- **Tarea:** iniciar integraciones prioritarias AR-012/028 autorizadas por usuario.
- **Responsable:** Codex.
- **Archivos afectados:** tienda-online/server.js; services/purchase-history.cjs, recovery-client.cjs; public/app.js, index.html, admin.html, purchase-history.js, recuperar.html/js; login-service/src/routes/index.js, services/password-recovery.js y recovery-mail.js; package/lock de login, esquemas/migraciones, referencias, ejemplos y README-HISTORIAL-RECUPERACION.md.
- **Cambios realizados:** AR-012 adaptado a historial real orders/order_items, páginas de10, detalle de variantes/precios/cantidades, estados e importes; identidad de sesión y consultas por comprador. Mi cuenta conserva logística; su caída no bloquea compras. AR-028 adaptado al MySQL de login (usuarios.password_hash con bcrypt), tokens SHA-256 aleatorios de un uso y una hora, invalidación previa, transacciones y límites. Enlaces Olvidé mi contraseña en tienda/admin; tokens en fragmento retirado de URL. Gateway revoca sesiones anteriores al cambiar contraseña. Tablas password_reset_tokens (login) y session_revocations (tienda), vacías al instalar; usuarios/pedidos conservados. Correo NO configurado por declaración del usuario: estado false y formulario de solicitud deshabilitado con aviso. SMTP y API HTTPS preparados, entrega real pendiente.
- **Comandos/pruebas ejecutadas:** npm install nodemailer --ignore-scripts; node --check; tres suites de historial/recuperación correctas; estado real API false; reinicio coordinado correcto. Prueba de caducidad ajustada por precisión de DATETIME a segundos antes de confirmar resultado. Pruebas de transporte no envían mensajes. Validador documental al cierre.
- **Decisiones:** usuario confirma no disponer de servicio de correo; no simular entrega ni exponer tokens. Añadida API HTTPS porque Render Free bloquea SMTP habitual según documentación oficial; ninguna cuenta/hosting contratado.
- **Riesgos/pendientes:** configurar proveedor, remitente y URL pública y probar entrega con cuenta del usuario; revisión visual autenticada a cargo del usuario. Recuperación solo vía gateway público, login interno. Publicación pendiente.
- **Siguiente paso:** usuario revisa Mi cuenta y aviso de recuperación; preparar correo cuando disponga de proveedor.
- **Referencias:** MATRIZ_INTEGRACION.md; inventarios; ERRORES_Y_SOLUCIONES.md; ../tienda-online/README-HISTORIAL-RECUPERACION.md.


## 2026-11-06 — Acceso de clientes y enlaces separados

- **Fecha/hora local:** 2026-11-06 (America/Mazatlan; hora no disponible).
- **Tarea:** mostrar inicio de sesión cliente, mantener administración en switch/pie y separar recuperación/registro.
- **Responsable:** Codex, solicitado por usuario.
- **Archivos afectados:** tienda-online/public/app.js, index.html, styles.css y server.js; documentación.
- **Cambios realizados:** Acceso de clientes explícito: Iniciar sesión visible para visitante y sesión admin; Mi cuenta solo cliente. Login de tienda rechaza rol admin sin sustituir sesión; Administración permanece en switch visible para todos y enlace de pie. API /api/account e historial requieren customer; checkout solicita sesión cliente. Recuperación/registro separados con contenedor flex, gap24px horizontal/12px vertical y ajuste de línea en móvil; CSS v37 y app v31.
- **Comandos/pruebas ejecutadas:** node --check; test-client-access.cjs y test-recovery-gateway.cjs correctos; estructura/CSS servido comprobados; validador documental al cierre.
- **Decisiones:** Mi cuenta exclusivo de cliente; mantener acceso admin en selector y pie, sin botón Administrar duplicado.
- **Riesgos/pendientes:** revisar visual tras recarga; correo pendiente de configuración.
- **Siguiente paso:** Ctrl+F5 en tienda.
- **Referencias:** MATRIZ_INTEGRACION.md; INVENTARIO_FRONTEND.md; ERRORES_Y_SOLUCIONES.md.
