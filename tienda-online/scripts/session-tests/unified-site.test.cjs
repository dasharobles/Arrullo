const {test}=require('node:test'),assert=require('node:assert/strict'),Module=require('node:module'),crypto=require('node:crypto');
process.env.NODE_ENV='test';process.env.JWT_SECRET='prueba-aislada-de-sesion-arrullo';
const users={1:{id:1,name:'Cliente de prueba',email:'cliente@example.invalid',role:'customer'},2:{id:2,name:'Admin de prueba',email:'admin@example.invalid',role:'admin'}};
const pool={execute:async(sql,args)=>[[...(users[args?.[0]]?[users[args[0]]]:[])]],query:async()=>[[{orders_count:0,gross_sales:0}]]};
const original=Module._load;Module._load=function(id,...rest){if(id==='dotenv')return {config(){}};if(id==='mysql2/promise')return {createPool:()=>pool};return original.call(this,id,...rest)};
const {server}=require('../../server');Module._load=original;
function token(id,role){const body=Buffer.from(JSON.stringify({sub:id,role,exp:Date.now()+60000})).toString('base64url');return body+'.'+crypto.createHmac('sha256',process.env.JWT_SECRET).update(body).digest('base64url')}
test('sitio unificado mantiene vistas y permisos sin crear cuentas',async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;try{
 for(const path of ['/','/tienda','/admin','/admin.html'])assert.equal((await fetch(base+path)).status,200,path);
 assert.equal((await fetch(base+'/api/auth/me')).status,401);
 for(const [id,role]of [[1,'customer'],[2,'admin']]){const r=await fetch(base+'/api/auth/me',{headers:{authorization:'Bearer '+token(id,role)}});assert.equal(r.status,200);assert.equal((await r.json()).user.role,role)}
 assert.equal((await fetch(base+'/api/auth/me',{headers:{authorization:'Bearer '+token(3,'customer')}})).status,401);
 assert.equal((await fetch(base+'/api/auth/me',{headers:{authorization:'Bearer '+token(1,'admin')}})).status,401);
 assert.equal((await fetch(base+'/api/admin/reports/sales',{headers:{authorization:'Bearer '+token(1,'customer')}})).status,403);
 assert.equal((await fetch(base+'/api/admin/reports/sales',{headers:{authorization:'Bearer '+token(2,'admin')}})).status,200);
}finally{await new Promise(r=>server.close(r))}});
