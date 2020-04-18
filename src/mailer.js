import nodemailer from "nodemailer";

const sender = '"The Potted Plant Project" <confirmation@TPPP.com>'

function setup(){
  return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
      }
  });
}

export function sendConfirmEmail(user){
    const transport = setup()
    const email = {
        from: sender,
        to: user.email,
        subject: "The Potted Plant Project Confirmation",
        text: `
        Welcome to The Potted Plant Project, Please Confirm you Email.
        
        ${user.genConfirmUrl()}`
    }
    transport.sendMail(email);
}