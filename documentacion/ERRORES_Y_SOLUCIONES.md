# Errores, soluciones y pruebas

Registrar problemas observados y pruebas relevantes. No exponer secretos, tokens, tarjetas ni datos personales. Un error no se considera resuelto hasta documentar la comprobación que lo confirma.

## Registro actual

| ID | Fecha/hora local | Área | Error / síntoma | Causa confirmada o hipótesis | Solución / cambio | Prueba y resultado | Estado / referencia |
|---|---|---|---|---|---|---|---|
| ERR-001 | 2026-11-04 | Empaquetado frontend | No se pudo iniciar/build | `next` ausente en `node_modules` y falta `NEXT_PUBLIC_API_URL`; causa observada en copia | No instalar dependencias ni crear configuración en extracción; dejar pendiente un entorno aislado | No se ejecutó build ni aplicación | pendiente · [bitácora](BITACORA_PROYECTO.md) |
| ERR-002 | 2026-11-04 | Pago | La interfaz solicita datos completos de tarjeta en una demo | Código/texto declara simulación; no se confirmó cobro | No enviar datos ni integrar captura; reemplazo futuro con proveedor seguro alojado | No se ejecutó ni probó | no se utilizará (propuesto) · [matriz](MATRIZ_INTEGRACION.md) |
| ERR-003 | 2026-11-04 | Navegador local | Apertura de demo local bloqueada | Restricción del navegador/herramienta observada; causa interna no confirmada | No se intentó sortearla; renderizado visual queda pendiente | Sin prueba visual | pendiente · [inventario frontend](INVENTARIO_FRONTEND.md) |
| ERR-004 | 2026-11-06 | Prueba de checkout | La expectativa de rechazo por peso recibía HTTP 402 | La suite heredaba `CARD_SERVICE_URL` de `.env`; el token sintético de prueba se validaba como comprobante real antes de iniciar la transacción | La prueba fija `PAYMENT_MODE=test` y limpia `CARD_SERVICE_URL` antes de importar el servidor | `npm test`: 5/5; `scripts/check-card-integration.cjs`: OK; datos temporales limpiados | probado; no incluye cobro bancario real · [bitácora](BITACORA_PROYECTO.md) |
| ERR-005 | 2026-11-06 | Acceso y catálogo local | `TypeError: $(...).forEach is not a function` al iniciar la tienda | `app.js` usaba el selector de un elemento (`$`) para enlazar los selectores de color repetidos; el error interrumpía `render()` | Se usa el selector múltiple `$$` y se incrementa la versión del recurso a `app.js?v=32` para evitar caché obsoleta | Tienda `/api/health` y envíos `/health`: conectados; login informa MySQL disponible; navegador: 10 productos, modal de acceso abre y sin errores JS nuevos; integración 5/5 | probado; no se modificó configuración de MySQL · [bitácora](BITACORA_PROYECTO.md) |

## Plantilla de error / solución

| Campo | Valor |
|---|---|
| ID / fecha y hora local / responsable | [completar] |
| Área / entorno / versión | [completar sin secretos] |
| Síntoma y pasos para reproducir | [completar] |
| Causa | confirmada / hipótesis (indicar evidencia) |
| Solución o mitigación / archivos afectados | [completar] |
| Prueba posterior, comando/pasos y resultado | [completar; o no ejecutada] |
| Estado | identificado / probado / funciona intacto / requiere adaptación / pendiente / no se utilizará (propuesto) / descartado (autorizado) |
| Riesgo residual / decisión / enlace de bitácora | [completar] |

## Plantilla de prueba

| ID | Objetivo | Ambiente y prerequisitos | Comando/pasos | Resultado esperado | Resultado observado | Evidencia/ruta | Estado y fecha |
|---|---|---|---|---|---|---|---|
| TEST-00 | [completar] | [completar] | [completar] | [completar] | [completar] | [ruta] | [pendiente/probado] |

## Pruebas de administración — 2026-11-06

- ERR-ADMIN-01: app.js asignaba accountSubmit a un evento, sin declaración; beginCheckout y fillAddresses también ausentes. Restauradas; sintaxis verificada. Flujo completo con datos reales pendiente.
- ERR-ADMIN-02: PATCH de pedidos aceptaba un estado arbitrario si incluía guía. Ahora valida el estado antes de escribir; petición con estado inválido y guía devuelve 400 en prueba HTTP aislada.
- TEST-ADMIN-01: node --test services/admin-service/administracion.test.js, Node local, 3/3 correctas (mínimo inclusivo, inventario pausado/vacío, agregación sin JOIN de líneas).
- TEST-ADMIN-02: 12 peticiones HTTP a me/inventory/orders/reports con roles sin sesión/cliente/admin: respuestas 401/403/200; 1 petición de estado inválido: 400; MySQL sustituido, sin cambios reales.
- TEST-ADMIN-03: navegador local aislado, datos ficticios: acceso, resumen, inventario, pedidos y alta renderizados; sin errores JavaScript registrados. No prueba persistencia.
- TEST-ADMIN-04: node --check servidor, tienda y administrador: correctos. Pruebas de integración MySQL no ejecutadas; faltan dependencias y configuración local.
- TEST-ADMIN-DOC: validar_documentacion.py ejecutado con Python 3.13.17 desde Arrullo: OK, 6 archivos, secciones mínimas y enlaces internos verificados.

[Detalle y limitaciones](../tienda-online/README-ADMIN.md).

## Inicio local — 2026-11-06

JWT_SECRET requerida: causa confirmada, no existía .env. Se creó clave aleatoria local sin exponerla. npm.cmd start inicia y /admin.html devuelve 200. /api/health no supera comprobación: base MySQL pendiente. Estado: probado para arranque; integración pendiente.

## Error interno de acceso — 2026-11-06

Causa confirmada de configuración: tienda con MySQL 56442 sin escucha y sin AUTH_SERVICE_URL. MySQL80 activo en equipo; conexión del login original rechazada por credenciales. No se probaron contraseñas de usuarios ni se cambiaron cuentas. Corregido manejo de fallos de conexión a 503, timeout remoto de 5 segundos, validación de contrato y preservación de 401/403/423/429. Pruebas: node --test services/login-client.test.cjs, 5/5; sintaxis correcta. Login real pendiente de configuración.

Verificación posterior: servidor reiniciado; POST /api/auth/login con identidad ficticia devuelve 503 y mensaje de conexión MySQL, sin exponer secretos. Pruebas de cliente 5/5, permisos HTTP 12 más estado inválido correctos. Validador documental: OK, 6 archivos y enlaces internos.

## Recuperación de la base anterior — 2026-11-06

Resuelta conexión pendiente: base original localizada en proyecto anterior, mysql-data2; copia a tienda-online/mysql-data-local y arranque de MySQL 8.0.46 en 56442. Login conectado a ventas_db, tienda a arrullo_test. Una cuenta CLIENTE anterior conservada. Salud de ambos servicios HTTP 200. Prueba de registro e inicio de sesión reales vía tienda con identidad temporal: correcta; limpieza de esa identidad y conteo original verificados. Servicio registró también login 200 de cuenta existente. npm start unificado probado; seguimiento de envíos pendiente independiente. Validación documental al cierre.

## Cálculo y seguimiento — 2026-11-06

Causas: SHIPPING_MODE no configurado; microservicio sin .env, sin entorno Python y ausente del arranque. Catálogo postal sí presente: 1,142 CP activos, 20 municipios. Corregida configuración, arranque y comprobación de salud real. Prueba de integración scripts/check-shipping.cjs: correcta; cotizaciones por CP/peso, checkout simulado, envío visible solo por propietario, guía y estado reflejados; 401 sin clave. Datos temporales eliminados y stock repuesto.

## Cotizador oculto por validación de formulario — 2026-11-06

Causa: quote() exigía reportValidity() de toda la dirección y creaba dirección/carrito antes de mostrar precio. Corregido: CP/peso suficientes para cotizar; persistencia de dirección/carrito solo al confirmar. Agregado cálculo en bolsa sin sesión y desglose de envío. Prueba visual real: 81200/180g=107; prenda459+envío107=566; 99999 rechazado. Checkout sin dirección completa cotiza; pedido simulado final conserva envío107/total566 en SQL. Prueba limpiada, inventario repuesto, consola sin errores.

## Ajuste de ubicación y validación de tarjeta — 2026-11-06

Cotizador de bolsa retirado; comprobación visual correcta, contador de componente0 y botón checkout1; sin errores JS. Prenda temporal retirada. Validador de tarjeta original: 21/21 pruebas correctas en copia de trabajo con Node24, import ajustado para resolución .ts. No prueba integración con MySQL, gateway ni bancos; servicio no conectado al checkout.

## Conexión del validador — 2026-11-06

Corregido token de pago inventado en frontend: ahora se exige autorización firmada por microservicio y vinculada al contexto del pedido. Tests originales21/21 y firmas2/2. scripts/check-card-integration.cjs correcto: aprobada, rechazada, sin fondos, rechazo al pago, vencida, sin sesión, carrito ajeno, comprobante falso/alterado, cambio de importe, persistencia de referencia opaca, pedido y seguimiento. Navegador: rechazo bloquea confirmación; aprobación habilita y crea pedido de demostración566 (envío107). Datos temporales limpiados y stock repuesto; no se hicieron cobros.

## Variante no encontrada — 2026-11-06

Reproducido con ID demo guardado en bolsa: POST items devuelve404 antes de validar tarjeta. Además prepareCheckout guardaba cartId antes de terminar altas: reintento podía reutilizar carrito vacío/parcial. Corregidos conciliación con catálogo y guardado tardío de cartId; errores señalan prendas que requieren revisión.5/5 pruebas, integración real de reparación y compra simulada correctas; limpieza y reposición realizadas. Navegador reparó bolsa vacía sembrada con fixture y comprobó selector Visa. Revisión automática bloqueó nueva cuenta temporal por falta de autorización explícita, sin reintento; se solicitó permiso.

## Integración de vistas — 2026-11-06

Resuelta navegación fragmentada y ausencia de sincronización entre pestañas.4/4 pruebas: sesión compartida y cierre, vencimiento sin borrar sesión por fallo temporal, respuesta antigua no restaura sesión, vistas y permisos (cliente/admin/usuario inexistente/rol cambiado). Backend aislado con BD sustituida y sin escrituras. Rutas reales cuatro200; navegador tienda→admin→tienda sin errores. No se crearon cuentas nuevas, conforme a preferencia del usuario.

## Panel abierto por sesión compartida — 2026-11-06

Causa: if(A.token)enter() y eventos compartidos abrían panel sin formulario nuevo. Retirados; confirmación de login en memoria solo tras POST exitoso y rol ADMIN. Visita/historial/cambio de sesión exigen formulario.8/8 pruebas aisladas correctas, sin altas de usuarios; archivo servido v4 y subtítulo comprobados.

## Acceso administrativo duplicado — 2026-11-06

Resuelto botón Administrar redundante con switch. Se oculta por rol ADMIN en sincronización de sesión y CSS respeta hidden. Visitantes/clientes conservan Cuenta/Mi cuenta. Sin altas de usuarios ni cambios de roles. Sintaxis y recurso HTTP comprobados.

## Redacción de administración — 2026-11-06

Retiradas frases decorativas del administrador según solicitud. Encabezados, ayudas y mensajes operativos actualizados. Comprobaciones de sintaxis, acceso y HTTP al cierre; revisión visual de usuario pendiente.

## Lista vacía de alertas por categoría — 2026-11-06

Mensaje genérico No hay variantes para este filtro confundía ausencia de alertas con ausencia de inventario. BD real conserva66 variantes de pijamas y ninguna bajo mínimo5. Corregida UI con alcance/conteo, vacío contextual y acceso al inventario completo conservando filtro.2 pruebas aisladas correctas; sin modificaciones de datos.

## Comprobación previa a hosting — 2026-11-06

Detectado manifiesto incompleto (faltan login/tarjetas) y dependencia de MySQL local. ZIP de113 fuentes limpio con integridad correcta; excluidos .env privados, dependencias instaladas, datos MySQL, logs y respaldos. Se verificó en memoria ausencia de valores secretos actuales en fuentes. Sin publicación ni migración; siguiente paso elegir hosting.


## Guías duplicadas — 2026-11-06

Guías únicas entre pedidos: normalización de espacios y mayúsculas, bloqueo MySQL por guía durante comprobación y guardado; respuesta 409 si pertenece a otro pedido. Pruebas de validación y concurrencia MySQL correctas sin crear cuentas ni modificar pedidos. Un grupo duplicado anterior conservado para corrección manual. Archivos: tienda-online/server.js y services/admin-service/tracking.cjs.


## Revisión de paquetería simulada — 2026-11-06

AR-014 revisado: simulador paqueteria.py devuelve cuatro envíos fijos (1001–1004); no genera guías ni crea envíos. Lógica original aislada probada en cinco escenarios: tránsito pendiente, entregado con fecha validada, entregado sin fecha rechazada y desconocido sin resultado. API FastAPI y persistencia SQLAlchemy no iniciadas. Viable adaptar para emitir guías SIM únicas, guardar eventos y fecha de entrega y consumir la validación desde logística. Pendiente implementar; ninguna guía/pedido/cuenta modificada.


## Paquetería simulada integrada — 2026-11-06

AR-014 adaptado dentro del servicio de logística existente: regla original determinar_estado conservada y referencias originales copiadas. POST interno autenticado de simulación; gateway solo admin y SHIPPING_MODE=simulator. Guía SIM única e idempotente, avance explícito label_pending → shipped → delivered con expectedStage para evitar doble avance; fecha UTC obligatoria para validación. Transacciones y bloqueo de pedido; tablas parcel_simulations/parcel_simulation_events e historial visible al comprador solo para sus envíos. No sustituye guías anteriores; no modifica pedidos durante instalación. No hay traslado físico, correo ni avance automático.

Pruebas: flujo completo y consultas comprador en MySQL con tablas temporales; autenticación interna401; gateway visitante401/cliente403/admin200 con servicio sustituido; generación/avance/fecha/historial/idempotencia/guías anteriores/cancelados/usuario distinto correctos. Controles UI probados de forma aislada. Consultas reales admin/logística de solo lectura correctas. No se crearon cuentas. Revisión visual autenticada pendiente del usuario.


## Candidatos de integración — 2026-11-06

Revisión comparativa de candidatos: historial (AR-012), recuperación (AR-028), reseñas (AR-003), ticket PDF (AR-019), devoluciones (AR-009), empaquetado (AR-006), bots (AR-029), ofertas (AR-015), proveedores (AR-020) y fondo (AR-018). Prioridad propuesta: historial/recuperación, después reseñas/comprobantes. Se identifican duplicidades con pedidos/inventario/roles/pago ya cubiertos; files/Parcial_1/RAR sin conciliación completa. No se integraron funciones nuevas ni se cambiaron datos.

Estado: requiere adaptación; revisión estática salvo firma de AR-029 probada aisladamente. Defecto IPv4 reproducido por separación con puntos en token. Servicios restantes no ejecutados en esta revisión. Detalle: [revisión](REVISION_MICROSERVICIOS_ADAPTABLES.md).


## Historial y recuperación — 2026-11-06

AR-012 adaptado a historial real orders/order_items, páginas de10, detalle de variantes/precios/cantidades, estados e importes; identidad de sesión y consultas por comprador. Mi cuenta conserva logística; su caída no bloquea compras. AR-028 adaptado al MySQL de login (usuarios.password_hash con bcrypt), tokens SHA-256 aleatorios de un uso y una hora, invalidación previa, transacciones y límites. Enlaces Olvidé mi contraseña en tienda/admin; tokens en fragmento retirado de URL. Gateway revoca sesiones anteriores al cambiar contraseña. Tablas password_reset_tokens (login) y session_revocations (tienda), vacías al instalar; usuarios/pedidos conservados. Correo NO configurado por declaración del usuario: estado false y formulario de solicitud deshabilitado con aviso. SMTP y API HTTPS preparados, entrega real pendiente.

Estado: historial probado; recuperación probada con BD temporal y transporte sustituido, requiere configuración/prueba de correo real. Pruebas: test-history-recovery.cjs, test-recovery-gateway.cjs, test-recovery-mail.cjs; bcrypt real, caducidad/reutilización/inactivos/desconocidos, paginación/aislamiento, revocación y cuenta sin logística correctos. Estado real de recuperación available=false. No se enviaron mensajes ni crearon cuentas reales. Documentación: tienda-online/README-HISTORIAL-RECUPERACION.md.


## Acceso cliente y separación de enlaces — 2026-11-06

Acceso de clientes explícito: Iniciar sesión visible para visitante y sesión admin; Mi cuenta solo cliente. Login de tienda rechaza rol admin sin sustituir sesión; Administración permanece en switch visible para todos y enlace de pie. API /api/account e historial requieren customer; checkout solicita sesión cliente. Recuperación/registro separados con contenedor flex, gap24px horizontal/12px vertical y ajuste de línea en móvil; CSS v37 y app v31.

Pruebas: test-client-access.cjs y test-recovery-gateway.cjs correctos; visitante/admin/cliente y API cliente200/admin403 sin cuentas nuevas; separación revisada en estructura/CSS servido. Revisión visual por usuario pendiente.
