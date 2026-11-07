# Validación de tarjeta de Arrullo

Adaptación del servicio-verificacion-tarjeta original. Se conservan sus funciones de validación, pasarela simulada y límite de intentos, convertidas a JavaScript sin tipos en original/. Código TypeScript de referencia en referencias/. No se cambia el original del escritorio.

Usa identidad y pedidos de Arrullo desde el gateway; no aplica migraciones ni semillas BD02. Servicio local 4321, clave interna privada y comprobante firmado con cliente/carrito/cotización/total/vencimiento. El pedido comprueba esa firma y guarda solo la referencia opaca, sin número ni CVV.

Solo acepta las cuatro tarjetas ficticias ofrecidas en el checkout y CVV123. Autorizar es una simulación, no prueba bancaria ni cobro.

Inicio conjunto: npm.cmd start desde tienda-online. Pruebas: npm.cmd test desde esta carpeta.
