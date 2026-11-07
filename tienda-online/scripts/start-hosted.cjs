'use strict';
// Arranque y supervisión de la tienda y sus servicios internos dentro del contenedor.
const {spawn}=require('node:child_process'),crypto=require('node:crypto'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
async function launchHosted(input=process.env){
 const env={...input,NODE_ENV:'production',LOCAL_SERVICES:'false'},base=path.resolve(__dirname,'..');
 for(const name of ['DB_HOST','DB_USER','DB_NAME','JWT_SECRET'])if(!env[name])throw Error('Falta configurar '+name);
 if(env.JWT_SECRET.length<32)throw Error('JWT_SECRET requiere al menos 32 caracteres.');
 const paymentMode=env.PAYMENT_MODE||'unconfigured';
 if(!['simulator','unconfigured'].includes(paymentMode))throw Error('PAYMENT_MODE debe ser simulator o unconfigured en producción.');
 const cardEnabled=paymentMode==='simulator';
 env.DB_PORT=env.DB_PORT||'3306';env.DB_SSL=env.DB_SSL||'true';
 let caFile;
 if(env.DB_SSL==='true'){
  if(!env.DB_SSL_CA)throw Error('Falta el certificado de la base de datos en DB_SSL_CA.');
  env.DB_SSL_CA=env.DB_SSL_CA.replace(/\\n/g,'\n');
  caFile=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'arrullo-ca-')),'ca.pem');fs.writeFileSync(caFile,env.DB_SSL_CA,{mode:0o600});
 }
 const secret=label=>crypto.createHmac('sha256',env.JWT_SECRET).update('arrullo:'+label).digest('hex');
 const ports={login:Number(env.INTERNAL_LOGIN_PORT||4318),shipping:Number(env.INTERNAL_SHIPPING_PORT||4320),card:Number(env.INTERNAL_CARD_PORT||4321),store:Number(env.PORT||10000)};
 if(new Set(Object.values(ports)).size!==4||Object.values(ports).some(p=>!Number.isInteger(p)||p<1||p>65535))throw Error('Los puertos de la aplicación no son válidos.');
 Object.assign(env,{AUTH_SERVICE_URL:'http://127.0.0.1:'+ports.login,SHIPPING_SERVICE_URL:'http://127.0.0.1:'+ports.shipping,CARD_SERVICE_URL:cardEnabled?'http://127.0.0.1:'+ports.card:'',SHIPPING_SERVICE_API_KEY:env.SHIPPING_SERVICE_API_KEY||secret('shipping'),...(cardEnabled?{CARD_SERVICE_API_KEY:env.CARD_SERVICE_API_KEY||secret('card')}:{})});
 const children=[];let stopping=false,stopPromise;
 function start(command,args,cwd,serviceEnv){const p=spawn(command,args,{cwd,env:serviceEnv,stdio:env.HOSTED_QUIET==='true'?'ignore':'inherit',windowsHide:true});children.push(p);p.once('error',()=>{console.error('No se pudo iniciar uno de los servicios.');stop(1)});p.once('exit',()=>{if(!stopping){console.error('Un servicio se detuvo; se cerrará la aplicación.');stop(1)}});return p}
 function stop(code=0){if(stopPromise)return stopPromise;stopping=true;stopPromise=(async()=>{await Promise.all(children.map(p=>new Promise(resolve=>{if(p.exitCode!==null)return resolve();const timer=setTimeout(()=>{p.kill('SIGKILL');resolve()},8000);p.once('close',()=>{clearTimeout(timer);resolve()});p.kill('SIGTERM')})));if(caFile){fs.rmSync(caFile,{force:true});fs.rmdirSync(path.dirname(caFile))}return code})();return stopPromise}
 async function wait(url){const until=Date.now()+60000;while(Date.now()<until){if(stopping)throw Error('Se interrumpió el inicio de la aplicación.');try{const r=await fetch(url,{signal:AbortSignal.timeout(3000)});if(r.ok)return}catch{}await new Promise(r=>setTimeout(r,400))}throw Error('Un servicio no pudo conectarse a su base de datos o no está disponible.')}
 try{
  const login={...env,HOST:'127.0.0.1',PORT:String(ports.login),DB_NAME:env.LOGIN_DB_NAME||env.DB_NAME,JWT_SECRET:env.AUTH_JWT_SECRET||secret('login'),HTTPS_ENABLED:'false'};
  start(process.execPath,['src/server.js'],path.join(base,'services/login-service'),login);
  const shipping={...env,HOST:'127.0.0.1',PORT:String(ports.shipping),FLASK_DEBUG:'0',FLASK_SECRET_KEY:secret('flask'),ARRULLO_DB_HOST:env.DB_HOST,ARRULLO_DB_PORT:env.DB_PORT,ARRULLO_DB_USER:env.DB_USER,ARRULLO_DB_PASSWORD:env.DB_PASSWORD||'',ARRULLO_DB_NAME:env.DB_NAME,ARRULLO_DB_SSL:env.DB_SSL,ARRULLO_SERVICE_API_KEY:env.SHIPPING_SERVICE_API_KEY};if(caFile)shipping.ARRULLO_DB_SSL_CA_FILE=caFile;
  const python=env.SHIPPING_PYTHON||'/opt/venv/bin/python';
  const pythonArgs=process.platform==='win32'?['app.py']:['-m','gunicorn','--bind','127.0.0.1:'+ports.shipping,'--workers','1','--threads','2','--timeout','30','app:app'];
  start(python,pythonArgs,path.join(base,'services/shipping-service'),shipping);
  if(cardEnabled){
   start(process.execPath,['server.cjs'],path.join(base,'services/card-service'),{...env,HOST:'127.0.0.1',PORT:String(ports.card)});
  }
  const checks=[wait(env.AUTH_SERVICE_URL+'/api/v1/salud'),wait(env.SHIPPING_SERVICE_URL+'/health')];
  if(cardEnabled)checks.push(wait(env.CARD_SERVICE_URL+'/health'));
  await Promise.all(checks);
  start(process.execPath,['server.js'],base,{...env,HOST:env.HOST||'0.0.0.0',PORT:String(ports.store)});
  const publicUrl='http://127.0.0.1:'+ports.store;await wait(publicUrl+'/api/health');
  console.log('Arrullo: tienda, administración y servicios disponibles.');return {stop,publicUrl,ports};
 }catch(e){await stop(1);throw e}
}
if(require.main===module){let handle;let requested=false;const shutdown=()=>{requested=true;if(handle)handle.stop().then(()=>{process.exitCode=0})};process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);launchHosted().then(h=>{handle=h;if(requested)shutdown()}).catch(e=>{console.error(e.message);process.exitCode=1})}
module.exports={launchHosted};
