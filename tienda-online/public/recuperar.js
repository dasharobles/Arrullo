'use strict';
(()=>{
 const $=s=>document.querySelector(s),message=$('#recovery-message');
 let token=new URLSearchParams(location.hash.slice(1)).get('token');
 if(location.hash)history.replaceState(null,'',location.pathname);
 async function request(path,body){const r=await fetch('/api/auth/password/'+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw Error(data.error||'No se pudo completar la solicitud.');return data;}
 if(token){$('#request-recovery').hidden=true;$('#reset-password').hidden=false;$('#recovery-title').textContent='Nueva contraseña';$('#recovery-description').textContent='Define una nueva contraseña para tu cuenta.';}
 else fetch('/api/auth/password/status',{cache:'no-store'}).then(async r=>{const data=await r.json();if(!r.ok)throw Error(data.error||'Servicio temporalmente no disponible.');$('#request-button').disabled=!data.available;if(!data.available)message.textContent='La recuperación por correo aún no está habilitada. Falta configurar el envío de correos de Arrullo.';}).catch(error=>message.textContent=error.message);
 $('#request-recovery').onsubmit=async event=>{event.preventDefault();const button=$('#request-button');button.disabled=true;message.textContent='Procesando solicitud…';try{const data=await request('request',{email:new FormData(event.currentTarget).get('email')});message.textContent=data.message;}catch(error){message.textContent=error.message;}finally{button.disabled=false;}};
 $('#reset-password').onsubmit=async event=>{event.preventDefault();const form=event.currentTarget,data=new FormData(form);if(data.get('password')!==data.get('confirmation')){message.textContent='Las contraseñas no coinciden.';return;}const button=form.querySelector('button');button.disabled=true;message.textContent='Guardando contraseña…';try{const result=await request('reset',{token,password:data.get('password')});token=null;form.reset();form.hidden=true;ArrulloSession.clear();message.textContent=result.message;}catch(error){message.textContent=error.message;button.disabled=false;}};
})();
