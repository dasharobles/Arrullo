import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { createRecoveryMailer } from '../src/services/recovery-mail.js';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-password-recovery-secret-123456789';
process.env.MAIL_PROVIDER = 'resend';
process.env.MAIL_API_KEY = '';
process.env.MAIL_FROM = 'Arrullo <no-reply@example.com>';
process.env.PUBLIC_SITE_URL = 'https://arrullo.example';

const [{ crearAplicacion }, requestModule, { cerrarPool }] = await Promise.all([
  import('../src/app.js'),
  import('supertest'),
  import('../src/config/baseDatos.js')
]);
const request = requestModule.default;
const app = crearAplicacion();

const mailConfig = {
  MAIL_PROVIDER: 'resend',
  MAIL_API_KEY: 'test-api-key',
  MAIL_FROM: 'Arrullo <no-reply@example.com>',
  PUBLIC_SITE_URL: 'https://arrullo.example'
};

test('la recuperación permanece deshabilitada si falta configuración de correo', () => {
  assert.equal(createRecoveryMailer({}).available(), false);
  assert.equal(createRecoveryMailer({ ...mailConfig, MAIL_API_KEY: '' }).available(), false);
});

test('solo habilita proveedores y remitentes válidos', () => {
  assert.equal(createRecoveryMailer({ ...mailConfig, MAIL_PROVIDER: 'desconocido' }).available(), false);
  assert.equal(createRecoveryMailer({ ...mailConfig, MAIL_FROM: 'remitente-invalido' }).available(), false);
  assert.equal(createRecoveryMailer({ ...mailConfig, PUBLIC_SITE_URL: 'http://arrullo.example' }).available(), false);
  assert.equal(createRecoveryMailer(mailConfig).available(), true);
});

test('el endpoint de estado refleja cuando se configura el proveedor de correo', async () => {
  const disabled = await request(app).get('/api/v1/auth/password/status').expect(200);
  assert.equal(disabled.body.datos.available, false);

  process.env.MAIL_API_KEY = 'test-api-key';
  const enabled = await request(app).get('/api/v1/auth/password/status').expect(200);
  assert.equal(enabled.body.datos.available, true);
});

test('envía mediante la API HTTPS y coloca el token en el fragmento del enlace', async () => {
  let sent;
  const mailer = createRecoveryMailer(mailConfig, async (url, options) => {
    sent = { url, options };
    return { ok: true };
  });

  await mailer.send('cliente@example.com', 'a'.repeat(64));

  assert.equal(sent.url, 'https://api.resend.com/emails');
  assert.equal(sent.options.headers.Authorization, 'Bearer test-api-key');
  const payload = JSON.parse(sent.options.body);
  assert.equal(payload.from, mailConfig.MAIL_FROM);
  assert.deepEqual(payload.to, ['cliente@example.com']);
  const link = payload.text.match(/https:\/\/arrullo\.example\/recuperar\.html#[^\s]+/)[0];
  const resetUrl = new URL(link);
  assert.equal(resetUrl.search, '');
  assert.equal(new URLSearchParams(resetUrl.hash.slice(1)).get('token'), 'a'.repeat(64));
});

test('propaga el fallo del proveedor para que el token no se dé por enviado', async () => {
  const mailer = createRecoveryMailer(mailConfig, async () => ({ ok: false }));
  await assert.rejects(mailer.send('cliente@example.com', 'b'.repeat(64)), /No se pudo entregar/);
});

after(async () => cerrarPool());
