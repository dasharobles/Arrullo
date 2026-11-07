import 'dotenv/config';
import { generarHash } from '../src/utils/passwords.js';
import { crearUsuario, buscarUsuarioPorNombre } from '../src/repositories/usuarios.repository.js';
import { cerrarPool } from '../src/config/baseDatos.js';
const nombreUsuario=process.env.ARRULLO_ADMIN_USERNAME,email=process.env.ARRULLO_ADMIN_EMAIL,nombreCompleto=process.env.ARRULLO_ADMIN_NAME,password=process.env.ARRULLO_ADMIN_INITIAL_PASSWORD;
async function run(){if(!nombreUsuario||!email||!nombreCompleto||!password||password.length<14)throw new Error('Define usuario, correo, nombre y contraseña privada de al menos 14 caracteres.');if(await buscarUsuarioPorNombre(nombreUsuario))throw new Error('Ese usuario ya existe; no se modificó.');const id=await crearUsuario({nombreUsuario,passwordHash:await generarHash(password),email,nombreCompleto,rol:'ADMIN'});console.log(`Administrador creado (id ${id}); la contraseña no se muestra.`)}
run().catch(e=>{console.error(e.message);process.exitCode=1}).finally(async()=>cerrarPool().catch(()=>{}));
