# Inventario de microservicios y servicios

**Corte documental:** 2026-11-04. **Fuente:** auditoría estática del espejo `Arrullo microservicios`; los originales permanecen intactos. **Estado global:** identificado, sin pruebas de ejecución ni decisión de integración confirmada.

## Registro

La lista completa de servicios (30 registros, incluidas carpetas sin paquete homónimo) se conserva en esta tabla. “Identificado” solo indica presencia/inventario; no implica que compile o funcione.

| ID | Servicio | Tecnologías detectadas | Evidencia | Estado | Decisión / siguiente paso |
|---|---|---|---|---|---|
| AR-001 | AlertaStockMinimo | .NET/C# | 9 archivos; manifiesto `.csproj` | identificado | Auditar estructura, dependencias y contrato |
| AR-002 | biblioteca-menu | JavaScript/TypeScript; HTML/CSS | 5 archivos | identificado | Referencia frontend; no es servicio backend |
| AR-003 | comentarios-resenas-service | JavaScript/TypeScript | 9 archivos; `package.json` | identificado | Auditar endpoints y persistencia |
| AR-004 | CRUD INVENTARIO | JavaScript/TypeScript | 16 archivos; `package.json` | identificado | Auditar contrato y compatibilidad |
| AR-005 | domicilio | HTML/CSS | 1 archivo | identificado | UI adaptada; persistencia/API pendiente |
| AR-006 | empaquetado-service-main | JavaScript/TypeScript | 87 archivos; `package.json` | identificado | Next no instalado en copia; API/configuración pendiente |
| AR-007 | Encabezado | JavaScript/TypeScript; HTML/CSS | 3 archivos | identificado | Componente adaptado; prueba visual pendiente |
| AR-008 | files | JavaScript/TypeScript; HTML/CSS | 11 archivos; sin ZIP homónimo | identificado | Resolver origen/duplicidad |
| AR-009 | garantias-devoluciones | JavaScript/TypeScript; HTML/CSS | 71 archivos; `package.json` | identificado | SPA administrativa; API/roles por validar |
| AR-010 | Inventario | JavaScript/TypeScript; Docker | 20 archivos; `Dockerfile`, `package.json` | identificado | Auditar y distinguir de CRUD INVENTARIO |
| AR-011 | logistica_envios_python_arreglado | Python; HTML/CSS | 10 archivos; `requirements.txt` | identificado | Cotización por CP/peso pendiente |
| AR-012 | microservicio-historial-compras-main (1) | Python; HTML/CSS | 3 archivos | identificado | Integrar con pedidos/autenticación tras validar |
| AR-013 | microservicio-login | JavaScript/TypeScript; HTML/CSS | 30 archivos | identificado | Auditoría técnica y de seguridad pendiente |
| AR-014 | microservicio-validacion-entregas | JavaScript/TypeScript; Python | 2,277 archivos | identificado | Auditar; el conteo no prueba integridad |
| AR-015 | MicroservicioStockMaxOfertas | .NET/C# | 9 archivos | identificado | Auditar reglas y contrato |
| AR-016 | Parcial_1 | JavaScript/TypeScript; Python; HTML/CSS | 2,250 archivos | identificado | Revisar alcance/duplicidad antes de seleccionar |
| AR-017 | RegistroPedidosService-main | .NET/C# | 13 archivos | identificado | Auditar contrato central de pedidos |
| AR-018 | Servicio_Fondo | .NET/C# | 15 archivos | identificado | Determinar propósito y relevancia |
| AR-019 | Servicio_Generar_Ticket | JavaScript/TypeScript; Python; HTML/CSS | 7,143 archivos | identificado | Plantilla candidata; adaptación de regalo pendiente |
| AR-020 | servicio_proveedores_python_mysql_json | Python | 7 archivos | identificado | Auditar alcance, datos y acceso |
| AR-021 | servicio-reporte-compras (2) | JavaScript/TypeScript | 31 archivos | identificado | Auditar alcance y acceso a datos |
| AR-022 | servicio-roles | JavaScript/TypeScript | 11 archivos | identificado | Auditar permisos e integración de identidad |
| AR-023 | servicio-verificacion-rol | JavaScript/TypeScript | 14 archivos | identificado | Comparar con servicio-roles |
| AR-024 | servicio-verificacion-tarjeta | JavaScript/TypeScript; HTML/CSS; Docker | 37 archivos | identificado | Demo simulada; no usar para datos de tarjeta |
| AR-025 | serviciopago | Python; HTML/CSS | 5 archivos | identificado | Pago explícitamente simulado; excluir de cobro productivo |
| AR-026 | SOA - Pie de pagina | JavaScript/TypeScript; HTML/CSS | 4 archivos | identificado | Pie reusable/adaptado; prueba visual pendiente |
| AR-027 | soa-agregar-producto | JavaScript/TypeScript; .NET/C#; HTML/CSS | 14 archivos | identificado | UI adaptada; backend no modela variantes/fotos |
| AR-028 | soa-servicio-reset-password-main | JavaScript/TypeScript; HTML/CSS | 25 archivos | identificado | Auditar flujo seguro y contrato |
| AR-029 | verificacion-bot | JavaScript/TypeScript | 6 archivos | identificado | Determinar función, dependencias y necesidad |
| AR-030 | DEVOLUCIONES MATA (paquete RAR; carpeta homónima no localizada) | JavaScript/TypeScript | 11 archivos | identificado | Resolver relación/duplicidad antes de uso |

> Nota de conciliación: nombres, tecnologías y conteos resumidos del registro maestro al corte 2026-11-04. Para marcadores, dependencias declaradas y justificación por registro, consultar `registro-maestro.csv` en el espejo de auditoría. Los conteos no representan archivos revisados funcionalmente. No copiar ni editar los paquetes originales.

## Plantilla de servicio

| Campo | Valor |
|---|---|
| ID / nombre / ruta de la copia | [completar] |
| Función observada y evidencia | [completar; separar hecho de inferencia] |
| Tecnología / versión / dependencias | [completar] |
| Contrato: endpoints, datos, auth, errores | [completar o pendiente] |
| Configuración requerida (sin valores secretos) | [completar] |
| Pruebas / comandos / resultado | [completar; no probado si no se ejecutó] |
| Estado | identificado / probado / funciona intacto / requiere adaptación / pendiente / no se utilizará (propuesto) / descartado (autorizado) |
| Riesgos, cambios, decisión y siguiente paso | [completar] |

## Estados y criterio

- **identificado:** archivos o símbolos localizados; funcionamiento no demostrado.
- **probado:** se ejecutó una prueba descrita con resultado reproducible; no equivale automáticamente a aceptación.
- **funciona intacto:** prueba acordada satisfactoria sin modificar la copia evaluada.
- **requiere adaptación:** sirve de base con cambios explícitos registrados.
- **pendiente:** evidencia o decisión insuficiente para avanzar.
- **no se utilizará (propuesto):** recomendación aún pendiente de autorización.
- **descartado (autorizado):** exclusión aprobada y registrada; no borrar los originales.

## Adaptaciones para administración — 2026-11-06

- AR-004 CRUD INVENTARIO: requiere adaptación; consultas transformadas de productos planos a products/product_variants en services/admin-service/administracion.js; copia original en referencias/inventario-producto.service.js.
- AR-001 AlertaStockMinimo: probado en módulo adaptado; regla inclusiva CantidadActual <= StockMinimo conservada, mínimo configurable; prueba de borde ejecutada.
- AR-021 reporte-compras: requiere adaptación; criterio de suma de cabeceras sin duplicados trasladado a ventas, sin representar compras/proveedores.
- AR-027 soa-agregar-producto: requiere adaptación; flujo formulario/fetch/errores adaptado a prendas, 3–4 fotos y variantes en public/admin.js.
- AR-013 login y AR-011 envíos: integración existente conservada; no se ejecutaron servicios reales en esta tarea.

Estado de los originales: no modificados; no se declara que funcionen intactos. [Contratos, pruebas y siguientes pasos](../tienda-online/README-ADMIN.md).

## Login — revisión 2026-11-06

AR-013: requiere adaptación/configuración. Cliente en tienda-online/services/login-client.cjs probado con 5 casos aislados; MySQL original rechaza configuración existente, y tienda no configura AUTH_SERVICE_URL. Conexión real pendiente; cuentas y fuentes originales conservadas.

## AR-013 — Login reconectado, 2026-11-06

Estado: probado con MySQL recuperado. Copia integrada services/login-service; conexión ventas_db en 56442, HTTP local 4318. npm ci correcto. Salud 200; registro y login reales vía gateway, con identidad temporal eliminada; cuenta previa conservada y acceso 200 observado. Configuración original de Arrullo microservicios intacta. Inicio coordinado en scripts/start-local.cjs. AR-011 seguimiento continúa pendiente de configuración.

## AR-011 — Seguimiento conectado y probado, 2026-11-06

Copia integrada en services/shipping-service, Flask/Python/MySQL, endpoint privado /api/v1/arrullo/users/{id}/shipments con clave compartida. Conectado a arrullo_test recuperado, lectura de shipments/orders/addresses. Salud comprueba BD y tabla. npm start lo inicia en 4320 con .venv propia. Prueba de pedido/guía/estado real, cliente aislado y clave interna correctas. Original Arrullo microservicios preservado. Cotización tarifaria se mantiene en backend con catálogo SEPOMEX y simulador local.

## AR-024 y AR-025 — revisión de tarjeta, 2026-11-06

AR-024 servicio-verificacion-tarjeta: validación pura probada (21/21 pruebas originales en copia de trabajo). Comprueba Luhn, marca/longitud, vencimiento y CVV. Endpoints /tarjetas/verificar, /tarjetas y /pagos/verificar-tarjeta; usa identidad propia y esquema BD02/Prisma distinto de Arrullo. Autorización con pasarelaSimulada.ts; backend completo no iniciado ni integrado. AR-025 serviciopago: revisión de README, simulador FastAPI, operaciones en memoria; sin ejecución. Originales preservados. Estado de integración: requiere adaptación.

## AR-024 — Integración ejecutada, 2026-11-06

Estado: probado como adaptación. Copia en services/card-service; servidor Node local4321 y acceso interno con clave. Funciones originales tarjeta.ts, pasarelaSimulada.ts y limiteIntentos.ts conservadas como referencias y convertidas sin tipos para ejecución JS. Sin importar identidad ni migraciones BD02. POST /api/v1/cards/verify devuelve comprobante firmado tras validar tarjeta/autorización simulada; gateway /api/payments/verify-card usa identidad y totales BD de Arrullo.21 pruebas originales,2 de comprobantes, integración real y navegador correctos. Solo tarjetas ficticias predefinidas. AR-025 no requerido para esta integración; no ejecutado.

## Identidad común de sitio — 2026-11-06

AR-013 conservado como login existente. Gateway añade GET /api/auth/me para consultar cuenta activa y verificar concordancia de rol de sesión. Tienda/panel consumen la misma sesión; no se crea segunda identidad. Pruebas de rol/usuario ausente/vistas en BD sustituida correctas, sin altas de usuarios. Servicios de envíos y tarjetas permanecen conectados al mismo backend.

## Inventario/stock — evidencia 2026-11-06

Consulta real de solo lectura con crearAdministracion(pool).inventario(): Pijamas4 productos/66 variantes, Ropa diaria2/45, Mamelucos4/72; cero variantes activas bajo mínimo5. No evidencia de catálogo vacío. Se aclara UI de alertas, sin modificar API ni datos.

## Publicación — preparación 2026-11-06

Servicios activos locales: gateway/tienda Node, login Node, logística Python y validador de tarjetas Node; MySQL local con bases arrullo_test y ventas_db. render.yaml actual solo declara tienda/logística, no login/tarjetas; requiere completar según hosting elegido y migrar datos. No desplegado.


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
