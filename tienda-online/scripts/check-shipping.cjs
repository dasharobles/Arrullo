const assert=require('node:assert/strict'),crypto=require('node:crypto');
const mysql=require('../node_modules/mysql2/promise');
const base='http://127.0.0.1:4317';
(async()=>{const db=await mysql.createConnection({host:'127.0.0.1',port:56442,user:'root',database:'arrullo_test'});const identities=[],quoteIds=[];let boughtVariant=null;
async function call(path,{token,body,method='GET',status=200}={}){const r=await fetch(base+path,{method,headers:{...(token?{authorization:'Bearer '+token}:{}),...(body?{'content-type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});const d=await r.json();assert.equal(r.status,status,path+': '+JSON.stringify(d));return d}
async function user(){const username='envio_'+crypto.randomBytes(6).toString('hex'),email=username+'@example.invalid';const identity={username,email};identities.push(identity);const d=await call('/api/auth/register',{method:'POST',status:201,body:{username,email,password:crypto.randomBytes(24).toString('base64url'),fullName:'Prueba temporal de envíos'}});identity.id=d.user.id;identity.token=d.token;return identity}
try{
 await call('/api/health');assert.equal((await fetch('http://127.0.0.1:4320/health')).status,200);
 const [[before]]=await db.query('SELECT COUNT(*) total FROM sinaloa_postal_codes');assert.equal(before.total,1142);
 for(const cp of ['80000','81200','82000']){const d=await call('/api/postal-codes?cp='+cp);assert.equal(d.postalCode,cp)}
 for(const [postalCode,state,weightGrams]of [['99999','SIN',180],['81200','JAL',180],['81200','SIN',0]])await call('/api/shipping/quote',{method:'POST',body:{postalCode,state,weightGrams},status:400});
 const q1=await call('/api/shipping/quote',{method:'POST',body:{postalCode:'81200',state:'SIN',weightGrams:180}});quoteIds.push(q1.quoteId);assert.equal(q1.amount,107);
 const q2=await call('/api/shipping/quote',{method:'POST',body:{postalCode:'81200',state:'SIN',weightGrams:501}});quoteIds.push(q2.quoteId);assert.equal(q2.amount,125);
 const a=await user(),b=await user();
 const ad=await call('/api/addresses',{method:'POST',token:a.token,status:201,body:{recipient:'Destinatario temporal',line1:'Calle de prueba 1',city:'Los Mochis',state:'SIN',postalCode:'81200'}});
 const products=await call('/api/products');const product=products.items.find(p=>p.variants.some(v=>v.stock>0));assert.ok(product);const variant=product.variants.find(v=>v.stock>0);
 const cart=await call('/api/carts',{method:'POST',token:a.token,status:201});
 await call('/api/carts/'+cart.id+'/items',{method:'POST',token:a.token,status:201,body:{variantId:variant.id,quantity:1}});
 const quote=await call('/api/shipping/quote',{method:'POST',body:{postalCode:'81200',state:'SIN',weightGrams:variant.weight_grams}});quoteIds.push(quote.quoteId);
 const verified=await call('/api/payments/verify-card',{method:'POST',token:a.token,body:{cartId:cart.id,quoteId:quote.quoteId,card:{numero:'4242424242424242',mes:12,anio:new Date().getFullYear()+2,cvv:'123'}}});
 const order=await call('/api/orders',{method:'POST',token:a.token,status:201,body:{cartId:cart.id,addressId:ad.id,quoteId:quote.quoteId,paymentToken:verified.paymentToken}});boughtVariant=variant.id;
 let account=await call('/api/account',{token:a.token});assert.equal(account.shipments.length,1);assert.equal(account.shipments[0].reference,order.publicId);assert.equal(account.shipments[0].status,'quoted');
 const isolated=await call('/api/account',{token:b.token});assert.equal(isolated.shipments.length,0);
 const privateEndpoint=await fetch('http://127.0.0.1:4320/api/v1/arrullo/users/'+a.id+'/shipments');assert.equal(privateEndpoint.status,401);
 const guide='PRUEBA-'+crypto.randomBytes(5).toString('hex');await db.execute('UPDATE shipments SET status=?,tracking_number=? WHERE order_id=?',['shipped',guide,order.orderId]);
 account=await call('/api/account',{token:a.token});assert.equal(account.shipments[0].status,'shipped');assert.equal(account.shipments[0].tracking_number,guide);
 const [[after]]=await db.query('SELECT COUNT(*) total FROM sinaloa_postal_codes');assert.equal(after.total,before.total);
 console.log('OK: 1,142 CP conservados; cobertura válida e inválida; cálculo por peso; checkout simulado; seguimiento real por microservicio; guía y estado; aislamiento entre clientes y clave interna.');
}finally{
 for(const identity of identities){if(identity.id){const [orders]=await db.execute('SELECT id FROM orders WHERE user_id=?',[identity.id]);for(const o of orders){for(const table of ['order_items','gift_options','payments','shipments','returns'])await db.execute('DELETE FROM '+table+' WHERE order_id=?',[o.id]);await db.execute('DELETE FROM orders WHERE id=?',[o.id])}await db.execute('DELETE ci FROM cart_items ci JOIN carts c ON c.id=ci.cart_id WHERE c.user_id=?',[identity.id]);await db.execute('DELETE FROM carts WHERE user_id=?',[identity.id]);await db.execute('DELETE FROM addresses WHERE user_id=?',[identity.id]);await db.execute('DELETE FROM users WHERE id=? AND email=?',[identity.id,identity.email])}await db.execute('DELETE FROM ventas_db.usuarios WHERE nombre_usuario=? AND email=?',[identity.username,identity.email])}
 if(boughtVariant)await db.execute('UPDATE product_variants SET stock=stock+1 WHERE id=?',[boughtVariant]);
 for(const id of quoteIds)await db.execute('DELETE FROM shipping_quotes WHERE id=?',[id]);await db.end();console.log('Datos temporales eliminados y unidad de inventario repuesta; datos anteriores preservados.');
}})().catch(e=>{console.error(e.message);process.exitCode=1});
