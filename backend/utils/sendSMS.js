const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const request = require('request');

const sendSMS__ = async (message, to)=>{
    const client = require('twilio')(accountSid, authToken);
    let status;
    const from = process.env.SMS_SENDER_ID
    try {
        status = await client.messages.create({body: message, from, to});
        console.log('SMS sent: ',status.sid);
    } catch (error) {
        console.error(error.message)
    }

    return status;
}

const sendSMS = async (message, to)=>{
    
    var data = JSON.stringify({
        to,
        "from": process.env.SMS_SENDER_ID,
        "sms": message,
        "type": "plain",
        "api_key": process.env.TERMII_API_KEY,
        "channel": "generic",
    });

    var options = {
        'method': "POST",
        'url': 'https://api.ng.termii.com/api/sms/send',
        'headers': {
        'Content-Type': ['application/json', 'application/json']
        },
        body: data
    };

  
    request(options, function (error, response) { 
        
        if (error){
            console.error(error.message);
        }else{
            const {message_id} = JSON.parse(response.body)
            console.log('SMS sent: message_id-> ', JSON.parse(response.body));
        }
    });

}


module.exports = sendSMS;