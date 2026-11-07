# Arrullo

Tienda en línea para ropa de bebé, con catálogo por variantes, inventario, carrito, cuentas de clientes, pedidos y panel de administración. La aplicación integra servicios propios de acceso, logística y validación de pagos de demostración.

> **Estado:** el repositorio está publicado en GitHub. La ejecución local y las pruebas de integración están verificadas; todavía no hay una base de datos alojada configurada. El pago y la paquetería disponibles son simulados; no procesan cobros ni generan guías reales.

## Funcionalidades

- Catálogo de prendas, fotografías, búsqueda, filtros por categoría y variantes de talla/color.
- Bolsa de compra conciliada con disponibilidad e inventario MySQL.
- Registro e inicio de sesión de clientes; acceso administrativo separado por rol.
- Direcciones, cobertura postal de Sinaloa, cotización local según código postal y peso.
- Checkout transaccional de prueba, historial de compras y opciones de regalo.
- Administración de productos, variantes, inventario, pedidos, reportes y comprobantes de empaque.
- Seguimiento y pago exclusivamente simulados; recuperación de contraseña pendiente para una etapa posterior.

## Arquitectura

```text
Navegador
  └── Tienda, panel administrativo y API (Node.js)
        ├── MySQL: catálogo, variantes, cuentas locales, bolsa, pedidos y envíos
        ├── Servicio de acceso (Node.js / Express)
        ├── Servicio de logística (Python / Flask)
        └── Servicio de tarjetas de prueba (Node.js; no es una pasarela bancaria)
```

En Render, el [Dockerfile](tienda-online/Dockerfile) y `start-hosted.cjs` ejecutan la tienda y sus microservicios en un solo servicio web; estos se comunican por loopback. La base MySQL debe ser externa y persistente. Solo el servidor de la tienda se expone públicamente.

## Estructura del repositorio

```text
Arrullo/
├── README.md
├── documentacion/             # Inventarios, matriz, bitácora y registro de pruebas
├── tienda-online/
│   ├── public/                # Tienda y panel web
│   ├── services/              # API, administración y microservicios
│   ├── scripts/               # Inicio, pruebas, esquema y utilidades
│   ├── schema.sql             # Esquema de la tienda
│   ├── Dockerfile             # Imagen para el hosting
│   └── package.json
└── validar_documentacion.py
```

Los archivos `.env`, las dependencias, los datos MySQL locales y los respaldos no forman parte del código que se debe publicar. Las reglas de exclusión están en `.gitignore` y `.dockerignore`.

## Requisitos para ejecutar localmente

- Node.js 20 o posterior y npm.
- MySQL 8 con permiso para crear tablas en la base de datos seleccionada.
- Python 3.10 o posterior para el servicio de logística.
- El archivo SEPOMEX de códigos postales de Sinaloa para poblar cobertura en una instalación nueva.

### Base nueva de desarrollo

Desde PowerShell, en la carpeta `tienda-online`:

1. Crea una base MySQL vacía (por ejemplo, `arrullo`) y configura la conexión.
2. Copia `.env.example` a `.env` y completa localmente `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` y `JWT_SECRET`. No compartas el archivo `.env`.
3. Instala dependencias y prepara el esquema de la tienda:

   ```powershell
   npm ci
   npm run db:setup
   ```

   `db:setup` aplica `schema.sql`, ajusta el campo de color y añade el catálogo de demostración. Úsalo solo en una base destinada a esta instalación; no lo ejecutes sobre una base de datos que debas preservar.

4. Descarga el archivo de códigos postales de [SEPOMEX / Correos de México](https://www.correosdemexico.gob.mx/sslservicios/consultacp/CodigoPostal_Exportar.aspx) y cárgalo:

   ```powershell
   node scripts/import-sepomex.js .\Sinaloa.txt
   ```

5. Configura los servicios descritos abajo y ejecuta `npm start`. La tienda se sirve en `http://127.0.0.1:4317`.

### Servicio de acceso

En `services/login-service`, copia `.env.example` a `.env` y configura MySQL y una clave JWT local. Aplica el esquema y arranca el servicio:

```powershell
npm ci
npm run db:schema
npm start
```

Configura `AUTH_SERVICE_URL=http://127.0.0.1:4318` en el `.env` de la tienda. Para crear la cuenta administrativa inicial, define localmente `ARRULLO_ADMIN_USERNAME`, `ARRULLO_ADMIN_EMAIL`, `ARRULLO_ADMIN_NAME` y `ARRULLO_ADMIN_INITIAL_PASSWORD` (14 caracteres o más); después ejecuta `npm run db:admin` una sola vez. No hay contraseñas predeterminadas.

### Logística y pagos de prueba

Para logística, crea el entorno virtual dentro de `services/shipping-service`, instala `requirements.txt`, copia `.env.example` a `.env` y configura una clave aleatoria compartida entre `ARRULLO_SERVICE_API_KEY` y `SHIPPING_SERVICE_API_KEY`. El microservicio debe conectarse a la base de la tienda para consultar los envíos de Arrullo.

El servicio de tarjetas usa su propio `.env.example` y una clave interna. Solo acepta datos ficticios. El backend guarda una referencia opaca; no guarda número ni CVV. Para habilitar estos simuladores en desarrollo, establece `PAYMENT_MODE=simulator` y `SHIPPING_MODE=simulator`; estos valores **no habilitan cobros ni servicios reales**.

Puedes iniciar los microservicios por separado según sus README. Para que `npm start` coordine el stack local, configura `LOCAL_SERVICES=true` y las URL locales de acceso, logística y tarjetas en el `.env` de la tienda. Ese modo presupone que MySQL y los entornos locales ya existen; los datos MySQL locales no están incluidos en GitHub.

## Pruebas

Ejecuta cada suite desde su carpeta:

```powershell
# tienda-online
npm test

# servicio de login
cd services/login-service
npm test

# validador de tarjetas
cd ../card-service
npm test
```

Desde `tienda-online`, `node scripts/check-card-integration.cjs` verifica el flujo integrado con los servicios locales y limpia los datos temporales que crea. Ejecútalo una sola vez a la vez y solo contra la base de pruebas configurada.

La validación de los documentos se ejecuta desde la raíz:

```powershell
python validar_documentacion.py
```

## Seguridad y límites conocidos

- No subas `.env`, certificados, claves, respaldos SQL, `node_modules`, entornos virtuales ni `mysql-data-local`.
- El checkout simulado no es un cobro real. Nunca habilites datos reales de tarjetas en este proyecto.
- La tarifa postal y la guía de envío simuladas no son cotizaciones ni servicios de paquetería reales.
- La recuperación de contraseña queda pendiente y no envía mensajes.
- Antes de migrar una base existente, respáldala de forma privada y verifica el destino. No ejecutes semillas sobre datos que deban conservarse.

## Documentación del proyecto

- [Guía de tienda y administración](tienda-online/README-ADMIN.md)
- [Guía de despliegue](tienda-online/README-DEPLOY.md)
- [Inventario de servicios](documentacion/INVENTARIO_MICROSERVICIOS.md)
- [Inventario frontend](documentacion/INVENTARIO_FRONTEND.md)
- [Matriz de integración](documentacion/MATRIZ_INTEGRACION.md)
- [Errores y pruebas](documentacion/ERRORES_Y_SOLUCIONES.md)
- [Bitácora](documentacion/BITACORA_PROYECTO.md)

## Protocolo operativo obligatorio

Antes de una tarea técnica, revisar la última entrada de la bitácora, la matriz y el inventario relacionado. Al finalizar, registrar cambios, pruebas, riesgos y pendientes en los documentos correspondientes. No afirmar que una función está probada si solo se inspeccionó el código.

## Validación local

El validador `validar_documentacion.py` revisa los documentos requeridos, secciones mínimas y enlaces internos. Es de solo lectura y no verifica la ejecución de la aplicación; para eso se deben ejecutar las pruebas indicadas arriba.

## Transferencia de trabajo

Al continuar en otro entorno, proporcionar la carpeta del proyecto y pedir que se lean este README y la documentación pertinente antes de editar. No transferir `.env`, respaldos de base de datos, certificados ni credenciales. Indicar pruebas ejecutadas y pendientes.
