'use strict';
const fs=require('node:fs'),path=require('node:path'),net=require('node:net');
const {spawn}=require('node:child_process');
const base=path.resolve(__dirname,'..');
require('dotenv').config({path:path.join(base,'.env'),quiet:true});
const children=[];let stopping=false;
function child(script,cwd,env=process.env,executable=process.execPath){const p=spawn(executable,[script],{cwd,env,stdio:'inherit',windowsHide:true});children.push(p);p.on('error',e=>{console.error('No se pudo iniciar un servicio:',e.code);stop(1)});p.on('exit',code=>{if(!stopping)stop(code||0)});return p}
function stop(code=0){if(stopping)return;stopping=true;for(const p of children)if(p.exitCode===null)p.kill();process.exitCode=code}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
function tcp(host,port){return new Promise(resolve=>{const s=net.connect({host,port});s.setTimeout(500);s.once('connect',()=>{s.destroy();resolve(true)});s.once('error',()=>resolve(false));s.once('timeout',()=>{s.destroy();resolve(false)})})}
async function wait(check,label,timeout=15000){const until=Date.now()+timeout;while(Date.now()<until){if(stopping)throw Error('Inicio cancelado');if(await check())return;await new Promise(r=>setTimeout(r,300))}throw Error(label+' no está disponible. Revisa su configuración.')}
(async()=>{
if(process.env.LOCAL_SERVICES==='true'&&process.env.NODE_ENV!=='production'){
  const host=process.env.DB_HOST||'127.0.0.1',port=Number(process.env.DB_PORT||56442);
  if(!await tcp(host,port)){
    const data=path.resolve(base,process.env.MYSQL_LOCAL_DATA||'mysql-data-local');
    const executable=process.env.MYSQLD_PATH||'C:/Program Files/MySQL/MySQL Server 8.0/bin/mysqld.exe';
    if(host!=='127.0.0.1'||!fs.existsSync(path.join(data,'auto.cnf'))||!fs.existsSync(executable))throw Error('No se encuentra la base local recuperada o el ejecutable de MySQL.');
    const p=spawn(executable,['--no-defaults','--datadir='+data,'--port='+port,'--bind-address=127.0.0.1','--mysqlx=0','--log-error='+path.join(data,'arrullo-restaurado.err'),'--pid-file='+path.join(data,'arrullo-restaurado.pid')],{cwd:base,detached:true,windowsHide:true,stdio:'ignore'});
    p.on('error',()=>console.error('No se pudo iniciar MySQL local.'));p.unref();
    await wait(()=>tcp(host,port),'MySQL local');
  }
  console.log('MySQL local disponible.');
  const url=new URL(process.env.AUTH_SERVICE_URL);
  if(!['127.0.0.1','localhost'].includes(url.hostname))throw Error('LOCAL_SERVICES requiere una dirección local para el login.');
  if(!await tcp(url.hostname,Number(url.port)||80)){
    const loginEnv={...process.env};for(const key of Object.keys(loginEnv))if(/^(DB_|JWT_)/.test(key)||['PORT','HOST'].includes(key))delete loginEnv[key];
    child('src/server.js',path.join(base,'services/login-service'),loginEnv);
  }
  await wait(async()=>{try{return (await fetch(url.origin+'/api/v1/salud',{signal:AbortSignal.timeout(1000)})).ok}catch{return false}},'Servicio de login');
  console.log('Inicio de sesión conectado.');
  const shippingUrl=new URL(process.env.SHIPPING_SERVICE_URL);
  if(!['127.0.0.1','localhost'].includes(shippingUrl.hostname))throw Error('El seguimiento local requiere dirección local.');
  if(!await tcp(shippingUrl.hostname,Number(shippingUrl.port)||80)){
    const shippingDir=path.join(base,'services/shipping-service');
    const python=process.env.SHIPPING_PYTHON||path.join(shippingDir,'.venv',process.platform==='win32'?'Scripts':'bin',process.platform==='win32'?'python.exe':'python');
    if(!fs.existsSync(python))throw Error('Falta el entorno Python del microservicio de envíos. Revisa README-ADMIN.md.');
    const shippingEnv={...process.env};for(const key of Object.keys(shippingEnv))if(/^(DB_|JWT_|ARRULLO_|FLASK_)/.test(key)||['PORT','HOST'].includes(key))delete shippingEnv[key];
    child('app.py',shippingDir,shippingEnv,python);
  }
  await wait(async()=>{try{return (await fetch(shippingUrl.origin+'/health',{signal:AbortSignal.timeout(1000)})).ok}catch{return false}},'Seguimiento de envíos');
  console.log('Seguimiento de envíos conectado.');
  const cardUrl=new URL(process.env.CARD_SERVICE_URL);
  if(!['127.0.0.1','localhost'].includes(cardUrl.hostname))throw Error('El validador local requiere dirección local.');
  if(!await tcp(cardUrl.hostname,Number(cardUrl.port)||80)){
    const cardEnv={...process.env};for(const key of Object.keys(cardEnv))if(/^(DB_|JWT_|CARD_)/.test(key)||['PORT','HOST'].includes(key))delete cardEnv[key];
    child('server.cjs',path.join(base,'services/card-service'),cardEnv);
  }
  await wait(async()=>{try{return (await fetch(cardUrl.origin+'/health',{signal:AbortSignal.timeout(1000)})).ok}catch{return false}},'Validador de tarjetas');
  console.log('Validador de tarjetas conectado.');
}
child('server.js',base);
})().catch(e=>{console.error(e.message);stop(1)});
