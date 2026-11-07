# Matriz de integración Arrullo

## Última actualización

- **Fecha/hora local (America/Mazatlan):** 2026-11-06 23:10.
- **Tarea:** preparar la documentación y configuración segura para GitHub y Render, además de verificar el acceso local.
- **Resumen:** README integral, exclusiones para datos privados y Blueprint Render; pagos/envíos quedan desactivados hasta configurar proveedores reales. MySQL local conectado.
- **Detalle:** [bitácora](BITACORA_PROYECTO.md), [servicios](INVENTARIO_MICROSERVICIOS.md), [errores](ERRORES_Y_SOLUCIONES.md).

## Matriz

| Dominio/requisito | Evidencia disponible | Estado | Relación / decisión | Dependencia o siguiente paso | Referencia detallada |
|---|---|---|---|---|---|
| Microservicios | Maestro inicial: 30 registros, inventario estático | identificado; pendiente auditoría | No declarar funcionalidad solo por archivos presentes | Auditar contratos, dependencias, configuración y pruebas por servicio | [Inventario de servicios](INVENTARIO_MICROSERVICIOS.md) |
| Pruebas de checkout integrado | `npm test` (5/5) y `scripts/check-card-integration.cjs` (OK) | probado | La suite fija `PAYMENT_MODE=test` y desactiva el gateway externo; la prueba dedicada verifica el simulador de tarjetas y seguimiento, y limpia sus datos temporales | No se probó ningún cobro bancario real; repetir al cambiar el flujo de pago | [Errores y soluciones](ERRORES_Y_SOLUCIONES.md) |
| Conexión local de base de datos y acceso | Tienda `/api/health` y envíos `/health` devuelven `connected`; pruebas de login reportan MySQL disponible | probado | La conexión no causaba el error de pantalla: `public/app.js` llamaba `.forEach` a un único selector | Si persiste un fallo de acceso, registrar la operación y el mensaje HTTP después de cargar `app.js?v=32` | [Errores y soluciones](ERRORES_Y_SOLUCIONES.md) |
| Publicación en GitHub / hosting | README raíz, `.gitignore`, `render.yaml`, Dockerfile y guía de despliegue actualizados | requiere adaptación | No se publicó ni desplegó; MySQL alojado, TLS/CA, datos, correo, pago real y paquetería productiva requieren configuración | Seleccionar/provisionar MySQL externo, migrar con respaldo privado y definir secretos en Render | [Guía de despliegue](../tienda-online/README-DEPLOY.md) |
| Catálogo y variantes | UI adaptada; API de producto actual no tiene variantes/fotos estructuradas | requiere adaptación | Payload actual codifica talla/color en texto; persistencia estructurada pendiente | Acordar contrato de producto, variantes, fotos e inventario | [Inventario frontend](INVENTARIO_FRONTEND.md#requisitos-frontend-y-cobertura) |
| Navegación/identidad visual | Header y footer adaptados en copias | requiere adaptación | Mantener cambios de copias; sin prueba visual | Validar rutas, eventos, accesibilidad, móvil y branding final | [Inventario frontend](INVENTARIO_FRONTEND.md) |
| Dirección y envío | Formulario adaptado; sin API/persistencia ni cobertura CP | requiere adaptación | No confirmar un envío real desde la maqueta | Endpoint de pedido/dirección y reglas de cobertura + cotizador CP/peso | [Inventario frontend](INVENTARIO_FRONTEND.md#requisitos-frontend-y-cobertura) |
| Pago | Demos explícitamente simuladas | no se utilizará (propuesto) | No integrar captura de tarjeta ni afirmar cobro | Definir proveedor seguro y flujo alojado; exclusión productiva pendiente formalizar | [Errores y soluciones](ERRORES_Y_SOLUCIONES.md) |
| Pedidos, cuenta e historial | Servicios y página localizados, sin prueba end-to-end | pendiente | Selección aún no confirmada | Contratos de pedido, autenticación e historial; pruebas en entorno aislado | [Inventario de servicios](INVENTARIO_MICROSERVICIOS.md) |
| Regalos y ticket | Plantilla de comprobante localizada | requiere adaptación | Ocultar precio al destinatario y permitir nota | Ajustar plantilla y probar comprobante con pedido de prueba | [Inventario frontend](INVENTARIO_FRONTEND.md) |

## Requisitos para pasar de etapa

| De | A | Criterio mínimo |
|---|---|---|
| identificado | probado | Comando/pasos, ambiente y resultado registrados |
| probado | funciona intacto | Pruebas acordadas satisfactorias sin cambio a la copia evaluada |
| probado | requiere adaptación | Cambio necesario, alcance, riesgo y prueba posterior documentados |
| pendiente | no se utilizará (propuesto) | Justificación y alternativa; aún no es exclusión final |
| propuesto | descartado (autorizado) | Autorización registrada en bitácora; conservar fuentes y evidencia |

## Plantilla de requisito y relación

| ID / requisito | Prioridad | Evidencia y fuente | Servicio/componente relacionado | Estado | Prueba/evidencia de aceptación | Decisión / responsable / fecha | Pendiente / riesgo |
|---|---|---|---|---|---|---|---|
| [REQ-00] | [P0/P1/P2] | [ruta y observación] | [ID/ruta] | [estado permitido] | [pasos y resultado] | [decisión] | [pendiente] |

## Lista de cierre reutilizable

- [ ] Antes de trabajar, leer esta matriz y la bitácora más reciente.
- [ ] Registrar cambios en el inventario de microservicios y/o frontend cuando cambien hallazgos, estado o decisión.
- [ ] Actualizar requisitos, relaciones y referencias cruzadas en esta matriz.
- [ ] Registrar errores, causa, solución y resultado de prueba en `ERRORES_Y_SOLUCIONES.md` cuando corresponda.
- [ ] Añadir entrada fechada y completa a la bitácora, incluso si no hubo cambios o pruebas.
- [ ] Actualizar “Última actualización” con fecha/hora local, tarea, resumen y vínculo al detalle.
- [ ] Confirmar que cada afirmación de prueba tiene comando/pasos, resultado y alcance; si no, decir “no ejecutada”.
- [ ] Ejecutar `python validar_documentacion.py` desde la carpeta de integración y resolver errores antes de cerrar.
- [ ] Revisar coherencia entre matriz, inventarios y bitácora; confirmar rutas citadas y que originales/sources siguen intactos.
- [ ] Entregar al usuario rutas, archivos afectados, pruebas/resultados, decisiones y siguiente paso.

## Administración — estado actual 2026-11-06

| Requisito | Estado | Evidencia | Próxima acción |
|---|---|---|---|
| Panel y alta de productos | probado | Navegador aislado; admin.html/admin.js | Revisar con usuario y MySQL real |
| Inventario y alertas | probado | Módulo adaptado; 3 pruebas; endpoint protegido | Probar persistencia y reposición reales |
| Permisos ADMIN | probado | 12 comprobaciones HTTP aisladas 401/403/200 | Verificar cuenta ADMIN del servicio login |
| Pedidos y guías | requiere adaptación | UI conectada a endpoints existentes; validación de estado corregida | Probar pedido de demostración con servicios reales |
| Publicación | pendiente | Usuario pidió revisar antes de hosting | Elegir host tras revisión |

### Cierre de esta tarea

- [x] Leídas bitácora, matriz e inventarios.
- [x] Actualizados inventarios, matriz, errores y bitácora.
- [x] Registrado alcance exacto de pruebas y límites.
- [x] Validador documental final: OK, 6 archivos, secciones y enlaces internos verificados.
- [x] Originales preservados; respaldo de archivos modificados.
- [x] Guía con archivos, pruebas, decisiones y siguiente paso preparada para entrega.

## Acceso local recuperado — 2026-11-06

| Requisito | Estado | Evidencia | Siguiente paso |
|---|---|---|---|
| Base y cuenta anteriores | probado | Copia física conservada; ventas_db con cuenta previa | Mantener copia y preparar respaldo para hosting |
| Login de la tienda | probado | Salud 200, registro/login temporal y cuenta existente 200 | Revisión del usuario |
| Arranque desde VS Code | probado | npm.cmd start inicia base/login/tienda locales | Mantener terminal abierta |
| Seguimiento de envíos | pendiente | Sesión ya independiente de error de logística | Configurar servicio por separado |

Cierre: registros actualizados, originales preservados, pruebas reales documentadas y validación documental ejecutada al finalizar.

## Envíos — estado 2026-11-06

| Requisito | Estado | Evidencia | Siguiente paso |
|---|---|---|---|
| Catálogo CP anterior | probado | 1,142 CP activos, 20 municipios; sin sustitución | Conservar catálogo |
| Cotización CP y peso | probado | 107 MXN/180g y 125 MXN/501g; cobertura inválida rechazada | Revisar tarifa de transportista para producción |
| Seguimiento por microservicio | probado | Pedido temporal, guía/estado, aislamiento entre usuarios y 401 sin clave | Revisión visual usuario |
| Arranque conjunto | probado | npm start con MySQL, login y logística disponibles | Mantener terminal abierta |
| Admin | pendiente | Usuario/correo elegidos y asistente de contraseña preparado | Usuario define contraseña localmente |

Cierre: inventarios, matriz, errores y bitácora actualizados; prueba integral documentada; originales conservados; validación documental al finalizar.

## Cotizador comprador — 2026-11-06

| Requisito | Estado | Evidencia | Siguiente paso |
|---|---|---|---|
| Precio visible en bolsa | probado | CP81200, destino identificado, envío107/180g y total566 | Revisión usuario |
| Cotización sin dirección completa | probado | Checkout con campos vacíos cotiza por CP/peso | Ninguno |
| Confirmación conserva costo | probado | Pedido visual simulado y SQL: envío107/total566; prueba eliminada | Revisar transportista para producción |
| CP inválido | probado | 99999 rechazado y total invalidado | Ninguno |

Cierre: registros actualizados, fuentes originales y datos anteriores preservados, pruebas visuales/API documentadas y validador al finalizar.

## Ajuste final — 2026-11-06

Cotización exclusivamente en checkout: probado (bolsa sin componente y botón de cálculo preservado). Servicio tarjeta: validador probado21/21; integración pendiente de adaptar identidad/BD02 y contratos. Documentación actualizada, originales preservados y validación documental al cierre.

## Tarjeta conectada — 2026-11-06

| Requisito | Estado | Evidencia | Siguiente paso |
|---|---|---|---|
| Validador original adaptado | probado |21 pruebas originales y servicio local4321 activo | Revisar usuario |
| Pago simulado con rechazo/aprobación | probado | Integración y navegador con pedido566 | Ninguno para demostración |
| Contexto del pago protegido | probado | Firma/cliente/carrito/cotización/importe/vencimiento comprobados | Procesador real para producción |
| Registro mínimo de pago | probado | Referencia opaca en payments, sin PAN/CVV | Ninguno |

Cierre: documentación cruzada actualizada, originales preservados, datos temporales eliminados, comprobaciones realizadas y validador documental al finalizar.

## Bolsa y Visa — 2026-11-06

| Requisito | Estado | Evidencia | Siguiente paso |
|---|---|---|---|
| Reparar variantes anteriores | probado |5 pruebas y404 reproducido/reparado en API; navegador con fixture | Usuario recarga |
| No conservar carrito parcial | probado | ID asignado solo tras altas completas, error descarta estado | Revisar usuario |
| Solo Visa en selector | probado | DOM options contiene únicamente Visa | Ninguno |
| Repetición visual autenticada | pendiente | Registro temporal bloqueado por revisión automática | Autorización o usuario con cuenta existente |

Cierre: registros actualizados, fuentes y datos anteriores preservados, fixture/bolsa temporales limpiados y validador documental al finalizar.

## Sitio unificado — 2026-11-06

| Requisito | Estado | Evidencia | Siguiente paso |
|---|---|---|---|
| Mismo sitio y vistas conservadas | probado | Rutas reales200 y navegación ida/vuelta | Usuario recarga |
| Sesión común y cierre entre pestañas | probado | Pruebas aisladas sin cuentas nuevas | Revisión usuario con Admin |
| Permisos separados | probado | Cliente403, admin200, rol cambiado/ausente401 | Ninguno |
| Diseño de cada parte conservado | probado | Pantallas mantenidas, estilos nuevos solo selector común | Revisar visual autenticado usuario |

Cierre: inventarios, matriz, errores y bitácora actualizados; respaldos creados; datos originales y cuentas preservados; pruebas y límites documentados; validador documental al finalizar.

## Ajuste de acceso — 2026-11-06

Login explícito ADMIN por visita: probado en entorno aislado, incluyendo sesión anterior, historial y rol cliente. Texto de pedidos servido correctamente. Revisión visual autenticada por usuario pendiente. Registros actualizados, cuentas originales preservadas y validador documental al cierre.

## Publicación — pendiente 2026-11-06

Fuentes preparadas y verificadas; falta elegir proveedor/cuenta, completar configuración de cuatro servicios y MySQL alojado y migrar datos. Página aún no publicada. Registros actualizados y validación documental al cierre.


## Guías únicas — 2026-11-06

Estado: probado. Guías únicas entre pedidos: normalización de espacios y mayúsculas, bloqueo MySQL por guía durante comprobación y guardado; respuesta 409 si pertenece a otro pedido. Pruebas de validación y concurrencia MySQL correctas sin crear cuentas ni modificar pedidos. Un grupo duplicado anterior conservado para corrección manual. Archivos: tienda-online/server.js y services/admin-service/tracking.cjs.

Cierre: respaldo creado, datos preservados, registros actualizados y validador documental al finalizar.


## Paquetería simulada — revisión 2026-11-06

Estado: requiere adaptación. AR-014 revisado: simulador paqueteria.py devuelve cuatro envíos fijos (1001–1004); no genera guías ni crea envíos. Lógica original aislada probada en cinco escenarios: tránsito pendiente, entregado con fecha validada, entregado sin fecha rechazada y desconocido sin resultado. API FastAPI y persistencia SQLAlchemy no iniciadas. Viable adaptar para emitir guías SIM únicas, guardar eventos y fecha de entrega y consumir la validación desde logística. Pendiente implementar; ninguna guía/pedido/cuenta modificada.

Cierre de revisión: registros actualizados; originales y datos preservados; validador documental al finalizar.


## Paquetería simulada integrada — 2026-11-06

Estado: probado como adaptación. AR-014 adaptado dentro del servicio de logística existente: regla original determinar_estado conservada y referencias originales copiadas. POST interno autenticado de simulación; gateway solo admin y SHIPPING_MODE=simulator. Guía SIM única e idempotente, avance explícito label_pending → shipped → delivered con expectedStage para evitar doble avance; fecha UTC obligatoria para validación. Transacciones y bloqueo de pedido; tablas parcel_simulations/parcel_simulation_events e historial visible al comprador solo para sus envíos. No sustituye guías anteriores; no modifica pedidos durante instalación. No hay traslado físico, correo ni avance automático.

Cierre: inventarios, errores, bitácora y matriz actualizados; respaldo creado; pruebas sin cuentas nuevas; originales y pedidos preservados; validador documental al cierre.


## Candidatos adicionales — 2026-11-06

Revisión comparativa de candidatos: historial (AR-012), recuperación (AR-028), reseñas (AR-003), ticket PDF (AR-019), devoluciones (AR-009), empaquetado (AR-006), bots (AR-029), ofertas (AR-015), proveedores (AR-020) y fondo (AR-018). Prioridad propuesta: historial/recuperación, después reseñas/comprobantes. Se identifican duplicidades con pedidos/inventario/roles/pago ya cubiertos; files/Parcial_1/RAR sin conciliación completa. No se integraron funciones nuevas ni se cambiaron datos.

Estado: requiere adaptación. [Informe de revisión](REVISION_MICROSERVICIOS_ADAPTABLES.md). Cierre: registros actualizados y validador documental al finalizar; originales, sitio y datos preservados.


## Historial/recuperación — 2026-11-06

AR-012 adaptado a historial real orders/order_items, páginas de10, detalle de variantes/precios/cantidades, estados e importes; identidad de sesión y consultas por comprador. Mi cuenta conserva logística; su caída no bloquea compras. AR-028 adaptado al MySQL de login (usuarios.password_hash con bcrypt), tokens SHA-256 aleatorios de un uso y una hora, invalidación previa, transacciones y límites. Enlaces Olvidé mi contraseña en tienda/admin; tokens en fragmento retirado de URL. Gateway revoca sesiones anteriores al cambiar contraseña. Tablas password_reset_tokens (login) y session_revocations (tienda), vacías al instalar; usuarios/pedidos conservados. Correo NO configurado por declaración del usuario: estado false y formulario de solicitud deshabilitado con aviso. SMTP y API HTTPS preparados, entrega real pendiente.

Historial: probado. Recuperación: requiere adaptación/configuración de correo para completar prueba real. Cierre de trabajo disponible: respaldos, inventarios, errores y bitácora actualizados; originales/cuentas/pedidos preservados; validador documental al finalizar.


## Acceso cliente — 2026-11-06

Estado: probado en lógica/contratos. Acceso de clientes explícito: Iniciar sesión visible para visitante y sesión admin; Mi cuenta solo cliente. Login de tienda rechaza rol admin sin sustituir sesión; Administración permanece en switch visible para todos y enlace de pie. API /api/account e historial requieren customer; checkout solicita sesión cliente. Recuperación/registro separados con contenedor flex, gap24px horizontal/12px vertical y ajuste de línea en móvil; CSS v37 y app v31.

Cierre: respaldos, registros y pruebas completos; datos/cuentas preservados; validador documental al finalizar.
