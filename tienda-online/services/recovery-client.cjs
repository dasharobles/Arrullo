async function recoveryCall(base,operation,payload){
 if(!base)throw Object.assign(new Error('La recuperación de acceso aún no está habilitada.'),{status:503});
 let response,data;
 try{response=await fetch(base.replace(/\/$/,'')+'/api/v1/auth/password/'+operation,{method:operation==='status'?'GET':'POST',headers:{'content-type':'application/json'},...(operation==='status'?{}:{body:JSON.stringify(payload)}),signal:AbortSignal.timeout(30000)});data=await response.json();}
 catch{throw Object.assign(new Error('El servicio de recuperación no está disponible. Intenta más tarde.'),{status:503});}
 if(!response.ok||!data.exito)throw Object.assign(new Error(data.mensaje||'No se pudo completar la recuperación.'),{status:response.status>=400&&response.status<500?response.status:503});
 return data.datos;
}
module.exports={recoveryCall};
