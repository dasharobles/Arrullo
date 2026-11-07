const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
process.env.NODE_ENV='test'; process.env.PAYMENT_MODE='test'; process.env.CARD_SERVICE_URL=''; process.env.JWT_SECRET='test-only-secret-change-before-use'; process.env.ADMIN_BOOTSTRAP_KEY='local-test-bootstrap-key';
const {server,pool}=require('./server');
let base, customerToken, adminToken, cartId, addressId, variantId, productId, userId, orderId, slug;
const call=async(path, {method='GET',token,headers={},body}={})=>{const r=await fetch(base+path,{method,headers:{...(body?{'content-type':'application/json'}:{}),...(token?{authorization:`Bearer ${token}`} :{}),...headers},body:body?JSON.stringify(body):undefined});return {status:r.status,body:await r.json()};};
before(async()=>{
  await pool.execute(`CREATE TABLE IF NOT EXISTS sinaloa_postal_codes (postal_code CHAR(5) PRIMARY KEY, municipality VARCHAR(120) NOT NULL, locality VARCHAR(120) NOT NULL DEFAULT '', serviceable BOOLEAN NOT NULL DEFAULT TRUE, base_shipping_rate DECIMAL(10,2) NOT NULL DEFAULT 89.00, source VARCHAR(255) NOT NULL DEFAULT 'SEPOMEX / Correos de México', updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB`);
  await pool.execute(`INSERT IGNORE INTO sinaloa_postal_codes(postal_code,municipality,locality,base_shipping_rate,source) VALUES ('81200','Ahome','Los Mochis',89.00,'integration test seed')`);
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve)); base=`http://127.0.0.1:${server.address().port}`;
  const key=Date.now(),email=`customer-${key}@arrullo.test`; slug=`pijama-${key}`;
  const reg = await call('/api/auth/register', {
  method: 'POST',
  body: {
    name: 'Cliente Test',
    fullName: 'Cliente Test',
    username: `cliente${key}`,
    email,
    password: 'PruebaSegura-2026'
  }
});

assert.equal(reg.status, 201);
customerToken = reg.body.token;
userId = reg.body.user.id;
  

const adm = await call('/api/auth/login', {
  method: 'POST',
  body: {
    username: process.env.TEST_ADMIN_USERNAME,
    email: process.env.TEST_ADMIN_EMAIL,
    password: process.env.TEST_ADMIN_PASSWORD
  }
});

console.log('Inicio de sesión administrador:', {
  status: adm.status,
  error: adm.body?.error,
  role: adm.body?.user?.role
});

assert.equal(adm.status, 200, 'No se pudo iniciar sesión como administrador');
assert.equal(adm.body.user.role, 'admin');

adminToken = adm.body.token;

  
  const p=await call('/api/admin/products',{method:'POST',token:adminToken,body:{name:'Pijama de prueba',slug,category:'pijama',description:'Prenda unisex de algodón',composition:'100% algodón',images:[{url:'https://example.test/1.jpg'},{url:'https://example.test/2.jpg'},{url:'https://example.test/3.jpg'}],variants:[{sku:`TEST-${key}`,size:'0-3',color:'verde_salvia',price:299.5,weightGrams:180,stock:3}]}}); assert.equal(p.status,201); productId=p.body.id;
  const [[v]]=await pool.execute('SELECT id FROM product_variants WHERE product_id=?',[productId]); variantId=v.id;
  const a=await call('/api/addresses',{method:'POST',token:customerToken,body:{recipient:'Cliente Test',line1:'Calle de prueba 1',city:'Los Mochis',state:'SIN',postalCode:'81200'}}); assert.equal(a.status,201); addressId=a.body.id;
  const c=await call('/api/carts',{method:'POST',token:customerToken}); assert.equal(c.status,201); cartId=c.body.id;
});
after(async()=>{try{if(orderId){await pool.execute('DELETE FROM reviews WHERE user_id=?',[userId]);await pool.execute('DELETE FROM returns WHERE user_id=?',[userId]);await pool.execute('DELETE FROM order_items WHERE order_id=?',[orderId]);await pool.execute('DELETE FROM gift_options WHERE order_id=?',[orderId]);await pool.execute('DELETE FROM payments WHERE order_id=?',[orderId]);await pool.execute('DELETE FROM shipments WHERE order_id=?',[orderId]);await pool.execute('DELETE FROM orders WHERE id=?',[orderId]);} if(cartId){await pool.execute('DELETE FROM cart_items WHERE cart_id=?',[cartId]);await pool.execute('DELETE FROM carts WHERE id=?',[cartId]);} if(addressId)await pool.execute('DELETE FROM addresses WHERE id=?',[addressId]); if(productId){await pool.execute('DELETE FROM reviews WHERE product_id=?',[productId]);await pool.execute('DELETE FROM product_variants WHERE product_id=?',[productId]);await pool.execute('DELETE FROM products WHERE id=?',[productId]);} if(userId)await pool.execute('DELETE FROM users WHERE id=?',[userId]);}finally{server.close();await pool.end();}});
test('health y catálogo públicos conectan con MySQL',async()=>{let r=await call('/api/health');assert.equal(r.status,200);assert.equal(r.body.db,'connected');r=await call('/api/products');assert.equal(r.status,200);assert.ok(Array.isArray(r.body.items));});
test('registro valida contraseñas y admin crea catálogo con variantes e imágenes',async()=>{let r=await call('/api/admin/products',{method:'POST',body:{}});assert.equal(r.status,401);r=await call('/api/products');assert.ok(r.body.items.some(p=>p.slug===slug));const invalid=await call('/api/admin/products',{method:'POST',token:adminToken,body:{name:'x',slug:`bad-${Date.now()}`,category:'pijama',variants:[],images:[]}});assert.equal(invalid.status,400);});
test('checkout exige Sinaloa y crea pedido/pago/envío de prueba de forma transaccional',async()=>{
  let r=await call('/api/shipping/quote',{method:'POST',body:{postalCode:'81200',state:'SIN',weightGrams:180}});
  assert.equal(r.status,200);
  const quote=r.body;
  r=await call('/api/carts/'+cartId+'/items',{method:'POST',token:customerToken,body:{variantId,quantity:2}});
  assert.equal(r.status,201);
  const cart=await call('/api/carts/'+cartId,{token:customerToken});
  assert.equal(cart.body.items[0].quantity,2);
  const bad=await call('/api/orders',{method:'POST',token:customerToken,body:{cartId,addressId,quoteId:quote.quoteId,paymentToken:'tok_test_only'}});
  console.log('Diagnóstico del checkout:', {
    status: bad.status,
    error: bad.body?.error,
    message: bad.body?.message,
    code: bad.body?.code
  });
  assert.equal(
    bad.status,
    400,
    `Se esperaba rechazo por peso incorrecto. Respuesta: ${JSON.stringify(bad.body)}`
  );
  const goodQuote=await call('/api/shipping/quote',{method:'POST',body:{postalCode:'81200',state:'SIN',weightGrams:360}});
  const pan=await call('/api/orders',{method:'POST',token:customerToken,body:{cartId,addressId,quoteId:goodQuote.body.quoteId,paymentToken:'4111111111111111'}});
  assert.equal(pan.status,400,'no acepta datos de tarjeta sin tokenización');
  r=await call('/api/orders',{method:'POST',token:customerToken,body:{cartId,addressId,quoteId:goodQuote.body.quoteId,paymentToken:'tok_test_only',gift:{hidePrice:true,wrap:true,note:'Felicidades',fee:35}}});
  assert.equal(r.status,201);
  orderId=r.body.orderId;
  assert.equal(r.body.status,'paid');
  const detail=await call('/api/orders/'+orderId,{token:customerToken});
  assert.equal(detail.status,200);
  assert.equal(detail.body.gift.hide_price,1);
  assert.equal(detail.body.gift.gift_note,'Felicidades');
  const slip=await call(`/api/admin/orders/${orderId}/packing-slip`,{token:adminToken});
  assert.equal(slip.status,200);
  assert.equal(slip.body.hidePrice,true);
  assert.equal('unitPrice' in slip.body.items[0],false);
  const [[v]]=await pool.execute('SELECT stock FROM product_variants WHERE id=?',[variantId]);
  assert.equal(v.stock,1);
  const update=await call(`/api/admin/variants/${variantId}`,{method:'PATCH',token:adminToken,body:{stock:8}});
  assert.equal(update.status,200);
  const [[updated]]=await pool.execute('SELECT stock FROM product_variants WHERE id=?',[variantId]);
  assert.equal(updated.stock,8);
});
test('reportes requieren rol administrativo y cotizaciones validan CP y estado',async()=>{let r=await call('/api/admin/reports/sales',{token:customerToken});assert.equal(r.status,403);r=await call('/api/admin/reports/sales',{token:adminToken});assert.equal(r.status,200);r=await call('/api/shipping/quote',{method:'POST',body:{postalCode:'123',state:'SIN',weightGrams:100}});assert.equal(r.status,400);r=await call('/api/shipping/quote',{method:'POST',body:{postalCode:'81200',state:'SON',weightGrams:100}});assert.equal(r.status,400);});
test('códigos postales se consultan en SEPOMEX y se rechazan los no registrados',async()=>{let r=await call('/api/postal-codes?cp=81200');assert.equal(r.status,200);assert.equal(r.body.municipality,'Ahome');r=await call('/api/postal-codes?cp=99999');assert.equal(r.status,404);const a=await call('/api/addresses',{token:customerToken});assert.equal(a.status,200);assert.ok(a.body.items.some(x=>x.id===addressId));});
