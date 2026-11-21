require('dotenv').config();
// Importa el TXT oficial SEPOMEX (delimitador |) exportado para Sinaloa.
// Uso: node scripts/import-sepomex.js ruta/al/CodigoPostal.txt
const fs = require('node:fs');
const mysql = require('mysql2/promise');
const file = process.argv[2];
if (!file) { console.error('Indica la ruta del TXT oficial SEPOMEX.'); process.exit(2); }
const text = fs.readFileSync(file, 'latin1').replace(/^\uFEFF/, '');
const cfg = { host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'arrullo', ssl: process.env.DB_SSL==='true'?{rejectUnauthorized:false}:undefined };
const rows = text.split(/\r?\n/).filter(Boolean).map(line => line.split('|'));
const data = rows.filter(r => /^\d{5}$/.test((r[0] || '').trim()) && (r[4] || '').trim().toLocaleLowerCase('es-MX') === 'sinaloa');
if (!data.length) { console.error('El archivo no contiene filas reconocibles de Sinaloa; no se insertó nada.'); process.exit(1); }
const grouped = new Map();
for (const r of data) {
  const postal = r[0].trim(), municipality = (r[3] || '').trim(), locality = (r[5] || '').trim();
  if (!grouped.has(postal)) grouped.set(postal, { postal, municipality, locality });
}
(async () => {
  const db = await mysql.createConnection(cfg);
  await db.execute(`CREATE TABLE IF NOT EXISTS sinaloa_postal_codes (postal_code CHAR(5) PRIMARY KEY, municipality VARCHAR(120) NOT NULL, locality VARCHAR(120) NOT NULL DEFAULT '', serviceable BOOLEAN NOT NULL DEFAULT TRUE, base_shipping_rate DECIMAL(10,2) NOT NULL DEFAULT 89.00, source VARCHAR(255) NOT NULL DEFAULT 'SEPOMEX / Correos de México', updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB`);
  await db.beginTransaction();
  try {
    for (const row of grouped.values()) await db.execute(`INSERT INTO sinaloa_postal_codes(postal_code,municipality,locality,source) VALUES(?,?,?,'SEPOMEX · Correos de México') ON DUPLICATE KEY UPDATE municipality=VALUES(municipality),locality=VALUES(locality),serviceable=TRUE,source=VALUES(source)`, [row.postal,row.municipality,row.locality]);
    await db.commit(); console.log(`Importados/actualizados ${grouped.size} códigos postales únicos de Sinaloa.`);
  } catch (e) { await db.rollback(); throw e; } finally { await db.end(); }
})().catch(e => { console.error(e.message); process.exit(1); });

