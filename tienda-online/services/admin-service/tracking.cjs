const { createHash } = require('node:crypto');
function invalid(status, message) { return Object.assign(new Error(message), { status }); }
function normalizeGuide(value) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 120) throw invalid(400, 'Guía inválida');
  return value.trim().toUpperCase();
}
function guideLock(database, guide) {
  return 'arrullo:guide:' + createHash('sha256').update(database + '\0' + guide).digest('hex').slice(0, 48);
}
async function claimGuide(connection, database, orderId, value) {
  const trackingNumber = normalizeGuide(value), key = guideLock(database, trackingNumber);
  const [[lock]] = await connection.execute('SELECT GET_LOCK(?,5) AS acquired', [key]);
  if (Number(lock.acquired) !== 1) throw invalid(409, 'La guía se está guardando. Intenta nuevamente.');
  const release = async () => {
    try { await connection.execute('SELECT RELEASE_LOCK(?) AS released', [key]); }
    catch (error) { connection.destroy(); throw error; }
  };
  try {
    const [duplicates] = await connection.execute('SELECT order_id FROM shipments WHERE UPPER(TRIM(tracking_number))=? AND order_id<>? LIMIT 1 FOR UPDATE', [trackingNumber, orderId]);
    if (duplicates.length) throw invalid(409, 'Ese número de guía ya está asignado a otro pedido.');
    return { trackingNumber, release };
  } catch (error) { await release(); throw error; }
}
module.exports = { normalizeGuide, guideLock, claimGuide };
