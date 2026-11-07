const {test}=require('node:test');
const assert=require('node:assert/strict');
const {crearAdministracion,stockBajo}=require('./administracion');
test('alerta respeta límite inclusivo del servicio original',()=>{assert.equal(stockBajo(0,5),true);assert.equal(stockBajo(5,5),true);assert.equal(stockBajo(6,5),false)});
test('inventario conserva variantes pausadas y productos sin variantes',async()=>{let calls=0;const pool={query:async()=>++calls===1?[[{id:1,active:1},{id:2,active:0}]]:[[{id:10,product_id:1,active:0,stock:5}]]};const d=await crearAdministracion(pool).inventario();assert.equal(d.items[0].variants[0].active,false);assert.equal(d.items[0].variants[0].lowStock,true);assert.deepEqual(d.items[1].variants,[])});
test('reporte no multiplica ventas por líneas de pedido',async()=>{const pool={query:async sql=>{assert.doesNotMatch(sql,/JOIN/i);return [[{orders_count:1,gross_sales:500}]]}};assert.equal((await crearAdministracion(pool).ventas()).gross_sales,500)});
