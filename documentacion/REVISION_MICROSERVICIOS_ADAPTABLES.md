# Microservicios adaptables a Arrullo

Revisión del 6 de noviembre de 2026. Se compararon las fuentes locales con el backend y las pantallas actuales. Es una revisión de código y contratos; no se iniciaron todos los servicios ni se instalaron dependencias. No se modificaron cuentas, pedidos o precios.

## Orden recomendado de adaptación

| Prioridad | Servicio | Función en Arrullo | Adaptación necesaria |
|---|---|---|---|
| 1 | AR-012 Historial de compras | En Mi cuenta: prendas compradas, folio, importe y detalle del pedido, además del seguimiento existente. | Reemplazar las seis compras fijas de libros por consultas a orders/order_items; obtener identidad de la sesión y mostrar solo pedidos propios. Reutilizable como referencia de pantalla/contrato; requiere implementar las consultas reales. |
| 2 | AR-003 Comentarios y reseñas | Estrellas y comentarios por producto; moderación administrativa. | Vincular products y users; identidad desde sesión, autoría en edición/borrado, límites y validación de texto/calificación; decidir si solo compradores pueden opinar. La ruta original recibe id_cliente en el cuerpo y no contiene control de autoría. |
| 3 | AR-019 Generación de tickets | Descargar comprobante de compra y versión de regalo. | Mapear ventas/detalles/clientes a orders/order_items/users; autorizar comprador o admin; contemplar regalo sin precios; permitir volver a descargar el comprobante existente. La fuente registra el comprobante antes de generar el PDF: adaptar para permitir reintentar si falla. No es facturación fiscal. |
| 4 | AR-009 Garantías y devoluciones | Solicitud del comprador y resolución en administrador. | Sustituir repositorios en memoria y ventas de ejemplo por MySQL; relacionar pedido, variante y cantidad; añadir permisos y política de devolución. Conservar control acumulado de unidades y transiciones. Aprobar una solicitud no debe ejecutar un reembolso real ni reponer stock automáticamente sin un flujo definido. |
| 5 | AR-006 Empaquetado | Peso y dimensiones del paquete antes de generar la guía simulada. | Vincular paquete a pedido; adaptar SQLite a MySQL para persistencia compartida y hosting; revisar unidades de peso frente a los gramos actuales y permisos administrativos. No confundir este registro con la opción de envoltura para regalo que ya existe. |
| 6 | AR-029 Verificación de bots | Apoyo para limitar abuso en login, registro y recuperación. | Corregir firma, usar secreto configurado, caducidad y política de reintentos; adaptar al acceso detrás del hosting. El token actual falla con IPv4 porque separa payload/firma usando puntos que también aparecen en la dirección. Es una protección heurística, no prueba suficiente de que sea una persona. |
| 7 | AR-015 Stock máximo y ofertas | Sugerencias de descuento por exceso de inventario en admin. | Definir máximo por variante y aprobación del administrador; aplicar el precio desde servidor y respetar pedidos previos. La fuente propone 10% al alcanzar 80% del máximo y 20% al alcanzar el máximo. Estas reglas no están autorizadas como política de Arrullo y no se activaron. |
| 8 | AR-020 Proveedores | Directorio interno para compras y reposición de prendas. | Añadir tablas de proveedores/compras y acceso admin, vincular reposición con movimientos de inventario. La fuente consulta PROVEEDORES y COMPRAS, diferentes del esquema actual. Tiene menor prioridad para la experiencia del comprador. |
| 9 | AR-018 Fondo | Administración de colores o fondos por sección. | Persistir configuración y restringir cambios. La versión original guarda en memoria. Poco beneficio inmediato: Arrullo ya usa estilos y tokens de marca. |
| 10 | AR-028 Recuperación de contraseña | Enlace «Olvidé mi contraseña» para clientes y administrador. | Dejar para el final, como se acordó. Cuando se retome, integrar con los usuarios de ventas_db del login existente; sustituir data/db.json por MySQL; conservar tokens con hash, caducidad y un solo uso mediante transacciones; limitar intentos y configurar correo SMTP. El cambio debe afectar la contraseña que realmente usa el login. |

## Funciones que ya están implementadas y adaptadas

- AR-013 login: conectado a la identidad anterior; conservar esa fuente de usuarios.
- AR-011 logística y AR-014 validación de entregas: seguimiento y paquetería simulada integrados.
- AR-024 tarjeta: validación y autorización de demostración integradas; AR-025 pago simulado adicional se solapa.
- AR-004 inventario, AR-001 stock mínimo, AR-027 alta de productos y lógica de AR-021 reportes: adaptados en administración. El reporte actual es de ventas, no de compras a proveedores.
- Encabezado, pie, menú y formulario de domicilio: sus funciones visuales o de dirección ya están cubiertas.
- AR-017 registro de pedidos y AR-010 otro inventario: se solapan con pedidos/variantes/stock del backend actual; revisar reglas útiles sin crear una segunda fuente de datos.
- AR-022/023 roles: el sitio ya diferencia admin/cliente; no conviene añadir una segunda identidad para cubrir el mismo permiso. Una ampliación a empleados requeriría revisar el modelo de roles.
- AR-008 files y AR-016 Parcial_1: paquetes de alcance/duplicidad no conciliados en esta revisión. AR-030 paquete RAR de devoluciones: no se abrió ni se propone integrar sin comparar con AR-009.

## Evidencia y alcance de pruebas

Fuentes leídas bajo `Desktop/Arrullo microservicios`: rutas de reseñas; servicio de recuperación y envío de correo; main.py de historial; controlador de ofertas; servidor de verificación de bots; aplicación/rutas/casos de uso de devoluciones; aplicación de tickets; contrato e implementación de almacenamiento de empaquetado; rutas de proveedores; README de fondo y rutas de identidad/roles. Comparación con server.js, app.js, admin.js y documentación de Arrullo.

Única prueba funcional nueva de esta revisión: funciones originales de firma/verificación de AR-029 ejecutadas de forma aislada. Se reprodujo fallo para IPv4 (127.0.0.1); el caso IPv6 de control (::1) se verificó. No se inició un servidor ni se usaron cuentas. Los demás candidatos requieren pruebas de ejecución al adaptarlos.
