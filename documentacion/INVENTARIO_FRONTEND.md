# Inventario frontend

**Corte:** 2026-11-04. **Fuente:** `arrullo-auditoria/auditoria-frontend.md`, revisión estática. No se ejecutaron builds ni flujos; por ello no hay componentes marcados como probados o “funciona intacto”. Los cambios descritos corresponden a copias de extracción, no a paquetes originales.

## Componentes y superficies

| Proyecto / ruta | Función observada | Evidencia y estado | Adaptación / decisión |
|---|---|---|---|
| `empaquetado-service-main/web/src/app/` | App Next: dashboard de empaquetados | Encontrado; no iniciado: falta `next` instalado y `NEXT_PUBLIC_API_URL` | Reutilizar patrones UI/API tras preparar entorno; no reutilizar pantalla de dominio intacta |
| `empaquetado-service-main/web/src/components/` y `src/services/` | Formularios, tabla, diálogo, feedback, cliente HTTP | Identificado estáticamente; sin ejecución | Candidato de patrones; validar licencias/contrato y estados |
| `biblioteca-menu/{index.html,menu.css,menu.js}` | Menú web estático | Identificado; no probado | Referencia visual, comparar con header |
| `Encabezado/{tienda-header.js,demo.html}` | Web Component con navegación, búsqueda, carrito y menú móvil | Copia adaptada a paleta Arrullo; sin renderizado de prueba | Revisar accesibilidad, rutas/eventos y riesgos de interpolación antes de integrar |
| `SOA - Pie de pagina/app-footer.js` | Pie de página | Copias adaptadas; revisión estática | Validar enlaces y prueba responsive |
| `soa-agregar-producto/.../Frontend/` | Alta/lista administrativa de catálogo | Copia adaptada; no se llamó API | Backend actual no modela variantes/fotos; coordinación pendiente |
| `garantias-devoluciones/web/src/` | SPA administrativa de solicitudes | Identificado; no probado | Posible admin de pedidos/devoluciones, adaptar roles y API |
| `domicilio/domicilio/index.html` | Captura de dirección de entrega | Copia adaptada, validación local; sin persistencia ni API | Conectar a pedido y validar cobertura real por CP |
| `logistica_envios_python_arreglado/templates/` | Panel de lista/alta de envíos | Identificado; sin cotizador cliente | Adaptar si contrato permite cotizar CP + peso |
| `microservicio-historial-compras-main (1)/HistorialCompras.html` | Historial | Archivo encontrado; no integrado | Adaptar a pedidos y autenticación |
| `servicio-verificacion-tarjeta/public/` | Demo visual de tarjetas | Demo no segura para captura productiva | No integrar; usar proveedor de pago con campos alojados/redirección |
| `serviciopago/index.html` | Simulación explícita de pago | No ejecutado, no realiza cobro | Excluir del checkout productivo |
| `Servicio_Generar_Ticket/.../ticket_template.html` | Comprobante | Plantilla identificada | Adaptar regalo: ocultar precio e incluir nota |
| `soa-servicio-reset-password-main/frontend/` | Recuperación de contraseña | Identificado, sin ejecución | Validar contrato/seguridad antes de conectar |

## Requisitos frontend y cobertura

| Requisito | Estado al corte | Próximo paso |
|---|---|---|
| Storefront mobile-first | pendiente; hay fragmentos móviles, no storefront integrado | Definir shell/rutas y probar viewport, teclado y accesibilidad |
| Catálogo, ficha, variantes y galería | pendiente | Contrato para categorías, talla, color, algodón e imágenes |
| Carrito y checkout | pendiente | Integrar pedido, dirección, inventario y confirmación |
| Envío por CP/peso en Sinaloa | pendiente | Reglas/cobertura y cotizador backend confirmados |
| Pago seguro | pendiente | Elegir proveedor; nunca capturar tarjeta con demos locales |
| Administración, pedidos y devoluciones | requiere adaptación | Definir APIs, roles y permisos |
| Regalo y comprobante sin precio | pendiente | Adaptar plantilla y validar en pedido de prueba |
| Cuenta, historial y recuperación | pendiente | Integrar identidad/pedidos con pruebas |

## Plantilla de componente frontend

| Campo | Valor |
|---|---|
| Proyecto / ruta / componente | [completar] |
| Propósito observado / evidencia | [completar; distinguir inferencia] |
| Datos, eventos, API y dependencias | [completar] |
| Responsive / accesibilidad / seguridad | [completar o pendiente] |
| Prueba ejecutada y resultado | [completar; indicar no ejecutada] |
| Estado | identificado / probado / funciona intacto / requiere adaptación / pendiente / no se utilizará (propuesto) / descartado (autorizado) |
| Cambio, decisión, riesgo y siguiente paso | [completar] |

## Administrador integrado — 2026-11-06

Estado: probado en entorno aislado; integración con datos reales pendiente. Componentes: public/admin.html, admin.css, admin.js; acceso desde footer y sesión ADMIN. Búsqueda, variantes, alertas, pedidos, guías y alta con campos. Diseño adaptable y formularios etiquetados. Corregidas referencias a funciones de acceso/checkout ausentes. Pruebas y límites: [guía administrativa](../tienda-online/README-ADMIN.md).

## Acceso de tienda — revisión 2026-11-06

Error interno al iniciar sesión: backend no conecta con MySQL. Ahora devuelve mensaje de conexión y HTTP 503; no se modifican credenciales ni se declara acceso real probado. Referencia: [registro de errores](ERRORES_Y_SOLUCIONES.md).

## Cuenta recuperada — 2026-11-06

Estado: probado para acceso vía API real; login de cuenta anterior 200 observado. Backend conectado al login original adaptado y base anterior. La vista distingue sesión iniciada de seguimiento aún no configurado, con opción de cerrar sesión aun si logística no responde. Archivos: public/app.js, index.html. Prueba visual posterior del mensaje de seguimiento pendiente; pruebas de sintaxis correctas.

## Checkout y seguimiento — 2026-11-06

Backend habilitado para calcular envío de demostración con CP y peso; 1,142 CP ya recuperados. Mi cuenta consulta logística Python conectada, sin historial de importes. API real probada de dirección/cotización/carrito/pedido/envío; verificación visual final por usuario pendiente. Originales conservados.

## Cotizador visible al comprador — 2026-11-06

Estado: probado en navegador real, bolsa y checkout. Componente public/shipping-calculator.js consulta POST /api/shipping/quote; muestra destino, tarifa base y por peso. Checkout no exige dirección completa para cotizar; sí para confirmar. Desglose explícito de envío y total; cambios de CP/carrito invalidan cotización. Cuenta/pedido temporales usados en prueba completa, luego eliminados y stock restaurado.

## Alcance final de cotización — 2026-11-06

Cotizador retirado de bolsa por instrucción del usuario. Permanece exclusivamente en Completa tu pedido, con CP/peso y desglose. Navegador real: ausencia de componente en bolsa, botón de checkout conservado y consola sin errores. Lógica/CSS de bolsa eliminada; aplicación y cálculo sin errores de sintaxis.

## Pago con tarjeta de prueba — 2026-11-06

Estado: probado en navegador real. En Completa tu pedido se elige escenario de tarjeta ficticia, mes/año y Validar tarjeta de prueba; confirmar permanece bloqueado hasta aprobación. Rechazo visible y aprobación con total566 comprobados; pedido simulado completo confirmado y limpiado. Cambio de cotización, tarjeta, vencimiento o empaque invalida comprobante. Sin campos para tarjeta real y sin guardado de PAN/CVV. Cotización solo en checkout.

## Bolsa vigente y selector Visa — 2026-11-06

Estado: probado en unidad/API y navegador parcial. public/cart-sync.js repara IDs demo/antiguos por selección inequívoca; marca faltantes o stock insuficiente, conserva selección y actualiza precio/peso.5 pruebas correctas. Integración completa con ID reparado y tarjeta/pedido/envío correcta. Navegador reparó bolsa y confirmó opción única Visa, sin errores JS. Preparación remota no conserva ID incompleto tras fallo. Prueba visual autenticada adicional bloqueada al registrar cuenta temporal; pendiente autorización.

## Tienda y administrador unificados — 2026-11-06

Estado: probado en sesión/rutas aisladas y navegación visual sin sesión. Mismo sitio, / y /tienda para tienda, /admin para panel, /admin.html conservado. site-session.js comparte sesión y sincroniza cierre entre pestañas; site-navigation.css contiene únicamente estilos del selector común. Pantallas originales conservadas. ADMIN cambia vistas con enlaces claros; cliente no obtiene permisos de panel y no pierde sesión al abrir su acceso. No se crearon cuentas por preferencia del usuario.

## Acceso administrativo explícito — 2026-11-06

Estado: probado en entorno aislado. Panel no se abre por sesión previa; exige formulario ADMIN exitoso en cada visita/historial. Se mantiene sesión de tienda. Subtítulo actualizado a Información y detalle de pedidos.4 pruebas específicas y4 previas correctas; sin cuentas nuevas. Revisión visual real por usuario pendiente.

## Switch sin acceso duplicado — 2026-11-06

Botón Administrar oculto para ADMIN; switch Tienda/Administración se conserva como único acceso superior. Cuenta/Mi cuenta sigue visible para visitante/cliente y se restaura tras cierre de sesión. Sintaxis y contenido servido comprobados; revisión visual con cuenta real a cargo del usuario.

## Textos administrativos informativos — 2026-11-06

Reemplazadas frases de marca/decorativas por títulos y notas sobre ventas, stock, pedidos y registro de productos, incluyendo login y pie lateral. Se mantiene Información y detalle de pedidos. Solo admin.html/admin.js, con diseño y lógica conservados; sin cambios en cuentas ni datos.

## Alertas e inventario — 2026-11-06

Diferenciados alcance, conteo y mensaje vacío de Alertas frente a inventario completo. Botón desde alertas vacías conserva categoría/búsqueda y abre productos.2 pruebas aisladas correctas. Consulta real confirma66 variantes de Pijamas y0 bajo mínimo5; no se cambió stock ni productos.

## Fuentes para hosting — 2026-11-06

Copia ZIP de fuentes preparada sin configuración privada ni datos locales. Frontend depende de gateway, identidad, logística, tarjetas y MySQL; no se considera publicable como HTML estático con funcionalidad completa. Proveedor aún sin elegir; no publicado.


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
