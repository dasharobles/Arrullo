'use strict';
const http=require('node:http'),crypto=require('node:crypto'),path=require('node:path');
require('dotenv').config({path:path.join(__dirname,'.env'),quiet:true});
const {issueProof}=require('./proof.cjs');
const testCards=new Set(['4242424242424242','4000000000000002','4000000000009995','4000000000000341']);
function send(res,status,data){res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(data))}
async function createServer(){
 const {verificarDatosTarjeta,limpiarNumero}=await import('./original/tarjeta.mjs');
 const {autorizarTarjeta,tokenizarTarjeta}=await import('./original/pasarelaSimulada.mjs');
 const {registrarFallo,estadoBloqueo}=await import('./original/limiteIntentos.mjs');
 return http.createServer(async(req,res)=>{try{
  const key=process.env.CARD_SERVICE_API_KEY||'';
  if(req.method==='GET'&&req.url==='/health')return send(res,key&&process.env.PAYMENT_MODE==='simulator'?200:503,{ok:Boolean(key)&&process.env.PAYMENT_MODE==='simulator',service:'arrullo-card-validation',mode:'simulator'});
  const supplied=String(req.headers['x-arrullo-card-key']||'');
  if(!key||Buffer.byteLength(key)!==Buffer.byteLength(supplied)||!crypto.timingSafeEqual(Buffer.from(key),Buffer.from(supplied)))return send(res,401,{error:'No autorizado'});
  if(process.env.PAYMENT_MODE!=='simulator')return send(res,503,{error:'Validador de demostración deshabilitado'});
  if(req.method!=='POST'||req.url!=='/api/v1/cards/verify')return send(res,404,{error:'Ruta no encontrada'});
  let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>8192)return send(res,413,{error:'Solicitud demasiado grande'})}
  let b;try{b=JSON.parse(raw)}catch{return send(res,400,{error:'Solicitud inválida'})}
  if(!Number.isSafeInteger(b.userId)||b.userId<1||!Number.isSafeInteger(b.amountCents)||b.amountCents<1||b.currency!=='MXN'||!/^[-0-9a-f]{36}$/i.test(b.cartId||'')||!/^[-0-9a-f]{36}$/i.test(b.quoteId||''))return send(res,400,{error:'Datos del pedido inválidos'});
  const block=estadoBloqueo(b.userId);if(block.bloqueado)return send(res,429,{error:'Demasiados intentos fallidos. Espera unos minutos.'});
  const numero=limpiarNumero(b.card?.numero);
  if(!testCards.has(numero)||b.card?.cvv!=='123'){registrarFallo(b.userId);return send(res,422,{error:'Utiliza una de las tarjetas de prueba y el código de prueba 123.'})}
  const validation=verificarDatosTarjeta(b.card);
  if(!validation.valida){registrarFallo(b.userId);return send(res,422,{error:validation.errores.join(' '),checks:validation.verificaciones})}
  const authorization=autorizarTarjeta({marca:validation.marca,ultimosDigitos:validation.ultimosDigitos,monto:b.amountCents/100,contexto:'pago'});
  if(!authorization.aprobada){registrarFallo(b.userId);return send(res,402,{error:authorization.mensaje,code:authorization.codigo})}
  const exp=Date.now()+5*60_000,jti=tokenizarTarjeta();
  const paymentToken=issueProof({sub:b.userId,cartId:b.cartId,quoteId:b.quoteId,amountCents:b.amountCents,currency:'MXN',exp,jti,authorization:authorization.codigoAutorizacion},key);
  return send(res,200,{paymentToken,expiresAt:new Date(exp).toISOString(),brand:validation.marca,last4:validation.ultimosDigitos,amountCents:b.amountCents,currency:'MXN',message:'Tarjeta de prueba validada. Pago simulado autorizado.'});
 }catch{return send(res,500,{error:'No se pudo validar la tarjeta de prueba'})}});
}
if(require.main===module)createServer().then(s=>s.listen(Number(process.env.PORT||4321),process.env.HOST||'127.0.0.1',()=>console.log('Validación de tarjeta de prueba disponible en puerto '+(process.env.PORT||4321))));
module.exports={createServer};
