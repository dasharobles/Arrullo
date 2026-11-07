UPDATE products SET active=FALSE WHERE slug IN ('pijama-luna','mameluco-nube','set-cielo');
INSERT INTO products(slug,name,description,category,composition,active) VALUES
('pijama-oso-crema','Pijama Oso de Algodón','Pijama suave de algodón con detalle de osito, ideal para noches tranquilas.','pijama','100% algodón',TRUE),
('pack-sol','Pack Sol','Bodies ligeros en tonos amarillos pastel para acompañar sus primeros días.','mameluco','100% algodón',TRUE),
('pack-rosa','Pack Rosa','Bodies cómodos en suaves tonos rosa, pensados para combinar con todo.','mameluco','100% algodón',TRUE),
('basicos-cruzados','Básicos Cruzados','Prendas suaves de primera puesta con apertura práctica al frente.','ropa_diaria','100% algodón',TRUE),
('pack-mar','Pack Mar','Bodies de algodón con motivos marinos en tonos azul pastel.','mameluco','100% algodón',TRUE),
('pijama-cuadros-cielo','Pijama Cuadros Cielo','Pijama de dos piezas en azul cielo, cómoda y delicada.','pijama','100% algodón',TRUE),
('pack-bosque','Pack Bosque','Bodies de algodón con estampados tiernos para cada aventura.','mameluco','100% algodón',TRUE),
('pijama-jardin','Pijama Jardín','Pijama de algodón con estampado floral y animalitos.','pijama','100% algodón',TRUE),
('basicos-pastel','Básicos Pastel','Set de primeras prendas suaves en colores pastel.','ropa_diaria','100% algodón',TRUE),
('pijama-conejito','Pijama Conejito','Pijama con estampado de flores y conejitos, suave al tacto.','pijama','100% algodón',TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name),description=VALUES(description),active=TRUE;

INSERT INTO product_images(product_id,image_url,position,alt_text)
SELECT id,CONCAT('/assets/prenda-',LPAD(num,2,'0'),'.png'),1,name FROM products p
JOIN (SELECT 'pijama-oso-crema' slug,1 num UNION ALL SELECT 'pack-sol',2 UNION ALL SELECT 'pack-rosa',3 UNION ALL SELECT 'basicos-cruzados',4 UNION ALL SELECT 'pack-mar',5 UNION ALL SELECT 'pijama-cuadros-cielo',6 UNION ALL SELECT 'pack-bosque',7 UNION ALL SELECT 'pijama-jardin',8 UNION ALL SELECT 'basicos-pastel',9 UNION ALL SELECT 'pijama-conejito',10) src ON src.slug=p.slug
ON DUPLICATE KEY UPDATE image_url=VALUES(image_url),alt_text=VALUES(alt_text);

UPDATE product_variants v JOIN products p ON p.id=v.product_id
SET v.active=FALSE
WHERE p.slug IN ('pijama-oso-crema','pack-sol','pack-rosa','basicos-cruzados','pack-mar','pijama-cuadros-cielo','pack-bosque','pijama-jardin','basicos-pastel','pijama-conejito');

INSERT INTO product_variants(product_id,sku,size,color,price,weight_grams,stock,active)
SELECT p.id,CONCAT('ARR-',p.id,'-',s.size_key,'-',c.color_key),s.size_value,c.color_value,
CASE p.slug WHEN 'pack-mar' THEN 359 WHEN 'pijama-cuadros-cielo' THEN 429 WHEN 'pijama-jardin' THEN 449 WHEN 'pijama-conejito' THEN 459 WHEN 'basicos-pastel' THEN 339 WHEN 'basicos-cruzados' THEN 369 ELSE 389 END,180,12,TRUE
FROM products p
JOIN (SELECT 'pijama-oso-crema' slug,'MAR' color_key,'marfil' color_value UNION ALL SELECT 'pijama-oso-crema','BLA','blanco'
UNION ALL SELECT 'pack-sol','AMA','amarillo' UNION ALL SELECT 'pack-sol','BLA','blanco'
UNION ALL SELECT 'pack-rosa','ROS','rosa' UNION ALL SELECT 'pack-rosa','BLA','blanco'
UNION ALL SELECT 'basicos-cruzados','ARE','arena' UNION ALL SELECT 'basicos-cruzados','GRI','gris' UNION ALL SELECT 'basicos-cruzados','BLA','blanco'
UNION ALL SELECT 'pack-mar','NVA','azul_marino' UNION ALL SELECT 'pack-mar','CIE','azul_cielo' UNION ALL SELECT 'pack-mar','BLA','blanco'
UNION ALL SELECT 'pijama-cuadros-cielo','CIE','azul_cielo' UNION ALL SELECT 'pijama-cuadros-cielo','CUA','azul_cuadros'
UNION ALL SELECT 'pack-bosque','MOS','mostaza' UNION ALL SELECT 'pack-bosque','MAR','marfil' UNION ALL SELECT 'pack-bosque','GRI','gris'
UNION ALL SELECT 'pijama-jardin','FLO','estampado_floral'
UNION ALL SELECT 'basicos-pastel','GRI','gris' UNION ALL SELECT 'basicos-pastel','ROS','rosa_beige' UNION ALL SELECT 'basicos-pastel','SAG','verde_salvia' UNION ALL SELECT 'basicos-pastel','CIE','azul_cielo' UNION ALL SELECT 'basicos-pastel','BLA','blanco'
UNION ALL SELECT 'pijama-conejito','FLO','estampado_floral') c ON c.slug=p.slug
CROSS JOIN (SELECT '03' size_key,'0-3' size_value UNION ALL SELECT '36','3-6' UNION ALL SELECT '612','6-12') s
WHERE p.slug IN ('pijama-oso-crema','pack-sol','pack-rosa','basicos-cruzados','pack-mar','pijama-cuadros-cielo','pack-bosque','pijama-jardin','basicos-pastel','pijama-conejito')
ON DUPLICATE KEY UPDATE price=VALUES(price),weight_grams=VALUES(weight_grams),stock=GREATEST(stock,12),active=TRUE;
