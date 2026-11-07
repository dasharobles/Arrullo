'use strict';
function normal(value){return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
function reconcileCart(items,products){
 const inventory=products.flatMap(p=>(p.variants||[]).map(v=>({p,v}))),result=[];let repaired=0,priceChanged=false,weightChanged=false;
 const same=(x,e)=>normal(x.name)===normal(e.p.name)&&String(x.size)===String(e.v.size)&&normal(x.color)===normal(e.v.color);
 for(const source of items){
  let match=source.sku?inventory.find(e=>e.v.sku===source.sku):undefined;
  if(!match)match=inventory.find(e=>String(e.v.id)===String(source.variantId)&&same(source,e));
  if(!match){const matches=inventory.filter(e=>same(source,e));if(matches.length===1)match=matches[0]}
  if(!match){result.push({...source,unavailable:true,availabilityError:'Esta talla o color ya no está disponible. Quita la prenda y elige una opción del catálogo.'});continue}
  const {p,v}=match,weight=Number(v.weightGrams??v.weight_grams)||180;
  if(String(source.variantId)!==String(v.id))repaired++;
  if(Number(source.price)!==Number(v.price))priceChanged=true;if(Number(source.weightGrams)!==weight)weightChanged=true;
  const item={...source,productId:p.id,sku:v.sku,variantId:v.id,name:p.name,image:p.images?.[0]?.url||source.image,size:v.size,color:v.color,price:Number(v.price),weightGrams:weight,stock:Number(v.stock),unavailable:false,availabilityError:''};
  const existing=result.find(e=>!e.unavailable&&String(e.variantId)===String(item.variantId));if(existing)existing.quantity=Number(existing.quantity)+Number(item.quantity);else result.push(item);
 }
 for(const item of result){if(item.unavailable)continue;if(!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>20){item.unavailable=true;item.availabilityError='Revisa la cantidad de esta prenda (máximo 20 piezas por variante).'}else if(item.quantity>item.stock){item.unavailable=true;item.availabilityError=item.stock?'Solo quedan '+item.stock+' piezas de esta talla y color.':'Esta talla y color están agotados.'}}
 const lineItemsChanged=items.length!==result.length||items.some((x,i)=>String(x.variantId)!==String(result[i]?.variantId)||x.quantity!==result[i]?.quantity);
 return {items:result,repaired,priceChanged,weightChanged,lineItemsChanged,unavailable:result.some(x=>x.unavailable),changed:JSON.stringify(result)!==JSON.stringify(items)};
}
if(typeof module!=='undefined'&&module.exports)module.exports={reconcileCart};else window.ArrulloCart={reconcileCart};
