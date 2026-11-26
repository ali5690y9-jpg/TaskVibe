import "server-only";
import nodemailer from "nodemailer";
export async function sendVerificationCode(to:string,code:string){
 const {SMTP_HOST,SMTP_PORT,SMTP_SECURE,SMTP_USER,SMTP_PASS,SMTP_FROM}=process.env;
 if(!SMTP_HOST||!SMTP_PORT||!SMTP_USER||!SMTP_PASS||!SMTP_FROM) throw new Error("SMTP is not fully configured.");
 const transport=nodemailer.createTransport({host:SMTP_HOST,port:Number(SMTP_PORT),secure:SMTP_SECURE==="true",auth:{user:SMTP_USER,pass:SMTP_PASS}});
 await transport.sendMail({from:SMTP_FROM,to,subject:"Your TaskVibe verification code",text:`Your TaskVibe verification code is ${code}. It expires in 10 minutes. If you did not request this, ignore this email.`,html:`<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px"><h1>TaskVibe</h1><p>Your email verification code is:</p><p style="font-size:30px;font-weight:bold;letter-spacing:8px">${code}</p><p>This code expires in 10 minutes. Never share it with anyone.</p></div>`});
}
