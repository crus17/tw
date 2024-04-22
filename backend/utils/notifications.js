const logger = require("../config/logger")
const User = require("../models/user")
const { projectSuccessNotificationEmailTemplatePunter, projectFailureNotificationEmailTemplatePunter, projectSuccessNotificationEmailTemplateUser, projectFailureNotificationEmailTemplateUser, projectNoEngagementNotificationEmailTemplateUser, projectNoEngagementNotificationEmailTemplatePunter } = require("./emailTemplates")
const sendEmail = require("./sendEmail")
const sendSMS = require("./sendSMS")

exports.ProjectCompletionNotification = async (details)=>{
    const formatAmount = value => `₦${new Intl.NumberFormat('en-US').format(parseFloat((value?value:0).toString().replace(/[^\d.]/g, '')).toFixed(2))}`;
    
    try {
        
        // console.log(details);
        const lostContribution = details.profit + details.contributedAmount <= 1
        const isRoi = details.profit > 0
        
        const successTextContributor = `Project ${details.projectId} completed! Your ROI of ${formatAmount(details.contributedAmount + details.profit)} has been credited. Check your wallet now!`
        const successTextPunter = `Project ${details.projectId} is done! Your earnings, ${formatAmount(details.commission)}, have been credited. View details in your wallet.`
        const failureTextContributor = `Project ${details.projectId} concluded with no profit. ${lostContribution?'':formatAmount(details.contributedAmount + details.profit)+' of your contribution has been returned.'} We appreciate your participation.`
        const failureTextPunter = `Project ${details.projectId} ended without profit. No commission is applicable. Thank you for your involvement.`
        
        const punterText = isRoi? successTextPunter:failureTextPunter
        const contributorText = isRoi? successTextContributor:failureTextContributor
    
        const punterEmailBody = isRoi? projectSuccessNotificationEmailTemplatePunter(details):projectFailureNotificationEmailTemplatePunter(details)
        const userEmailBody = isRoi? projectSuccessNotificationEmailTemplateUser(details):projectFailureNotificationEmailTemplateUser(details)
    
        const user = await User.findById(details.userId)
        console.log(`Sending notification to ${user.role} [${user.username}]`);
        if(user.role === 'punter'){
            if(user.phoneNumber && user.preferences.getNotifiedBy.sms){
                await sendSMS(punterText, `234${user.phoneNumber.slice(1)}`)
            }
    
            if(user.email && user.preferences.getNotifiedBy.email){
                // send email
                await sendEmail({
                    email: user.email,
                    subject: `Project Completion and Punter Commission Notification`,
                    message: punterEmailBody
                })
            }
        }
        else {
            if(user.phoneNumber && user.preferences.getNotifiedBy.sms){
                await sendSMS(contributorText, `234${user.phoneNumber.slice(1)}`)
            }
    
            if(user.email && user.preferences.getNotifiedBy.email){
                // send email
                await sendEmail({
                    email: user.email,
                    subject: `Project Completion Notification`,
                    message: userEmailBody
                })
            }
        }

        return

    } catch (error) {
        logger.error(error)
        console.log(error);
    }
}

exports.ProjectNoEngagementNotification = async (details)=>{
    const formatAmount = value => `₦${new Intl.NumberFormat('en-US').format(parseFloat((value?value:0).toString().replace(/[^\d.]/g, '')).toFixed(2))}`;
    
    try {
        
        const contributorText = `Project ${details.projectId} completed without loss/profit! Your contribution of ${formatAmount(details.contributedAmount)} has been credited. Check your wallet now!`
        const punterText = `Project ${details.projectId} ended without any engagement from you. No commission is applicable. Thank you for your involvement.`
        
        const punterEmailBody = projectNoEngagementNotificationEmailTemplatePunter(details)
        const userEmailBody = projectNoEngagementNotificationEmailTemplateUser(details)
    
        const user = await User.findById(details.userId)
        console.log(`Sending notification to ${user.role} [${user.username}]`);
        if(user.role === 'punter'){
            if(user.phoneNumber && user.preferences.getNotifiedBy.sms){
                await sendSMS(punterText, `234${user.phoneNumber.slice(1)}`)
            }
    
            if(user.email && user.preferences.getNotifiedBy.email){
                // send email
                await sendEmail({
                    email: user.email,
                    subject: `Project Completion Notification`,
                    message: punterEmailBody
                })
            }
        }
        else {
            if(user.phoneNumber && user.preferences.getNotifiedBy.sms){
                await sendSMS(contributorText, `234${user.phoneNumber.slice(1)}`)
            }
    
            if(user.email && user.preferences.getNotifiedBy.email){
                // send email
                await sendEmail({
                    email: user.email,
                    subject: `Project Completion Notification`,
                    message: userEmailBody
                })
            }
        }

        return

    } catch (error) {
        logger.error(error)
        console.log(error);
    }
}