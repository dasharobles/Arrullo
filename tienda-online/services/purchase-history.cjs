// Adaptación AR-012: consultas reales y acotadas a la identidad autenticada.
async function purchaseHistory(pool, userId, page = 1) {
  if (!Number.isInteger(page) || page < 1 || page > 10000) throw Object.assign(new Error('Página de historial inválida'), {status:400});
  const limit=10,offset=(page-1)*limit;
  const [[count]]=await pool.execute('SELECT COUNT(*) total FROM orders WHERE user_id=?',[userId]);
  const [orders]=await pool.query('SELECT o.public_id,o.status,o.subtotal,o.shipping_fee,o.total,o.created_at,COALESCE(g.gift_fee,0) gift_fee FROM orders o LEFT JOIN gift_options g ON g.order_id=o.id WHERE o.user_id=? ORDER BY o.created_at DESC,o.id DESC LIMIT ? OFFSET ?',[userId,limit,offset]);
  if(orders.length){
    const ids=orders.map(o=>o.public_id);
    const [items]=await pool.query(`SELECT o.public_id,i.product_name,i.size,i.color,i.quantity,i.unit_price FROM order_items i JOIN orders o ON o.id=i.order_id WHERE o.user_id=? AND o.public_id IN (${ids.map(()=>'?').join(',')}) ORDER BY o.id DESC,i.variant_id`,[userId,...ids]);
    for(const order of orders)order.items=items.filter(i=>i.public_id===order.public_id).map(({public_id,...item})=>item);
  }
  return {items:orders,page,pageSize:limit,total:Number(count.total),hasMore:offset+orders.length<Number(count.total)};
}
module.exports={purchaseHistory};
