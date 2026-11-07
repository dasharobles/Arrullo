// Adaptación AR-028: tokens con hash, caducidad y un uso en la BD del login.
import {randomBytes,createHash} from 'node:crypto';
import {ErrorAplicacion} from '../utils/errores.js';
export const tokenHash=token=>createHash('sha256').update(token).digest('hex');
const problem=(message,status=400)=>new ErrorAplicacion(message,{estadoHttp:status,codigo:'RECUPERACION'});
export function createRecovery({pool,hashPassword,mailer,now=()=>new Date()}) {
  return {
    available:()=>mailer.available(),
    async request(email){
      if(typeof email!=='string'||email.length>120||!/^\S+@\S+\.\S+$/.test(email.trim()))throw problem('Ingresa un correo electrónico válido.');
      if(!mailer.available())throw problem('La recuperación por correo aún no está habilitada.',503);
      const c=await pool.getConnection();let raw,recipient,hash;
      try{
        await c.beginTransaction();
        const [[user]]=await c.execute('SELECT id,email FROM usuarios WHERE LOWER(email)=? AND activo=1 FOR UPDATE',[email.trim().toLowerCase()]);
        if(user){
          raw=randomBytes(32).toString('hex');hash=tokenHash(raw);recipient=user.email;
          await c.execute('UPDATE password_reset_tokens SET used_at=UTC_TIMESTAMP() WHERE user_id=? AND used_at IS NULL',[user.id]);
          await c.execute('INSERT INTO password_reset_tokens(token_hash,user_id,expires_at) VALUES(?,?,?)',[hash,user.id,new Date(now().getTime()+3600000)]);
        }
        await c.commit();
      }catch(error){await c.rollback();throw error;}finally{c.release();}
      if(raw){
        try{await mailer.send(recipient,raw);}
        catch{
          await pool.execute('UPDATE password_reset_tokens SET used_at=UTC_TIMESTAMP() WHERE token_hash=?',[hash]);
          // Respuesta uniforme: no revela qué direcciones tienen cuenta.
          console.error('No se pudo entregar un correo de recuperación. Revisar configuración de correo.');
        }
      }
      return {message:'Solicitud recibida. Si el correo corresponde a una cuenta activa, recibirás instrucciones para recuperar el acceso.'};
    },
    async reset(token,password){
      if(typeof token!=='string'||! /^[a-f0-9]{64}$/.test(token))throw problem('El enlace es inválido o ha vencido. Solicita uno nuevo.');
      if(typeof password!=='string'||password.length<8||Buffer.byteLength(password,'utf8')>72)throw problem('Usa al menos 8 caracteres y como máximo 72 bytes para la contraseña.');
      const hash=tokenHash(token),c=await pool.getConnection();
      try{
        // Primero identificar usuario, luego bloquearlo: mismo orden que request.
        const [[lookup]]=await c.execute('SELECT user_id FROM password_reset_tokens WHERE token_hash=?',[hash]);
        if(!lookup)throw problem('El enlace es inválido o ha vencido. Solicita uno nuevo.');
        await c.beginTransaction();
        const [[user]]=await c.execute('SELECT id,email FROM usuarios WHERE id=? AND activo=1 FOR UPDATE',[lookup.user_id]);
        const [[record]]=await c.execute('SELECT user_id,expires_at,used_at FROM password_reset_tokens WHERE token_hash=? FOR UPDATE',[hash]);
        if(!user||!record||record.used_at||new Date(record.expires_at).getTime()<=now().getTime())throw problem('El enlace es inválido o ha vencido. Solicita uno nuevo.');
        const passwordHash=await hashPassword(password);
        await c.execute('UPDATE usuarios SET password_hash=?,intentos_fallidos=0,bloqueado_hasta=NULL WHERE id=?',[passwordHash,user.id]);
        await c.execute('UPDATE password_reset_tokens SET used_at=UTC_TIMESTAMP() WHERE user_id=? AND used_at IS NULL',[user.id]);
        await c.commit();
        return {message:'Contraseña actualizada. Ya puedes iniciar sesión.',accountEmail:user.email};
      }catch(error){await c.rollback();throw error;}finally{c.release();}
    }
  };
}
