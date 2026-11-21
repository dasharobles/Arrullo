require('dotenv').config();
const fs=require('node:fs');
const mysql=require('mysql2/promise');
const cfg={host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER||'root',password:process.env.DB_PASSWORD||'',database:process.env.DB_NAME||'arrullo',ssl:process.env.DB_SSL==='true'?{rejectUnauthorized:false}:undefined};
(async()=>{const db=await mysql.createConnection(cfg);for(const file of ['schema.sql']){const statements=fs.readFileSync(file,'utf8').split(';').map(s=>s.trim()).filter(Boolean);for(const sql of statements)await db.query(sql)}await db.query('ALTER TABLE product_variants MODIFY color VARCHAR(40) NOT NULL');for(const sql of fs.readFileSync('seed-demo.sql','utf8').split(';').map(s=>s.trim()).filter(Boolean))await db.query(sql);await db.end();console.log('Esquema, migración de colores y semilla aplicados.')})().catch(e=>{console.error(`No se pudo preparar la base: ${e.code||'ERROR'}`);process.exit(1)});
