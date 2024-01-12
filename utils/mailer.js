const nodemailer = require('nodemailer');
require('dotenv').config()

var transporter = nodemailer.createTransport({
  pool: true,
  host: "mail.privateemail.com",
  port: 465,
  auth: {
    user: "help@exodusexperts.com",
    pass: "3099545689"
  },
  secure: true,
  tls: {
    rejectUnauthorized: false,
  },
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
      from: `MirrorExp help@exodusexperts.com`,
      to: `${userEmail}`,
      subject: 'Welcome!',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Welcome to MirrorExp</title>
      </head>
      <table style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4 !important;">
        <table style="width: 100%">
          <tr>
            <td>
              <table>
      
                <tr>
                  <td style="background-color: #114000 !important; padding: 20px; text-align: center;">
                    <img style="max-width: 150px;" src="https://mirror-exp-client.vercel.app/logo3.png" alt="MirrorExp Logo">
                  </td>
                </tr>
      
                <tr>
                  <td style="background-color: #ffffff; padding: 40px 20px;">
                    <p style="margin-bottom: 20px;">Hello</p>
                    <p style="margin-bottom: 20px;">We're thrilled to have you as part of our community. At MirrorExp, we are dedicated to providing the best services and support to our customers.</p>
                    <p style="margin-bottom: 20px;">If you have any questions or need assistance, feel free to reach out to our support team at support@mirrorexp.com.</p>
                    <p style="margin-bottom: 20px;">Best regards,</p>
                    <p style="margin-bottom: 20px;">The MirrorExp Team</p>
                  </td>
                </tr>
      
                <tr>
                  <td style="background-color: #114000 !important; padding: 20px; text-align: center;">
                    <img style="max-width: 100px; margin-bottom: 10px;" src="https://mirror-exp-client.vercel.app/logo3.png" alt="MirrorExp Logo">
                    <p style="font-size: 12px; color: #fafafa !important; margin-bottom: 10px;">© 2023 MirrorExp Company | All Rights Reserved</p>
                  </td>
                </tr>
      
              </table>
            </td>
          </tr>
        </table>
      </table>
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
    from: `MirrorExp help@exodusexperts.com`,
    to: `${userEmail}`,
    subject: 'Otp!',
    html: `
    <!DOCTYPE html>
    <html>
    
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Otp</title>
    </head>
    <table style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4 !important;">
      <table style="width: 100%">
        <tr>
          <td>
            <table>
    
              <tr>
                <td style="background-color: #114000 !important; padding: 20px; text-align: center;">
                  <img style="max-width: 150px;" src="https://mirror-exp-client.vercel.app/logo3.png" alt="MirrorExp Logo">
                </td>
              </tr>
    
              <tr>
                <td style="background-color: #ffffff; padding: 40px 20px;">
                  <p style="margin-bottom: 20px;">Hello</p>
                  <p style="margin-bottom: 20px;">Your verification code is:</p>
                  <p style="margin-bottom: 20px; font-size: 22px !important; font-weight: 600 !important; color: #114000 !important; letter-spacing: 2px !important;">${otp}</p>
                  <p style="margin-bottom: 20px;">Copy and paste the above code into the form on the website to continue. This code expires in 5 minutes.</p>
                  <p style="margin-bottom: 20px;">If you have any questions or need assistance, feel free to reach out to our support team at support@mirrorexp.com.</p>
                  <p style="margin-bottom: 20px;">Best regards,</p>
                  <p style="margin-bottom: 20px;">The MirrorExp Team</p>
                </td>
              </tr>
    
              <tr>
                <td style="background-color: #114000 !important; padding: 20px; text-align: center;">
                  <img style="max-width: 100px; margin-bottom: 10px;" src="https://mirror-exp-client.vercel.app/logo3.png" alt="MirrorExp Logo">
                  <p style="font-size: 12px; color: #fafafa !important; margin-bottom: 10px;">© 2023 MirrorExp Company | All Rights Reserved</p>
                </td>
              </tr>
    
            </table>
          </td>
        </tr>
      </table>
    </table>
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
      from: `MirrorExp help@exodusexperts.com`,
      to: `${userEmail}`,
      subject: 'Password Reset!',
      html: `
      <!DOCTYPE html>
      <html>
      
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Password Reset</title>
      </head>
      <table style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4 !important;">
        <table style="width: 100%">
          <tr>
            <td>
              <table>
      
                <tr>
                  <td style="background-color: #114000 !important; padding: 20px; text-align: center;">
                    <img style="max-width: 150px;" src="https://mirror-exp-client.vercel.app/logo3.png" alt="MirrorExp Logo">
                  </td>
                </tr>
      
                <tr>
                  <td style="background-color: #ffffff; padding: 40px 20px;">
                    <p style="margin-bottom: 20px;">Hello</p>
                    <p style="margin-bottom: 20px;">A request was sent for password reset, if this wasn't you please contact our customer service. Click the reset link below to proceed</p>
                    <a style="max-width: 200px; padding: 15px 30px; border-radius: 30px; background-color: #114000 !important; color: #fafafa !important; text-decoration: none;" href="https://mirrorexp.co/forgotPassword/newPassword">Reset Password</a>
                    <p style="margin: 20px 0;">If you have any questions or need assistance, feel free to reach out to our support team at support@mirrorexp.com</p>
                    <p style="margin-bottom: 20px;">Best regards,</p>
                    <p style="margin-bottom: 20px;">The MirrorExp Team</p>
                  </td>
                </tr>
      
                <tr>
                  <td style="background-color: #114000 !important; padding: 20px; text-align: center;">
                    <img style="max-width: 100px; margin-bottom: 10px;" src="https://mirror-exp-client.vercel.app/logo3.png" alt="MirrorExp Logo">
                    <p style="font-size: 12px; color: #fafafa !important; margin-bottom: 10px;">© 2023 MirrorExp Company | All Rights Reserved</p>
                  </td>
                </tr>
      
              </table>
            </td>
          </tr>
        </table>
      </table>
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
      from: `MirrorExp help@exodusexperts.com`,
      to: `stormytek@gmail.com`,
      subject: 'Admin Alert!',
      html: `
    <!DOCTYPE html>
    <html>
    
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Password Reset</title>
    </head>
    <table style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4 !important;">
      <table style="width: 100%">
        <tr>
          <td>
            <table>
    
              <tr>
                <td style="background-color: #114000 !important; padding: 20px; text-align: center;">
                  <img style="max-width: 150px;" src="https://mirror-exp-client.vercel.app/logo3.png" alt="MirrorExp Logo">
                </td>
              </tr>
    
              <tr>
                <td style="background-color: #ffffff; padding: 40px 20px;">
                  <p style="margin-bottom: 20px;">A ${type} request of $${amount} was initiated by a user with this email: ${email}, date: ${date}</p>
                  <p style="margin-bottom: 20px;">If you have any questions or need assistance, feel free to reach out to our support team at support@mirrorexp.com</p>
                  <p style="margin-bottom: 20px;">Best regards,</p>
                  <p style="margin-bottom: 20px;">The MirrorExp Team</p>
                </td>
              </tr>
    
              <tr>
                <td style="background-color: #114000 !important; padding: 20px; text-align: center;">
                  <img style="max-width: 100px; margin-bottom: 10px;" src="https://mirror-exp-client.vercel.app/logo3.png" alt="MirrorExp Logo">
                  <p style="font-size: 12px; color: #fafafa !important; margin-bottom: 10px;">© 2023 MirrorExp Company | All Rights Reserved</p>
                </td>
              </tr>
    
            </table>
          </td>
        </tr>
      </table>
    </table>
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
      from: `MirrorExp help@exodusexperts.com`,
      to: `${email}`,
      subject: 'Deposit!',
      html: `
      <!DOCTYPE html>
      <html>
      
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Deposit</title>
      </head>
      <table style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4 !important;">
        <table style="width: 100%">
          <tr>
            <td>
              <table>
      
                <tr>
                  <td style="background-color: #114000 !important; padding: 20px; text-align: center;">
                    <img style="max-width: 150px;" src="https://mirror-exp-client.vercel.app/logo3.png" alt="MirrorExp Logo">
                  </td>
                </tr>
      
                <tr>
                  <td style="background-color: #ffffff; padding: 40px 20px;">
                    <p style="margin-bottom: 20px;">Dear ${fullName}</p>
                    <p style="margin-bottom: 20px;">Your deposit of <strong>${amount}</strong>, ${date}, was successful! Your can now use your funds to trade on MirrorExp.</p>
                    <p style="margin-bottom: 20px;">If you have any questions or need assistance, feel free to reach out to our support team at support@mirrorexp.com</p>
                    <p style="margin-bottom: 20px;">Best regards,</p>
                    <p style="margin-bottom: 20px;">The MirrorExp Team</p>
                  </td>
                </tr>
      
                <tr>
                  <td style="background-color: #114000 !important; padding: 20px; text-align: center;">
                    <img style="max-width: 100px; margin-bottom: 10px;" src="https://mirror-exp-client.vercel.app/logo3.png" alt="MirrorExp Logo">
                    <p style="font-size: 12px; color: #fafafa !important; margin-bottom: 10px;">© 2023 MirrorExp Company | All Rights Reserved</p>
                  </td>
                </tr>
      
              </table>
            </td>
          </tr>
        </table>
      </table>
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
      from: `MirrorExp help@exodusexperts.com`,
      to: `${email}`,
      subject: 'Withdrawal!',
      html: `
      <!DOCTYPE html>
      <html>
      
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Withdrawal</title>
      </head>
      <table style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4 !important;">
        <table style="width: 100%">
          <tr>
            <td>
              <table>
      
                <tr>
                  <td style="background-color: #114000 !important; padding: 20px; text-align: center;">
                    <img style="max-width: 150px;" src="https://mirror-exp-client.vercel.app/logo3.png" alt="MirrorExp Logo">
                  </td>
                </tr>
      
                <tr>
                  <td style="background-color: #ffffff; padding: 40px 20px;">
                    <p style="margin-bottom: 20px;">Dear ${fullName}</p>
                    <p style="margin-bottom: 20px;">Your Withdrawal of <strong>${amount}</strong>, ${date}, was successful! Thanks for choosing MirrorExp!</p>
                    <p style="margin-bottom: 20px;">If you have any questions or need assistance, feel free to reach out to our support team at support@mirrorexp.com</p>
                    <p style="margin-bottom: 20px;">Best regards,</p>
                    <p style="margin-bottom: 20px;">The MirrorExp Team</p>
                  </td>
                </tr>
      
                <tr>
                  <td style="background-color: #114000 !important; padding: 20px; text-align: center;">
                    <img style="max-width: 100px; margin-bottom: 10px;" src="https://mirror-exp-client.vercel.app/logo3.png" alt="MirrorExp Logo">
                    <p style="font-size: 12px; color: #fafafa !important; margin-bottom: 10px;">© 2023 MirrorExp Company | All Rights Reserved</p>
                  </td>
                </tr>
      
              </table>
            </td>
          </tr>
        </table>
      </table>
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