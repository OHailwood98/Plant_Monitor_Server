import nodemailer from "nodemailer";

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
    const sender = '"The Potted Plant Project" <confirmation@TPPP.com>'
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

export function sendReadingAlert(user, device, message, simplified){
  const sender = '"The Potted Plant Project" <alerts@TPPP.com>'
  const transport = setup()
  const email = {
      from: sender,
      to: user.email,
      subject: `Alert! Device ${device.deviceID} (${device.deviceName}) is out of range!`,
      text: `
      Device ${device.deviceID} says: "${message}".
      (${simplified})
      

      Wiew your plant's condition here: http://localhost:3000.
      

      this is an automated email, please do not respond.
      `
  }
  transport.sendMail(email);
}