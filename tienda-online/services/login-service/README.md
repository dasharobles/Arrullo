# Servicio de acceso de Arrullo

Este servicio autentica compradores y administradores. La tienda lo consulta por `AUTH_SERVICE_URL`; ambos servicios pueden usar esquemas separados dentro de un servidor MySQL externo. No se incluyen cuentas demo ni el `.env` original.

- Configura `.env` con MySQL y `JWT_SECRET` aleatorio de 32 caracteres o más.
- Instala con `npm install`.
- Aplica el esquema con `npm run db:schema`.
- Crea una cuenta admin inicial con variables privadas `ARRULLO_ADMIN_USERNAME`, `ARRULLO_ADMIN_EMAIL`, `ARRULLO_ADMIN_NAME`, `ARRULLO_ADMIN_INITIAL_PASSWORD` (14 caracteres o más); ejecuta `npm run db:admin` una vez.
- Arranca con `npm start`.

El alta normal de la tienda asigna rol CLIENTE. El rol VENDEDOR no recibe permisos de administrador en Arrullo.
