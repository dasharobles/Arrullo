'use strict';
// Adaptación de CRUD INVENTARIO/src/services/producto.service.js:
// se conserva la consulta parametrizada y se usa el esquema product/variant de Arrullo.
// AlertaStockMinimo/Services/AlertaStockService.cs: CantidadActual <= StockMinimo.
function stockBajo(stock, minimo) { return Number(stock) <= Number(minimo); }
function crearAdministracion(pool, minimo = 5) {
  return {
    async inventario() {
      const [products] = await pool.query(`SELECT p.id,p.name,p.category,p.active,
        (SELECT image_url FROM product_images WHERE product_id=p.id ORDER BY position LIMIT 1) image
        FROM products p ORDER BY p.id DESC`);
      const [variants] = await pool.query('SELECT id,product_id,sku,size,color,price,stock,weight_grams,active FROM product_variants ORDER BY id');
      const grouped = new Map();
      for (const v of variants) { v.active = Boolean(v.active); v.lowStock = stockBajo(v.stock, minimo); if (!grouped.has(v.product_id)) grouped.set(v.product_id, []); grouped.get(v.product_id).push(v); }
      return { minimum: minimo, items: products.map(p=>({...p,active:Boolean(p.active),variants:grouped.get(p.id)||[]})) };
    },
    // Adaptación de servicio-reporte-compras/src/reportes.js: agregar cabeceras,
    // sin unir líneas del pedido, para evitar duplicar los importes.
    async ventas() {
      const [[r]] = await pool.query('SELECT COUNT(*) orders_count,COALESCE(SUM(total),0) gross_sales FROM orders WHERE status IN ("paid","preparing","shipped","delivered")');
      return r;
    }
  };
}
module.exports = { crearAdministracion, stockBajo };
