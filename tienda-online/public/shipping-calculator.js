'use strict';
window.ArrulloShipping={
 async calculate(postalCode,weightGrams){
  if(!/^\d{5}$/.test(postalCode))throw Error('Escribe un código postal de cinco dígitos.');
  if(!Number.isInteger(weightGrams)||weightGrams<1)throw Error('Agrega prendas a tu bolsa o indica un peso válido.');
  const response=await fetch('/api/shipping/quote',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({postalCode,state:'SIN',weightGrams}),signal:AbortSignal.timeout(8000)});
  const data=await response.json().catch(()=>({}));if(!response.ok)throw Error(data.error||'No pudimos calcular el envío.');return data;
 }
};
