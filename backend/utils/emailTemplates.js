const formatAmount = value => `₦${new Intl.NumberFormat('en-US').format(parseFloat((value?value:0).toString().replace(/[^\d.]/g, '')).toFixed(2))}`;
const styling = `
  <style>
    /* Basic styling for the email */
    body {
      font-family: Arial, sans-serif;
      line-height: 1.5;
      margin: 0;
      padding: 0;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .button {
      display: inline-block;
      background-color: #007bff;
      color: #fff;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
    }
  </style>
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