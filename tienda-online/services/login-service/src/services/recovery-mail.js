import nodemailer from 'nodemailer';
export function createRecoveryMailer(env=process.env,fetcher=fetch){
  function config(){
    if(!['resend','smtp'].includes(env.MAIL_PROVIDER))return null;
    const api=env.MAIL_PROVIDER==='resend';
    const required=api?['MAIL_API_KEY','MAIL_FROM','PUBLIC_SITE_URL']:['SMTP_HOST','SMTP_USER','SMTP_PASSWORD','SMTP_FROM','PUBLIC_SITE_URL'];
    if(!required.every(key=>typeof env[key]==='string'&&env[key].trim()))return null;
    try{
      const site=new URL(env.PUBLIC_SITE_URL);
      if(site.username||site.password||site.search||site.hash||!['https:','http:'].includes(site.protocol))return null;
      if(site.protocol==='http:'&&!['localhost','127.0.0.1'].includes(site.hostname))return null;
      const port=Number(env.SMTP_PORT||587);if(!api&&![465,587].includes(port))return null;
      const sender=api?env.MAIL_FROM:env.SMTP_FROM;
      if(!/^[^@\s<>]+@[^@\s<>]+\.[^@\s<>]+$/.test(sender.replace(/^.*<([^<>]+)>$/, '$1')))return null;
      return {site,port,api};
    }catch{return null;}
  }
  return {
    available:()=>Boolean(config()),
    async send(email,token){
      const options=config();if(!options)throw Error('Correo sin configurar');
      const url=new URL('/recuperar.html',options.site);url.hash=new URLSearchParams({token}).toString();
      const text=`Solicitaste restablecer tu contraseña en Arrullo.\n\nAbre este enlace (válido durante una hora y para un solo uso):\n${url.href}\n\nSi no lo solicitaste, ignora este correo.`;
      if(options.api){
        const response=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.MAIL_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:env.MAIL_FROM,to:[email],subject:'Recupera tu acceso a Arrullo',text}),signal:AbortSignal.timeout(10000)});
        if(!response.ok)throw Error('No se pudo entregar el correo');
        return;
      }
      const transporter=nodemailer.createTransport({host:env.SMTP_HOST,port:options.port,secure:options.port===465,requireTLS:true,auth:{user:env.SMTP_USER,pass:env.SMTP_PASSWORD},tls:{rejectUnauthorized:false},connectionTimeout:8000,greetingTimeout:8000,socketTimeout:10000,disableFileAccess:true,disableUrlAccess:true});
      await transporter.sendMail({from:env.SMTP_FROM,to:email,subject:'Recupera tu acceso a Arrullo',text});
    }
  };
}
