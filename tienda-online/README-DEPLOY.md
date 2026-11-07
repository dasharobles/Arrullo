# Despliegue de Arrullo

El repositorio incluye un manifiesto de Render en la raíz y una imagen Docker para ejecutar la tienda, el servicio de acceso, la logística y el validador de pagos dentro de un solo servicio web. El pago y el envío se mantienen simulados: no se conectan a bancos ni transportistas. El despliegue no incluye MySQL; necesita una base persistente con TLS.

## Antes de desplegar

- Elige un proveedor MySQL compatible, crea las bases de tienda y de login y conserva sus datos de conexión en el panel privado del proveedor.
- Revisa quién tiene acceso a esas bases. No uses credenciales de administrador de MySQL para la aplicación si el proveedor permite un usuario de privilegios limitados.
- Decide si ambas aplicaciones compartirán una base. `DB_NAME` es la base de la tienda; `LOGIN_DB_NAME` es la base que usará el servicio de acceso. Pueden ser la misma solo si contiene los dos esquemas y el usuario de conexión tiene permisos.
- Haz una copia privada antes de migrar datos existentes. `npm run db:export` contiene cuentas, hashes de contraseñas y pedidos: nunca lo incluyas en Git ni lo adjuntes a reportes públicos.
- El manifiesto usa `PAYMENT_MODE=simulator` y `SHIPPING_MODE=simulator`. Son exclusivamente para demostración, no para cobrar ni despachar pedidos reales.

## Preparar el esquema

En una instalación nueva, crea una base vacía para la tienda y carga `schema.sql`. Si también quieres el catálogo ficticio de demostración, ejecuta `seed-demo.sql` únicamente en esa base nueva. Importa los códigos postales de Sinaloa usando la fuente SEPOMEX, o el flujo de importación local documentado en el README principal.

Prepara la base de login con `services/login-service/database/esquema.sql` en la base indicada por `LOGIN_DB_NAME`. Ejecuta las migraciones de recuperación de contraseña en login y de revocación de sesiones en tienda cuando se utilicen esas funciones. Revisa cada `scripts/migrations/*.sql` y aplícalo una vez, en la base correcta, antes de desplegar.

Para migrar una instalación existente, compara los esquemas y los respaldos privados con el destino antes de importar. No ejecutes `npm run db:setup` ni semillas sobre una base de producción: ese comando aplica el esquema y carga datos de demostración.

## Despliegue en Render

1. Publica el código en un repositorio Git privado o público según tu política de datos. Revisa `git status` y `git check-ignore` para confirmar que `.env`, respaldos y datos MySQL estén excluidos.
2. En Render, crea un Blueprint desde el repositorio y revisa el manifiesto `render.yaml` de la raíz. La compilación usa `tienda-online/Dockerfile`.
3. Completa las variables `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `LOGIN_DB_NAME` y `DB_SSL_CA` con los datos del proveedor MySQL. Conserva `DB_SSL=true`; no pegues los valores en GitHub ni en el README.
4. Render genera `JWT_SECRET`. Deja `LOCAL_SERVICES=false`; pago y envío permanecen en modo `simulator`. Identifica la tienda como demostración y no aceptes órdenes reales.
5. Espera el health check `/api/health`. Si no pasa, consulta los logs privados del servicio y confirma conectividad, TLS, permisos y esquemas de MySQL; no copies credenciales a una incidencia pública.
6. La recuperación de contraseña queda para una etapa posterior; no está habilitado el envío de correos.

El punto de entrada `scripts/start-hosted.cjs` enlaza los microservicios internos a `127.0.0.1`. Con el modo `simulator`, el servicio de tarjetas y las guías simuladas solo validan flujos de demostración; no realizan cobros ni generan servicios de transporte reales.

## Límites del hosting actual

- El manifiesto configura el contenedor de aplicación, no una base MySQL administrada ni la migración de datos.
- El plan gratuito puede suspender el servicio y no debe considerarse garantía de disponibilidad comercial.
- El cálculo de envío, las guías y los pagos son exclusivamente de demostración: no sirven para vender ni despachar pedidos reales.
- La recuperación de contraseña queda pendiente; no se envían correos.
- Antes de alojar la demostración: configura copias de seguridad, dominio y HTTPS, alertas, retención de logs y un procedimiento de restauración.

## Alternativa: otro proveedor

Usa el mismo `Dockerfile` y comando `node scripts/start-hosted.cjs`. Configura `NODE_ENV=production`, `LOCAL_SERVICES=false`, MySQL con TLS y certificado CA, `JWT_SECRET` aleatorio de al menos 32 caracteres y los nombres correctos de las bases. Expón únicamente el puerto `PORT` del servidor principal; los puertos de login, logística y tarjetas son internos. Mantén pago y envío en modo `simulator`, entendiendo que no prestan servicios reales.
