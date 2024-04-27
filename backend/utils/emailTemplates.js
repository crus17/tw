const formatAmount = value => `₦${new Intl.NumberFormat('en-US').format(parseFloat((value?value:0).toString().replace(/[^\d.]/g, '')).toFixed(2))}`;
const styling = `
  <style>
    /* Basic styling for the email */
    body {
        font-family: Arial, sans-serif;
        line-height: 1.5;
        margin: 0;
        padding: 0;
        background: #f7f9fc;
    }

    .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
    }

    .header {
        background: #0b5cbe;
        background-image: url(\`${process.env.FRONTEND_URL}/media/patternt.png\`),url(\`${process.env.FRONTEND_URL}/media/patternd.png\`);
        background-position: right top,left bottom;
        background-repeat: no-repeat;
        background-size: 25% auto;
        border-radius: 10px 10px 0 0;
        padding: 20px 0;
        display: flex;
        align-items: center;
        flex-direction: column;
        color: #fff;
        justify-content: center;
    }

    .button {
        display: inline-block;
        background-color: #007bff;
        color: #fff;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
    }
    .logo{
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        font-weight: 700;
        padding: 10px;
        color: #0500FF;
    }
    .message{
        background: #fff;
        padding: 30px;
        border-radius: 0 0 10px 10px;
    }
    .footer{
        display: flex;
        padding: 20px;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }
    .footer h3{
        margin-bottom: 5px;
    }
    .media{
        display: flex;
        gap: 5px;
        margin-top: 10px;
    }
    .media img{
        width: 10px;
        height: 10px;
        padding: 10px;
        border-radius: 5px;
        background: #99a6b4;
    }
    </style>
`
exports.accountDisabledEmailTemplate = (subject, link)=>`
<!DOCTYPE html>
<html>
<head>
    <title>${subject}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${styling}
</head>

<body>
    <div class="container">
        <div class="logo">
            <img src=\`${process.env.FRONTEND_URL}/media/logo_h.png\` width="100px" alt="">
        </div>
        <div class="header">
            <img src=\`${process.env.FRONTEND_URL}/media/verified_locked.png\` width="50px" alt="">
            <h1 style="margin-top: 0;">${subject}</h1>
        </div>
        <div class="message">

            <p>Hello</p>
            <p>We hope this email finds you well. We are reaching out to inform you about some unusual activity detected on your Trust
            Wallet account. As part of our ongoing efforts to maintain the security of our platform and protect our users, we have
            temporarily disabled your account.</p>
    
            <p>Your security is our top priority, and we take any suspicious activity very seriously. In order to restore access to
            your account and resume transactions, we kindly ask you to verify your identity by answering a few security questions.</p>
    
            <p>To expedite the verification process and regain access to your account, please click on the button below:</p>
    
            <p>
                <a class="button" href="${link}">Verify Account</a>
            </p>
    
            <p>Upon clicking the button, you will be directed to a secure verification form where you can answer the security questions
            accurately and to the best of your ability.</p>
    
            <p>Please note that failure to complete the verification process within 48 hours may result in
            further suspension of your account for security reasons.</p>
    
            <p>We understand that this may cause inconvenience, but please rest assured that we are committed to ensuring the safety
            and security of your funds and personal information.</p>
    
            <p>Thank you for your cooperation and understanding.</p>
    
            <p>Best regards,</p>
            <p>- Team ${process.env.APP_NAME}</p>
        </div>
        <div class="footer">
            <div>
                <a href="#privacy">Privacy Policy</a> | <a href="#termsofserivice">Terms of Service</a>
            </div>
            <h3>Stay Connected:</h3>
            <div class="media">
                <a href="#">
                    <img src=\`${process.env.FRONTEND_URL}/media/facebook.svg\` alt="Facebook">
                </a>
                <a href="#">
                    <img src=\`${process.env.FRONTEND_URL}/media/x.svg\` alt="x">
                </a>
                <a href="#">
                    <img src=\`${process.env.FRONTEND_URL}/media/instagram.svg\` alt="Instagram">
                </a>
                <a href="#">
                    <img src=\`${process.env.FRONTEND_URL}/media/github.svg\` alt="Github">
                </a>
                <a href="#">
                    <img src=\`${process.env.FRONTEND_URL}/media/discord.svg\` alt="Discord">
                </a>
                <a href="#">
                    <img src=\`${process.env.FRONTEND_URL}/media/reddit.svg\` alt="Reddit">
                </a>
                <a href="#">
                    <img src=\`${process.env.FRONTEND_URL}/media/telegram.svg\` alt="Telegram">
                </a>
            </div>
        </div>
    </div>
</body>
</html>
`

exports.activationEmailTemplate = (token, type)=>`
<!DOCTYPE html>
<html>
<head>
  <title>${process.env.APP_NAME} Security Notification - ${type}</title>
  ${styling}
</head>
<body>
  <div class="container">
    <h1>${process.env.APP_NAME} ${type}</h1>
    <p>Please use the following One Time Passord (OTP): ${token}. This Password would expire after 20 minutes</p>
    <p>Best regards,</p>
    <p>The ${process.env.APP_NAME} Team</p>
  </div>
</body>
</html>
`

exports.projectSuccessNotificationEmailTemplateUser = (details)=>`
<!DOCTYPE html>
<html>
<head>
  <title>Project Completion and Returns Notification</title>
  ${styling}
</head>
<body>
  <div class="container">
    <p>Dear ${details.username},</p>
    <p>We are excited to share that Project ${details.projectId} has successfully concluded. Here are the details of your returns:</p>
    <ul>
      <li>Contribution Amount: ${formatAmount(details.contributedAmount)}</li>
      <li>Returns : ${formatAmount(details.profit)}</li>
      <li>Total Credited to Wallet: ${formatAmount(details.profit + details.contributedAmount)}</li>
    </ul>
    <p>Thank you for your valuable contribution to this project. If you have any questions or need further assistance, please don't hesitate to reach out.</p>
    <p>Best regards,</p>
    <p>The ${process.env.APP_NAME} Team</p>
  </div>
</body>
</html>
`

exports.projectSuccessNotificationEmailTemplatePunter = (details)=>`
<!DOCTYPE html>
<html>
<head>
  <title>Project Completion and Punter Commission Notification</title>
  ${styling}
</head>
<body>
  <div class="container">
    <p>Dear ${details.username},</p>
    <p>We are pleased to inform you that Project ${details.projectId} has been successfully completed.</p>
    
    <p>Project Summary:</p>
    <ul>
      <li>Project Unique ID: ${details.projectId}</li>
      <li>Total Contribution Amount: ${formatAmount(details.contributedAmount)}</li>
      <li>Project Returns: ${formatAmount(details.profit)}</li>
      <li>Punter Commission: ${formatAmount(details.commission)}</li>
    </ul>

    <p>Your Wallet Has Been Credited:</p>
    <ul>
      <li>Credited Amount: ${formatAmount(details.commission)}</li>
      <li>New Wallet Balance: ${formatAmount(details.walletBalance)}</li>
    </ul>
    <p>Thank you for choosing us for your projects. If you have any questions or require further assistance, please contact our support team.</p>
    <p>Best regards,</p>
    <p>The ${process.env.APP_NAME} Team</p>
  </div>
</body>
</html>
`

exports.projectFailureNotificationEmailTemplateUser = (details)=>`
<!DOCTYPE html>
<html>
<head>
  <title>Project Completion and Returns Notification</title>
  ${styling}
</head>
<body>
  <div class="container">
    <p>Dear ${details.username},</p>
    <p>We regret to inform you that Project ${details.projectId} did not yield any profit, and there was ${details.profit < 0?'a':'no'} loss in the project. Here are the details:</p>
    <ul>
      <li>Contribution Amount: ${formatAmount(details.contributedAmount)}</li>
      <li>Loss Incurred: ${formatAmount(Math.abs(details.profit))}</li>
      <li>Total Amount Returned: ${formatAmount(details.profit + details.contributedAmount) <= 1? 0: (details.contributedAmount + details.profit)}</li>
    </ul>
    <p>We understand that this outcome may be disappointing. If you have any questions or concerns, please don't hesitate to reach out. We appreciate your participation in this project.</p>
    <p>Best regards,</p>
    <p>The ${process.env.APP_NAME} Team</p>
  </div>
</body>
</html>
`
exports.projectNoEngagementNotificationEmailTemplateUser = (details)=>`
<!DOCTYPE html>
<html>
<head>
  <title>Project Completion Notification</title>
  ${styling}
</head>
<body>
  <div class="container">
    <p>Dear ${details.username},</p>
    <p>Project ${details.projectId} has completed and did not yield any profit, and there was no loss of capital in the project. Here are the details:</p>
    <ul>
      <li>Contribution Amount: ${formatAmount(details.contributedAmount)}</li>
      <li>Loss Incurred: ${formatAmount(Math.abs(0))}</li>
      <li>Total Amount Returned: ${formatAmount(details.contributedAmount.toString())}</li>
    </ul>
    <p>We understand that this outcome may be disappointing. If you have any questions or concerns, please don't hesitate to reach out. We appreciate your participation in this project.</p>
    <p>Best regards,</p>
    <p>The ${process.env.APP_NAME} Team</p>
  </div>
</body>
</html>
`

exports.projectNoEngagementNotificationEmailTemplatePunter = (details)=>`
<!DOCTYPE html>
<html>
<head>
  <title>Project Completion Notification</title>
  ${styling}
</head>
<body>
  <div class="container">
    <p>Dear ${details.username},</p>

    <p>We want to inform you that Project ${details.projectId} has concluded without any engagement, there was no profit generated. As a result, no punter commission is applicable for this project.</p>
   
    <p>If you have any questions or need further clarification, please feel free to contact us. We appreciate your involvement in this project.</p>
    
    <p>Best regards,</p>
    <p>The ${process.env.APP_NAME} Team</p>
  </div>
</body>
</html>
`

exports.projectFailureNotificationEmailTemplatePunter = (details)=>`
<!DOCTYPE html>
<html>
<head>
  <title>Project Completion and Returns Notification</title>
  ${styling}
</head>
<body>
  <div class="container">
    <p>Dear ${details.username},</p>

    <p>We want to inform you that Project ${details.projectId} has concluded, but unfortunately, there was no profit generated. As a result, no punter commission is applicable for this project.</p>
   
    <p>If you have any questions or need further clarification, please feel free to contact us. We appreciate your involvement in this project.</p>
    
    <p>Best regards,</p>
    <p>The ${process.env.APP_NAME} Team</p>
  </div>
</body>
</html>
`

exports.activationEmailTemplate2 = (url, firstName)=>`
<!DOCTYPE html>
<html>
<head>
  <title>Activate Your ${process.env.APP_NAME} Account - Let's Get Started!</title>
  ${styling}
</head>
<body>
  <div class="container">
    <h1>Activate Your ${process.env.APP_NAME} Account - Let's Get Started!</h1>
    <p>Dear ${firstName},</p>
    <p>Activate your ${process.env.APP_NAME} account now to start connecting with skilled service providers for your needs. Click on the activation button or copy and paste the activation link below into your web browser:</p>
    <p>
      <a class="button" href="${url}">Activate My Account</a>
    </p>
    <p>Activation Link:</p>
    <p>${url}</p>
    <p>Don't miss out on the benefits of ${process.env.APP_NAME}'s services. Activate your account today!</p>
    <p>Best regards,</p>
    <p>The ${process.env.APP_NAME} Team</p>
  </div>
</body>
</html>
`

exports.passwordResetTemplate = (url, email, firstName) =>`
<!DOCTYPE html>
<html>
<head>
  <title>${process.env.APP_NAME} Password Reset!</title>
  ${styling}
</head>
<body>
  <div class="container">
    <h1>Password Reset</h1>
    <p>Hello ${firstName},</p>
    <p>We're sending you this email because you requested a password reset. Click on this link to create a new password:</p>
    <p>
      <a class="button" href="${url}">Click here to reset your password</a>
    </p>
    
    <p>If you didn't request a password reset, you can ignore this email. Your password will not be changed.</p>
    
    <p>Thank you,</p>
    <p>The ${process.env.APP_NAME} Team</p>
  </div>
</body>
</html>
`