const nodemailer = require('nodemailer');
require('dotenv').config()
const { styles } = require('./mailStyles')


// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  host: 'mail.privateemail.com',
  port: 465,
  secure: true,
  auth: {
    user: `${process.env.SMTP_USER}`,
    pass: `${process.env.SMTP_PASSWORD}`
  },
  tls: { rejectUnauthorized: false }, 
});


const verifyTransporter = () => {
    return new Promise((resolve, reject) => {
    transporter.verify((error, success) => {
      if (error) {
        console.log("verify Error" ,error);
        reject(error);
      } else {
        console.log("Server is ready to take our messages");
        resolve(success);
      }
    });
  });
  };

  

  
const sendMail = (mailData) => {
    return new Promise((resolve, reject) => {
    transporter.sendMail(mailData, (err, info) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        console.log(info);
        resolve(info);
      }
    });
  });
};




async function welcomeMail(userEmail){
  try {
    await verifyTransporter();

    let mailOptions = {
      from: `${process.env.SMTP_USER}`,
      to: `${userEmail}`,
      subject: 'Welcome!',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Welcome To MirrorExp</title>
        ${styles}
      </head>

      <body>
        <table width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center">
              <table width="600" cellspacing="0" cellpadding="0">
                <tr>
                  <td class="header">
                    <img class="logo" src="https://mirror-exp-client.vercel.app/assets/logo-_UlMGsPL.svg" alt="MirrorExp Logo">
                  </td>
                </tr>
                <tr>
                  <td class="content">
                  <p class="message">Hello!,</p>
                  <p class="message">We're thrilled to have you as part of our community. At MirrorExp, we are dedicated to providing the best services and support to our customers.</p>
                  <p class="message">If you have any questions or need assistance, feel free to reach out to our support team at support@mirrorexp.com.</p>
                  <p class="message">Best regards,</p>
                  <p class="message">The MirrorExp Team</p>
                  </td>
                </tr>
                <tr>
                  <td class="footer">
                    <img class="footer-logo" src="https://mirror-exp-client.vercel.app/assets/logo-_UlMGsPL.svg" alt="MirrorExp Logo">
                    <p class="footer-message">© 2023 MirrorExp Company | All Rights Reserved</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
    };
    
  
const result = await sendMail(mailOptions)
  return result
} catch (error) {
  return({ error: "An error occurred while sending the email" })
}
}



async function otpMail(userEmail, otp){
  try {
  await verifyTransporter();
    
  let mailOptions = {
    from: `${process.env.SMTP_USER}`,
    to: `${userEmail}`,
    subject: 'Otp!',
    html: `
    <!DOCTYPE html>
    <html>

    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Otp</title>
      ${styles}
    </head>

    <body>
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table width="600" cellspacing="0" cellpadding="0">
              <tr>
              <td class="header">
                <img class="logo" src="https://mirror-exp-client.vercel.app/assets/logo-_UlMGsPL.svg" alt="MirrorExp Logo">
              </td>
              </tr>
              <tr>
                <td class="content">
                  <p class="message">Hello</p>
                  <p class="message">Your verification code is:</p>
                  <p class="message-otp">${otp}</p>
                  <p class="message">Copy and paste the above code into the form on the website to continue. This code expires in 5 minutes.</p>
                  <p class="message">If you have any questions or need assistance, feel free to reach out to our support team at support@pharmedore.com.</p>
                  <p class="message">Best regards,</p>
                  <p class="message">The MirrorExp Team</p>
                </td>
              </tr>
              <tr>
              <td class="footer">
                <img class="footer-logo" src="https://mirror-exp-client.vercel.app/assets/logo-_UlMGsPL.svg" alt="MirrorExp Logo">
                <p class="footer-message">© 2023 MirrorExp Company | All Rights Reserved</p>
              </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `,
  };
  

const result = await sendMail(mailOptions)
  return result
} catch (error) {
  return({ error: "An error occurred while sending the email" })
}
}



// Password reset mail
async function passwordReset(userEmail){
  try {
    await verifyTransporter();

    let mailOptions = {
      from: `${process.env.SMTP_USER}`,
      to: `${userEmail}`,
      subject: 'Password Reset!',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Password Reset</title>
        ${styles}
      </head>
      
      <body>
        <table width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center">
              <table width="600" cellspacing="0" cellpadding="0">
                <tr>
                  <td class="header">
                    <img class="logo" src="https://mirror-exp-client.vercel.app/assets/logo-_UlMGsPL.svg" alt="MirrorExp Logo">
                  </td>
                </tr>
                <tr>
                  <td class="content">
                    <p class="message">Hello!,</p>
                    <p class="message">A request was sent for password reset, if this wasn't you please contact our customer service. Click the reset link below to proceed</p>
                    <a class="cta-button" href="https://mirrorexp.co/forgotPassword/newPassword">Reset Password</a>
                    <p class="message">If you have any questions or need assistance, feel free to reach out to our support team at support@mirrorexp.com.</p>
                    <p class="message">Best regards,</p>
                    <p class="message">The MirrorExp Team</p>
                  </td>
                </tr>
                <tr>
                  <td class="footer">
                    <img class="footer-logo" src="https://mirror-exp-client.vercel.app/assets/logo-_UlMGsPL.svg" alt="MirrorExp Logo">
                    <p class="footer-message">© 2023 MirrorExp Company | All Rights Reserved</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>    
      `,
  };


const result = await sendMail(mailOptions)
  return result
} catch (error) {
  return({ error: "An error occurred while sending the email" })
}
}



// Alert Admin! mail
async function alertAdmin(email, amount, date, type){
  try {
    await verifyTransporter();

    let mailOptions = {
      from: `${process.env.SMTP_USER}`,
      to: `stormytek@gmail.com`,
      subject: 'Alert Admin!',
      html: `
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Alert Admin!</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
    
          main {
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
            background-color: #fafafa;
            padding: 20px;
            border-radius: 15px;
            display: flex;
            flex-direction: column;
          }
    
          a{
            text-decoration: none;
            color: inherit;
          }
    
          .bigp {
            font-size: 1.2rem;
            line-height: 1.5;
            font-weight: 500;
          }
    
        </style>
      </head>
      <body>
        <main>
          <img style="width: 40%;" src="https://mirror-exp-client.vercel.app/assets/logo-_UlMGsPL.svg" alt="MirrorExp Logo" />
          <p class="bigp">A ${type} request of $${amount} was initiated by a user with this email: ${email}, date: ${date}</p>
        </main>
      </body>
    </html>
      `,
  };


const result = await sendMail(mailOptions)
  return result
} catch (error) {
  return({ error: "An error occurred while sending the email" })
}
}



// deposit mail
async function depositMail(fullName, amount, date, email){
  try {
    await verifyTransporter();

    let mailOptions = {
      from: `${process.env.SMTP_USER}`,
      to: `${email}`,
      subject: 'Deposit Successful!',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Deposit Successful!</title>
        ${styles}
      </head>
      
      <body>
        <table width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center">
              <table width="600" cellspacing="0" cellpadding="0">
                <tr>
                  <td class="header">
                    <img class="logo" src="https://mirror-exp-client.vercel.app/assets/logo-_UlMGsPL.svg" alt="MirrorExp Logo">
                  </td>
                </tr>
                <tr>
                  <td class="content">
                    <p class="message">Dear ${fullName},</p>
                    <p class="message">Your deposit of <strong>${amount}</strong>, ${date}, was successful! Your can now use your funds to trade on MirrorExp.</p>
                    <p class="message">If you have any questions or need assistance, feel free to reach out to our support team at support@mirrorexp.com.</p>
                    <p class="message">Best regards</p>
                    <p class="message">The MirrorExp Team</p>
                  </td>
                </tr>
                <tr>
                  <td class="footer">
                    <img class="footer-logo" src="https://mirror-exp-client.vercel.app/assets/logo-_UlMGsPL.svg" alt="MirrorExp Logo">
                    <p class="footer-message">© 2023 MirrorExp Company | All Rights Reserved</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
  };


const result = await sendMail(mailOptions)
  return result
} catch (error) {
  return({ error: "An error occurred while sending the email" })
}
}




// withdrawal mail
async function withdrawalMail(fullName, amount, date, email){
  try {
    await verifyTransporter();

    let mailOptions = {
      from: `${process.env.SMTP_USER}`,
      to: `${email}`,
      subject: 'Withdrawal Successful!',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Withdrawal Successful!</title>
        ${styles}
      </head>
      
      <body>
        <table width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center">
              <table width="600" cellspacing="0" cellpadding="0">
                <tr>
                  <td class="header">
                    <img class="logo" src="https://mirror-exp-client.vercel.app/assets/logo-_UlMGsPL.svg" alt="MirrorExp Logo">
                  </td>
                </tr>
                <tr>
                  <td class="content">
                    <p class="message">Dear ${fullName},</p>
                    <p class="message">Your Withdrawal of <strong>${amount}</strong>, ${date}, was successful! Thanks for choosing MirrorExp!</p>
                    <p class="message">If you have any questions or need assistance, feel free to reach out to our support team at support@mirrorexp.com.</p>
                    <p class="message">Best regards</p>
                    <p class="message">The MirrorExp Team</p>
                  </td>
                </tr>
                <tr>
                  <td class="footer">
                    <img class="footer-logo" src="https://mirror-exp-client.vercel.app/assets/logo-_UlMGsPL.svg" alt="MirrorExp Logo">
                    <p class="footer-message">© 2023 MirrorExp Company | All Rights Reserved</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
  };


const result = await sendMail(mailOptions)
  return result
} catch (error) {
  return({ error: "An error occurred while sending the email" })
}
}


exports.otpMail = otpMail;
exports.alertAdmin = alertAdmin;
exports.welcomeMail = welcomeMail;
exports.passwordReset = passwordReset;
exports.depositMail = depositMail;
exports.withdrawalMail = withdrawalMail;