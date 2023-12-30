const styles = () => {
  return (
    `
    <style>
    body, table, td, div, p, a {
      margin: 0;
      padding: 0;
      border: 0;
      font-size: 100%;
      font: inherit;
      vertical-align: baseline;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #f4f4f4 !important;
    }
    
    /* Add CSS styles inline */
    .header {
      background-color: #031C6E !important;
      padding: 20px;
      text-align: center;
    }
    
    .logo {
      max-width: 150px;
      height: auto;
    }
    
    .content {
      background-color: #ffffff;
      padding: 40px 20px;
    }
    
    .message {
      margin-bottom: 20px;
      line-height: 1.5;
    }
    
    .message-otp {
      margin-bottom: 20px;
      font-size: 22px !important;
      font-weight: 600 !important;
      color: #031C6E !important;
      letter-spacing: 2px !important;
    }
    
    .cta-button {
      display: inline-block;
      width: 100%;
      max-width: 220px;
      background-color: #02ac60 !important;
      color: #fafafa !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      text-align: center;
      padding: 20px;
      border-radius: 12px;
      text-decoration: none !important;
      margin-bottom: 20px;
    }
    
    .footer {
      background-color: #031C6E !important;
      padding: 20px;
      text-align: center;
    }
    
    .footer-logo {
      max-width: 100px;
      height: auto;
      margin-bottom: 10px;
    }
    
    .footer-message {
      font-size: 12px;
      color: #fafafa !important;
      margin-bottom: 10px;
    }
    </style>`
  )
} 


exports.styles = styles