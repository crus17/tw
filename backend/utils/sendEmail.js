const nodemailer = require('nodemailer');
const logger = require('../config/logger');

const sendEmail = async options => {

    const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD
        }
    });

    const message = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.message
    }

    try {
        await transport.sendMail(message);
        console.log('Email sent successfully.');
    } catch (error) {
        console.error('Failed to send email:', error.message);
        logger.error(error)
    }
}

module.exports = sendEmail;