import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { emitKeypressEvents } from 'node:readline';
import dotenv from 'dotenv';

const envPath = fileURLToPath(new URL('../.env', import.meta.url));
if (!existsSync(envPath)) throw new Error('Falta configurar el archivo .env del servicio de login.');
dotenv.config({ path: envPath, override: true, quiet: true });

function clavePrivada(prompt) {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY) return reject(new Error('Ejecuta este comando en la terminal interactiva de VS Code.'));
    let value = '';
    emitKeypressEvents(process.stdin);
    process.stdout.write(prompt);
    const previous = Boolean(process.stdin.isRaw);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    function close() { process.stdin.removeListener('keypress', onKey); process.stdin.setRawMode(previous); process.stdin.pause(); process.stdout.write('\n'); }
    function onKey(text, key = {}) {
      if (key.ctrl && key.name === 'c') { close(); reject(new Error('Operación cancelada; no se creó la cuenta.')); return; }
      if (key.name === 'return' || key.name === 'enter') { close(); resolve(value); return; }
      if (key.name === 'backspace') { value = [...value].slice(0, -1).join(''); return; }
      if (text && !key.ctrl && !key.meta && !/[\u0000-\u001f\u007f]/.test(text)) value += text;
    }
    process.stdin.on('keypress', onKey);
  });
}

let closePool;
try {
  const { cerrarPool } = await import('../src/config/baseDatos.js'); closePool = cerrarPool;
  const { buscarUsuarioPorNombre, crearUsuario } = await import('../src/repositories/usuarios.repository.js');
  const { generarHash } = await import('../src/utils/passwords.js');
  const nombreUsuario = process.env.ARRULLO_ADMIN_USERNAME;
  const email = process.env.ARRULLO_ADMIN_EMAIL;
  const nombreCompleto = process.env.ARRULLO_ADMIN_NAME;
  if (!nombreUsuario || !email || !nombreCompleto) {
    throw new Error('Define ARRULLO_ADMIN_USERNAME, ARRULLO_ADMIN_EMAIL y ARRULLO_ADMIN_NAME en el .env privado.');
  }
  if (await buscarUsuarioPorNombre(nombreUsuario)) throw new Error('Admin ya existe. No se modificó su contraseña ni sus permisos.');
  console.log(`Crear administrador: ${nombreUsuario} · ${email}`);
  const password = await clavePrivada('Escribe una contraseña de al menos 14 caracteres (no se mostrará): ');
  if (password.length < 14) throw new Error('La contraseña debe tener al menos 14 caracteres. No se creó la cuenta.');
  const repeated = await clavePrivada('Repite la contraseña: ');
  if (password !== repeated) throw new Error('Las contraseñas no coinciden. No se creó la cuenta.');
  await crearUsuario({ nombreUsuario, passwordHash: await generarHash(password), email, nombreCompleto, rol: 'ADMIN' });
  console.log('Cuenta Admin creada. Ya puedes entrar al administrador con la contraseña que elegiste.');
} catch (e) {
  console.error(e.code === 'ER_DUP_ENTRY' ? 'Ese usuario o correo ya está registrado. No se modificó ninguna cuenta.' : e.message);
  process.exitCode = 1;
} finally { if (closePool) await closePool().catch(() => {}); }
