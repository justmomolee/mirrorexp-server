
export function emailTemplate(title, bodyContent) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        table {
          max-width: 600px;
          width: 100%;
          margin: 0 auto;
          border-spacing: 0;
        }
        img {
          width: 150px;
          height: auto;
          display: block;
        }
        .otp {
          font-size: 22px;
          font-weight: bold;
          color: #000000;
          letter-spacing: 4px;
        }
        .footer {
          font-size: 12px;
          color: #fafafa;
          background-color: #13160F;
          padding: 20px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <table role="presentation" style="width: 100%; background-color: #f4f4f4;">
        <tr>
          <td style="padding: 20px 0;">
            <table role="presentation">
              <!-- Header Section with Logo -->
              <tr>
                <td style="padding: 20px;">
                  <img src="https://mirror-exp-client.vercel.app/logo3.png" alt="MirrorExp Logo" style="max-width: 100px;">
                </td>
              </tr>
              <!-- Body Content Section -->
              <tr>
                  ${bodyContent}
              </tr>
              <!-- Footer Section -->
              <tr>
                <td class="footer">
                  <p>© 2023 MirrorExp Company | All Rights Reserved</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>    
  `;
}

// exports.emailTemplate = emailTemplate;