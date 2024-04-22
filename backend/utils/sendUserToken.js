const validator = require('validator');
const { activationEmailTemplate } = require('./emailTemplates');
const sendSMS = require('./sendSMS');
const sendEmail = require('./sendEmail');

const sendUserToken = async (token, senderId, type)=>{
    
    const validEmail = validator.isEmail(senderId)

    if(validEmail){
        
        // Send activation email or SMS
        const message = activationEmailTemplate(token, type)
    
        try {
    
            await sendEmail({
                email: senderId,
                subject: `${process.env.APP_NAME} ${type}`,
                message
            });
    
        } catch (error) {
    
            throw new Error(error.message)
        }
    }
    else {
        // Send activation SMS
        // const text = `For ${type.toLowerCase()}, please use the following code:${token}. This code would expire after 20 minutes`
        const text = `Your six digit authentication pin:${token}. Expires after 20 minutes.`
        sendSMS(text, `234${senderId.slice(-10)}`)
    }
}

module.exports = sendUserToken;