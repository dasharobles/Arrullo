# Historial y recuperación de acceso

## Historial

Mi cuenta muestra Mis compras y conserva Mis envíos. Consultas a orders/order_items limitadas al usuario autenticado, con páginas de 10 pedidos, estados, prendas, variantes, cantidades y precios registrados al comprar. La caída de logística no impide consultar compras. API GET /api/account/history?page=1. Adaptación AR-012; referencias originales conservadas en services/referencias-historial.

## Recuperación

Acceso Olvidé mi contraseña en tienda y admin, página /recuperar.html. Adaptación AR-028 conservando tokens aleatorios, SHA-256, caducidad de una hora e invalidación de tokens anteriores. Ahora usa la tabla password_reset_tokens en la BD del login existente y modifica usuarios.password_hash con el mismo bcrypt usado al iniciar sesión. Consumo transaccional con bloqueo de usuario/token, límites de solicitudes y contraseña de al menos 8 caracteres/máximo 72 bytes. No crea otra identidad.

La instalación local NO tiene correo configurado: available=false y solicitud deshabilitada con aviso. No se han enviado correos ni creado cuentas.

## Activar correo

Para el stack local coordinado (`npm start` desde `tienda-online`), configura estas variables en `tienda-online/.env`, que se propagan al servicio de login. Si ejecutas el microservicio de login por separado, puedes configurarlas en `services/login-service/.env`. En hosting, usa el panel privado de variables:

- MAIL_PROVIDER=resend
- MAIL_API_KEY: clave privada del proveedor
- MAIL_FROM: remitente autorizado por el proveedor
- PUBLIC_SITE_URL: URL pública de Arrullo, HTTPS en hosting

El ejemplo raíz `.env.example` deja vacías la clave y el remitente. Mientras no completes estos valores, la página mostrará que la recuperación no está habilitada y no enviará mensajes. El Blueprint de Render solicita estas variables al crear el servicio.

Sin crear una cuenta de correo ni verificar remitente no se puede probar entrega real. Se requiere seguir las condiciones del proveedor elegido; esta adaptación no contrata un plan ni registra una cuenta. Referencia de envío: https://resend.com/docs/api-reference/emails/send-email

Alternativa SMTP: MAIL_PROVIDER=smtp, SMTP_HOST, SMTP_PORT (465 o 587), SMTP_USER, SMTP_PASSWORD, SMTP_FROM, PUBLIC_SITE_URL. TLS validado. Referencia: https://nodemailer.com/smtp

Render Free bloquea salida por puertos SMTP 25,465,587; por eso se preparó también API HTTPS. Fuente: https://render.com/docs/free

Reiniciar npm start tras configurar; probar recepción y enlace con una cuenta propia. No pegar claves ni contraseñas en el chat ni guardarlas en fuentes.

## Sesiones y privacidad

El enlace lleva token en fragmento y la página lo retira de la barra antes de usarlo. No se imprime el token ni se incluye en logs de URL. La respuesta de solicitud no revela si existe el correo. Tras restablecer por gateway, session_revocations invalida las sesiones anteriores de la tienda; la nueva contraseña se usa al volver a iniciar sesión. El endpoint del login debe permanecer interno (como en start-local/start-hosted).

## Migraciones y pruebas

Nueva instalación: schema.sql de tienda y database/esquema.sql del login. Instalación anterior: scripts/migrations/password-recovery.sql en BD login, scripts/migrations/session-revocations.sql en BD tienda. Ya aplicadas localmente; sin alterar cuentas ni pedidos. Para hosting se exportan ambos esquemas con db:export.

Pruebas: recuperación con MySQL y bcrypt, caducidad, invalidación del enlace anterior, uso único y cambio de contraseña; configuración y solicitud HTTPS al proveedor con transporte simulado. No se envió correo real; la recepción con una cuenta verificada aún está pendiente.
