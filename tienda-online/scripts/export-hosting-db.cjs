'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const base=path.resolve(__dirname,'..');const dotenv=require('dotenv');
const read=p=>dotenv.parse(fs.readFileSync(p));
const configs=[{name:'tienda',env:read(path.join(base,'.env'))},{name:'usuarios',env:read(path.join(base,'services/login-service/.env'))}];
const executable=process.env.MYSQLDUMP_PATH||'C:/Program Files/MySQL/MySQL Server 8.0/bin/mysqldump.exe';
if(!fs.existsSync(executable))throw Error('Indica la ruta de mysqldump en MYSQLDUMP_PATH.');
const dest=path.join(base,'database-backups','hosting-'+new Date().toISOString().replace(/[:.]/g,'-'));fs.mkdirSync(dest,{recursive:true});
for(const {name,env} of configs){const file=path.join(dest,name+'.sql');const database=env.DB_NAME||(name==='tienda'?'arrullo_test':'ventas_db');const args=['--host='+String(env.DB_HOST||'127.0.0.1'),'--port='+String(env.DB_PORT||56442),'--user='+String(env.DB_USER||'root'),'--single-transaction','--skip-lock-tables','--no-tablespaces','--set-gtid-purged=OFF','--column-statistics=0','--hex-blob','--default-character-set=utf8mb4','--skip-add-drop-table','--result-file='+file,database];const r=spawnSync(executable,args,{env:{...process.env,MYSQL_PWD:env.DB_PASSWORD||''},stdio:['ignore','ignore','pipe'],windowsHide:true});if(r.error||r.status!==0)throw Error('No se pudo exportar '+name+'. No subas un respaldo incompleto.');console.log('Respaldo privado creado: '+file)}
fs.writeFileSync(path.join(dest,'LEEME.txt'),'RESPALDO PRIVADO: contiene cuentas, hashes de contraseñas y pedidos. No subir a GitHub ni al ZIP de código. Importar tienda.sql y usuarios.sql en la base MySQL vacía de Aiven antes de desplegar. Se conserva la contraseña actual de las cuentas.\n');
console.log('Exportación terminada. No se modificó la base local.');
