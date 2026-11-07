# Paquetería simulada Arrullo

Adaptación de AR-014 (validación de entregas). Referencias originales conservadas en referencias-validacion-entregas; la regla determinar_estado mantiene pendiente/validada/rechazada.

La API interna POST /api/v1/arrullo/orders/:id/simulation requiere X-Arrullo-Service-Key. action generate asigna una guía SIM única e idempotente; action advance requiere expectedStage para evitar avances dobles. Flujo: label_pending → shipped → delivered. Entrega exige fecha UTC registrada y validación validada.

Persistencia: parcel_simulations y parcel_simulation_events; migración scripts/migrations/parcel-simulation.sql incluida también en schema.sql. Importar migración antes de iniciar una instalación anterior. Tablas ya creadas localmente sin modificar pedidos.

Pedidos cancelados, reembolsados, sin pago, entregados o con guía anterior no reciben una nueva guía. Los envíos simulados se administran con sus controles, no con el formulario manual. Generación, eventos y estados de pedido/envío se guardan en una transacción. El comprador solo consulta sus envíos. No hay envíos físicos ni notificaciones por correo.

Gateway: POST /api/admin/orders/:id/simulation, solo administrador con SHIPPING_MODE=simulator (o test). Estado avanza por acción explícita del administrador, no por temporizador.
