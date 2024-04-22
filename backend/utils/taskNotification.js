const got = require('got')
const WhatAppTempId = require("../models/whatAppTempId");

exports.sendWhatsAppMessage = async (waId, workerId, task) =>{

  const whatsAppTempId = await WhatAppTempId.create({
    taskId:task.id, workerId, waId
  })
  
  const message = {
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": `${whatsAppTempId.waId}`,
    "type": "interactive",
    "interactive": {
        "type": "button",
        "header": {
            "type": "text",
            "text": `${task.header}`
        },
        "body": {
            "text": task.message.replace(/^[ \t]+/gm, '')
        },
        "footer": {
            "text": task.location
        },
        "action": {
            "buttons": [
                {
                    "type": "reply",
                    "reply": {
                        "id": `${whatsAppTempId._id}_1`,
                        "title": "Available"
                    }
                },
                {
                    "type": "reply",
                    "reply": {
                        "id": `${whatsAppTempId._id}_2`,
                        "title": "Unavailable"
                    }
                }
            ]
        }
    }
  }

  const options = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`
    },
    json: message,
    responseType: 'json'
  };

  try {
    const phoneNumberId = '114237478363942';
    await got.post(`https://graph.facebook.com/v12.0/${phoneNumberId}/messages`, options)
    
  } catch (error) {
    console.error("util taskNotification",error.message)
  }

  return whatsAppTempId;
}

exports.interactiveResponse = async (response, to) =>{
  let status;
  const payload = {
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": `${to}`,
    "type": "text",
    "text": {
        "body": response.message.replace(/^[ \t]+/gm, '')
    }
  }

  const options = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`
    },
    json: payload,
    responseType: 'json'
  };

  try {
    const phoneNumberId = '114237478363942';
    status = await got.post(`https://graph.facebook.com/v12.0/${phoneNumberId}/messages`, options)
    
  } catch (error) {
    console.error("util taskNotification",error.message)
  }

  return status;
}

exports.whatsAppMessage = async (message, to, context) =>{
  let status;
  const payload = {
    context,
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": `${to}`,
    "type": "text",
    "text": {
        "body": message.replace(/^[ \t]+/gm, '')
    }
  }
  
  const options = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`
    },
    json: payload,
    responseType: 'json'
  };

  try {
    const phoneNumberId = '114237478363942';
    status = await got.post(`https://graph.facebook.com/v12.0/${phoneNumberId}/messages`, options)
    
  } catch (error) {
    console.error("util taskNotification",error.message)
  }

  return status;
}

exports.sendWhatsAppContact = async (contact, to) =>{
  let status;
  const payload = {
    "to": `${to}`,
    "type": "contacts",
    "contacts": [
      {
        "addresses": [
            {
                "city": contact.lga,
                "country": "Nigeria",
                "country_code": "ng",
                "state": contact.state,
                "street": contact.town,
                "type": "HOME"
            }
        ],
        "emails": [
            {
                "email": contact.email,
                "type": "WORK"
            }
        ],
        "name": {
            "first_name": contact.firstName,
            "formatted_name": `${contact.firstName} ${contact.lastName}`,
            "last_name": contact.lastName
        },
        "phones": [
            {
                "phone": `+${contact.phoneNumber}`,
                "type": "WORK",
                "wa_id": contact.phoneNumber
            }
        ]
      }
    ]
}

  const options = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`
    },
    json: payload,
    responseType: 'json'
  };

  try {
    const phoneNumberId = '114237478363942';
    status = await got.post(`https://graph.facebook.com/v12.0/${phoneNumberId}/messages`, options)
    
  } catch (error) {
    console.error(error)
  }

  return status;
}
