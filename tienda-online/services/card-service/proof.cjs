const crypto=require('node:crypto');
function bad(){return Object.assign(new Error('La validación de tarjeta no es válida o venció. Vuelve a validarla.'),{status:402})}
function issueProof(data,key){const body=Buffer.from(JSON.stringify(data)).toString('base64url');return 'tok_card_'+body+'.'+crypto.createHmac('sha256',key).update(body).digest('base64url')}
function readProof(token,key,expected={}){
 if(!key||typeof token!=='string'||token.length>4096||!/^tok_card_[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token))throw bad();
 const [body,sig]=token.slice(9).split('.');const want=crypto.createHmac('sha256',key).update(body).digest('base64url');
 if(sig.length!==want.length||!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(want)))throw bad();
 let d;try{d=JSON.parse(Buffer.from(body,'base64url').toString())}catch{throw bad()}
 if(!Number.isInteger(d.exp)||d.exp<=Date.now()||!Number.isSafeInteger(d.amountCents)||d.amountCents<=0||d.currency!=='MXN'||typeof d.jti!=='string')throw bad();
 for(const [k,v]of Object.entries(expected))if(d[k]!==v)throw bad();return d;
}
module.exports={issueProof,readProof};
