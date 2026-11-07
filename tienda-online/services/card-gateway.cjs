'use strict';
const {readProof}=require('./card-service/proof.cjs');
const fail=(status,message)=>{throw Object.assign(new Error(message),{status})};
// Valida carrito, cotización y comprobante firmado sin guardar datos de tarjeta.
async function verifyCard(pool,user,b){
 const url=process.env.CARD_SERVICE_URL,key=process.env.CARD_SERVICE_API_KEY;
 if(!url||!key||!['simulator','test'].includes(process.env.PAYMENT_MODE))fail(503,'El servicio de tarjeta de prueba no está configurado.');
 const [[cart]]=await pool.execute('SELECT id FROM carts WHERE id=? AND user_id=? AND status="open"',[b.cartId||'',user.sub]);if(!cart)fail(404,'Carrito no encontrado');
 const [items]=await pool.execute('SELECT v.price,v.weight_grams,v.stock,ci.quantity FROM cart_items ci JOIN product_variants v ON v.id=ci.variant_id JOIN products p ON p.id=v.product_id WHERE ci.cart_id=? AND v.active=1 AND p.active=1',[cart.id]);if(!items.length)fail(400,'Carrito vacío');if(items.some(i=>i.stock<i.quantity))fail(409,'Inventario insuficiente');
 const weight=items.reduce((n,i)=>n+i.weight_grams*i.quantity,0);
 const [[quote]]=await pool.execute('SELECT id,amount,weight_grams FROM shipping_quotes WHERE id=? AND expires_at>NOW()',[b.quoteId||'']);if(!quote||Number(quote.weight_grams)!==weight)fail(400,'Calcula nuevamente el envío de tu pedido.');
 const amountCents=Math.round((items.reduce((n,i)=>n+Number(i.price)*i.quantity,0)+Number(quote.amount)+(b.giftWrap===true?35:0))*100);
 let r,d;try{r=await fetch(url.replace(/\/$/,'')+'/api/v1/cards/verify',{method:'POST',headers:{'content-type':'application/json','X-Arrullo-Card-Key':key},body:JSON.stringify({userId:Number(user.sub),cartId:cart.id,quoteId:quote.id,amountCents,currency:'MXN',card:b.card}),signal:AbortSignal.timeout(5000)});d=await r.json()}catch{fail(503,'No pudimos conectar con el servicio de tarjetas. Intenta nuevamente.')}
 if(!r.ok)fail([400,401,402,422,429].includes(r.status)?r.status:503,d.error||'No se pudo validar la tarjeta.');
 readProof(d.paymentToken,key,{sub:Number(user.sub),cartId:cart.id,quoteId:quote.id,amountCents});return d;
}
module.exports={verifyCard,readProof};
