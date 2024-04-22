const got = require("got");
const catchAsyncErrors = require("../midllewares/catchAsyncErrors");
const Task = require("../models/task");
const User = require("../models/user");
const WhatsAppTempId = require("../models/whatAppTempId");
const { debitWallet } = require("./paymentController");
const {
  sendWhatsAppMessage,
  interactiveResponse,
  whatsAppMessage,
  sendWhatsAppContact,
} = require("../utils/taskNotification");
const token = process.env.WHATSAPP_TOKEN;
// Accepts POST requests at /webhook endpoint

exports.whatsApp = catchAsyncErrors(async (req, res, next) => {
  // Parse the request body from the POST
  let body = req.body;

  // Check the Incoming webhook message
  // console.log(JSON.stringify(req.body, null, 2));

  // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  if (req.body.object) {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id =
        req.body.entry[0].changes[0].value.metadata.phone_number_id;
      let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
      let msg_body =
        req.body.entry[0].changes[0].value.messages[0].text?.body; // extract the message text from the webhook payload

      // Check if it is an interactive button reply
      const { type, interactive, context } =
        req.body.entry[0].changes[0].value.messages[0];

      if (interactive?.type === "button_reply") {
        try {
          const { id, title } = interactive.button_reply;
          // Get the whatsApp task
          const whatsAppTempId = await WhatsAppTempId.findById(
            id.split("_")[0]
          );

          if (whatsAppTempId) {
            // user has already supplied a response. Direct user to web platform
            // return from here

            const task = await Task.findById(whatsAppTempId.taskId)
              .populate({
                path: "workers.worker",
                select: "pricing",
                populate: {
                  path: "owner",
                  select: "firstName lastName phoneNumber",
                },
              })
              .populate({
                path: "location.lga",
                select: "name",
                populate: {
                  path: "state",
                  select: "name",
                },
              })
              .populate("user", "firstName lastName phoneNumber", User);


            let workerIndex = task.workers.findIndex((workersObj) =>
              workersObj.worker._id.equals(whatsAppTempId.workerId)
            );

            const debitWorker =
              task.workers[workerIndex].escrow.worker === "Pending" &&
              req.body.status === "Accepted";

            const platformCommission = task.budget
              ? parseFloat(task.budget * 0.1)
              : parseFloat(
                  task.workers[workerIndex].worker.pricing.minRate * 0.1
                );
            
            if (title.toLowerCase() === "available") {
              const debitStatus = await debitWallet(
                platformCommission,
                "Work request comm",
                task.workers[workerIndex].worker.owner._id
              );
              
              // Check if worker wallet balance has enough to debit commission
              if(debitStatus === "insufficient"){
                const insufficientBalance = `🚨 Insufficient Account Balance 🚨\n
                  ⚠️ Your account balance is currently insufficient to confirm your availability for the task.\n
                  💰 Please log into your dashboard on the web platform to fund your account. Once you have sufficient funds, you can try confirming your availability again.\n
                  Need assistance with adding funds or have questions? Our support team is here to help. Feel free to reach out to us for assistance.\n
                  Thank you.\n
                  Best regards,
                  The Ebiwoni Team`
                
                await whatsAppMessage(insufficientBalance, from);
              }else{
                
                  task.status = 'Accepted'
                  task.workers[workerIndex].escrow.worker = "Accepted";
                  // Respond back with the task requester's contact details

                  // send user contacts details
                  const response = {
                    title: `TASK OWNER`,
                    contact: `Alfred Ekeuwei\n contact: 08030572700\n`,
                    footer: "Edepie, Yenagoa",
                    message: "I want to deliver an item for me",
                  };
                  const simpleMessage =
                    `*TASK OWNER*\nnames: ${task.user.firstName} ${task.user.lastName} \ncontact: ${task.user.phoneNumber} \nlocation: ${task.location.town}, ${task.location.lga.name}, ${task.location.lga.state.name}`;

                  // Send the users contact;
                  await whatsAppMessage(simpleMessage, from, {message_id: context.id});

                  // const contact = {
                  //   lga: task.location.lga.name,
                  //   state: task.location.lga.state.name,
                  //   town: task.location.town,
                  //   email: 'user@gmail.com',
                  //   firstName: task.user.firstName,
                  //   lastName: task.user.lastName,
                  //   phoneNumber: task.user.phoneNumber,
                  // }
                  // await sendWhatsAppContact(contact, from)
                }
            } else {
              
              const messageWorker = `Thanks for informing us that you're unavailable for the task. We appreciate your prompt response.
                    \nWe've noted your unavailability and will make the necessary arrangements.
                    \nFeel free to reach out if you have any questions.
                    \nThank you.
                    \nThe Ebiwoni.com Team`
              
              const messageUser = `*Notice: Task Progress Update*\n
              Hello ${task.user.firstName},\n
              The initially assigned worker for the ${task.title} job is currently unavailable.\n
              We've opened up job applications on our platform, and suitable workers have been notified to apply.\n
              You'll receive the applications shortly. Please review them and choose the best candidate for the job.\n
              Let us know if you have any questions. Thanks!\n
              Best regards,
              The Ebiwoni.com Team`

              const taskOwnerWaId = `234${task.user.phoneNumber.slice(-10)}`
              
              // Respond to the worker and acknowledge their unavailability
              await whatsAppMessage(messageWorker, from, {message_id: context.id});
              
              // Notify task work owner that the worker is not available to perform the task
              await whatsAppMessage(messageUser, taskOwnerWaId);
              
              task.workers = task.workers.filter(workerObj => workerObj.worker._id !== task.workers[workerIndex].worker._id)
              task.status = "Request"
            }
            
            await task.save();
            
            // Delete the whatsApp Temporal Id
            await WhatsAppTempId.findByIdAndDelete(whatsAppTempId._id);
          }
          else { //The WhatsAppTempId is not found or deleted
              // Correspond to the user that 
              const previouselyResponded = `Thank you for your interaction. We have already responded to your previous request.\n
              Explore the web platform for more options and seamless task management.\n
              Thank you.`
              await whatsAppMessage(previouselyResponded, from);
          }

        } catch (error) {
          console.log(error);
        }
      }
      
      if(msg_body){
        
        got.post(
          `https://graph.facebook.com/v12.0/${phone_number_id}/messages?access_token=${token}`,
          {
            json: {
              messaging_product: "whatsapp",
              to: from,
              text: { body: "Ack: " + msg_body },
            },
            responseType: "json",
          }
        );
      }
      
    }
    res.sendStatus(200);
  } else {
    // Return a '404 Not Found' if event is not from a WhatsApp API
    res.sendStatus(404);
  }
});

exports.whatsAppVerify = (req, res) => {
  /**
   * UPDATE YOUR VERIFY TOKEN
   *This will be the Verify Token value when you set up webhook
   **/
  const verify_token = process.env.VERIFY_TOKEN;

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === verify_token) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
};

const interactiveReply = {
  object: "whatsapp_business_account",
  entry: [
    {
      id: "106336799163414",
      changes: [
        {
          value: {
            messaging_product: "whatsapp",
            metadata: {
              display_phone_number: "15550690648",
              phone_number_id: "114237478363942",
            },
            contacts: [
              {
                profile: {
                  name: "Alfred Ekeuwei",
                },
                wa_id: "2348030572700",
              },
            ],
            messages: [
              {
                context: {
                  from: "15550690648",
                  id: "wamid.HBgNMjM0ODAzMDU3MjcwMBUCABEYEjBCQ0FDMkVGQUVGMjJBRTJERAA=",
                },
                from: "2348030572700",
                id: "wamid.HBgNMjM0ODAzMDU3MjcwMBUCABIYIEIzQ0FGRkJGQTBCQkI1Q0FGODkyMEUzM0JDOTk4MEFDAA==",
                timestamp: "1687363362",
                type: "interactive",
                interactive: {
                  type: "button_reply",
                  button_reply: {
                    id: "6491e024c9576e6bf986ad81+1",
                    title: "Yes",
                  },
                },
              },
            ],
          },
          field: "messages",
        },
      ],
    },
  ],
};
