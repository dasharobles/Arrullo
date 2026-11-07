'use strict';
window.ArrulloSession=(()=>{
 const listeners=new Set();
 function read(){try{const token=localStorage.getItem('arrullo-token'),user=JSON.parse(localStorage.getItem('arrullo-user')||'null');return token&&user?{token,user}:null}catch{return null}}
 function notify(){const s=read();for(const fn of listeners)fn(s)}
 function save(token,user){const before=read();localStorage.setItem('arrullo-token',token);localStorage.setItem('arrullo-user',JSON.stringify(user));if(before?.token!==token||JSON.stringify(before?.user)!==JSON.stringify(user))notify();return {token,user}}
 function clear(){localStorage.removeItem('arrullo-token');localStorage.removeItem('arrullo-user');notify()}
 async function refresh(){const s=read();if(!s)return null;const r=await fetch('/api/auth/me',{headers:{authorization:'Bearer '+s.token},cache:'no-store'});if(read()?.token!==s.token)return read();if(r.status===401||r.status===403){clear();return null}if(!r.ok)throw Error('No se pudo comprobar la sesión.');const d=await r.json();return save(s.token,d.user)}
 function onChange(fn){listeners.add(fn);return ()=>listeners.delete(fn)}
 window.addEventListener('storage',e=>{if(!e.key||e.key==='arrullo-token'||e.key==='arrullo-user')notify()});
 window.addEventListener('focus',()=>refresh().catch(()=>{}));
 return {read,save,clear,refresh,onChange};
})();
