'use strict';
const connectionCodes=new Set(['ECONNREFUSED','ECONNRESET','ETIMEDOUT','ENOTFOUND','EHOSTUNREACH','PROTOCOL_CONNECTION_LOST','PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR','ER_ACCESS_DENIED_ERROR','ER_BAD_DB_ERROR','ER_NO_SUCH_TABLE','ER_CON_COUNT_ERROR']);
function publicError(error){
  if(error.status)return {status:error.status,message:error.message};
  if(connectionCodes.has(error.code)||error.errors?.some(e=>connectionCodes.has(e.code)))return {status:503,message:'No pudimos conectar con la base de datos de la tienda. Revisa la configuración de MySQL.'};
  if(error.code==='ER_DUP_ENTRY')return {status:409,message:'Registro duplicado'};
  return {status:500,message:'Error interno'};
}
async function callLoginService(base,operation,payload,fetcher=fetch){
  let response,data;
  try{
    response=await fetcher(`${base.replace(/\/$/,'')}/api/v1/auth/${operation}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(5000)});
    data=await response.json();
  }catch{throw Object.assign(new Error('El servicio de inicio de sesión no está disponible. Comprueba que esté encendido y configurado.'),{status:503})}
  if(!response.ok||!data.exito){
    const status=response.status>=400&&response.status<500?response.status:503;
    const message=status===503?'El servicio de inicio de sesión no pudo completar la solicitud. Revisa su conexión con MySQL.':data.mensaje||'No se pudo iniciar sesión';
    throw Object.assign(new Error(message),{status});
  }
  if(!data.datos||typeof data.datos.nombreUsuario!=='string'||!['ADMIN','VENDEDOR','CLIENTE'].includes(data.datos.rol))throw Object.assign(new Error('El servicio de inicio de sesión devolvió una respuesta incompleta.'),{status:502});
  return data.datos;
}
module.exports={callLoginService,publicError};
