const crypto = require('crypto');
const cloudinary = require('cloudinary');

const Agent = require('../models/agent');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../midllewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const Wallet = require('../models/wallet');
const { 
    activationEmailTemplate, 
    activationEmailTemplate2, 
    passwordResetTemplate 
} = require('../utils/emailTemplates');
 
// Register a user => /api/v1/agent/register
exports.registerAgent = catchAsyncErrors( async (req, res, next) =>{

    let activationToken;
    let avatarUpload;
    let agent;

    const { firstName, lastName, phoneNumber, gender, email, password, avatar, contact } = req.body;
    
    if(avatar){
        avatarUpload = await cloudinary.v2.uploader.upload(avatar, {
            folder: 'avatars',
            width: 600,
            crop: 'scale'
        })
    }

    try {
        agent = await Agent.create({
            firstName,
            lastName,
            phoneNumber,
            gender,
            email,
            password,
            avatar: {
                public_id: avatarUpload?.public_id,
                url: avatarUpload?.secure_url
            },
            contact
        });

        const wallet = await Wallet.create({
            userId: agent._id
        })

        agent.walletId = wallet._id;
        
        activationToken = agent.getActivationToken();

        agent = await agent.save({ validateStateBeforeSave: false });

    } catch (error) {
        await cloudinary.v2.uploader.destroy(avatarUpload?.public_id); // Delete uploaded image
        return next(new ErrorHandler(error.message, 500));
    }

    // Create activation url
    const activationUrl = `${process.env.FRONTEND_URL}/activate/agent?token=${activationToken}`

    // const message = `Please click on the following link to activate your account:\n\n${activationUrl}\n\nPlease ignore this message if you did authorize the requested.`
    const message = activationEmailTemplate(activationUrl, agent.firstName)

    try {

        await sendEmail({
            email: agent.email,
            subject: `${process.env.APP_NAME} Account Activation`,
            message
        });

    } catch (error) {

        next(new ErrorHandler(error.message), 500)
    }

    // TODO: reqeust newly registered agent to activate their account.
    res.status(200).json({
        success: true,
        message: `We have sent a confirmation email to your email address. Please follow the instructions in the confirmation email in order to activate your account.`
    })
    // sendToken(user, 200, res);

})

// Login agent => /api/v1/agent/login
exports.loginAgent = catchAsyncErrors( async (req, res, next)=>{
    const { email, password } = req.body;

    // Check if email is entered by agent
    if(!(email || password)){
        return next(new ErrorHandler('Please enter email & password', 400))
    }

    // Finding agent in database
    const agent = await Agent.findOne({ email })
                .populate({path: 'contact.town', select: 'name lga state', populate:{path: 'lga state', select: 'name sn'}})
                .select('+password +isActivated');

    if(!agent){
        return next(new ErrorHandler('Invalid Email or Password', 401))
    }

    // Check if password is correct or not
    const isPasswordMatched = await agent.compareAgentPassword(password);
    
    if(!isPasswordMatched){
        return next(new ErrorHandler('Invalid Email or Password', 401))
    }
    
    if(!agent.isActivated){

        res.status(401).json({
            isActivated: false,
            message: 'Please activate your account and try again'
        })

    }else{

        sendToken(agent, 200, res);
    }

});

// Reset password => /api/v1/activate/agent
exports.resendActivationToken = catchAsyncErrors( async (req, res, next) => {

    const agent = await Agent.findOne( { email: req.query.email });

    if(!agent){
        return next(new ErrorHandler('User not found with this email', 404));
    }

    // Set up new password
    const activationToken = agent.getActivationToken();
    await agent.save({ validateStateBeforeSave: false });

    // Create activation url
    const activationUrl = `${process.env.FRONTEND_URL}/activate?token=${activationToken}`

    // const message = `Please click on the following link to activate your account:\n\n${activationUrl}\n\nPlease ignore this message if you did authorize the requested.`
    const message = activationEmailTemplate2(activationUrl, agent.firstName)

    try {

        await sendEmail({
            email: agent.email,
            subject: `${process.env.APP_NAME} Account Activation`,
            message
        });

        res.status(200).json({
            success: true,
            message: `Activation link sent`
        });

    } catch (error) {
        agent.activationToken = undefined;
        await agent.save({ validateStateBeforeSave: false });
        next(new ErrorHandler(error.message), 500)
    }

});

// Activate agent account => /api/v1/activate/:token
exports.activateAgent = catchAsyncErrors( async (req, res, next) => {

    const agent = await Agent.findOne({ activationToken: req.params.token });

    if(!agent){
        return next(new ErrorHandler('Invalid activation token', 400));
    }

    // Set up new password
    agent.isActivated = true;
    agent.activationToken = undefined;

    await agent.save();

    res.status(200).json({
        success: true,
        title: "Account activation successful",
        message: `Congratulations! Your account has been successfully verified and activated. You can now fully access and enjoy all the features and services provided by ${process.env.APP_NAME}.`
    })

});

// Forgot Password => /api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors( async (req, res, next) => {
    const agent = await User.findOne({ email: req.body.email });

    if(!agent){
        return next(new ErrorHandler('User not found with this email', 404))
    }

    // Get reset token 
    const resetToken = agent.getResetPasswordToken();

    await agent.save( { validateStateBeforeSave: false });

    // Create reset password url
    const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}` 
    // const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}` // Development

    // const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nPlease ignore this message if you did authorize the requested.`
    const message = passwordResetTemplate(resetUrl, agent.email, agent.firstName)

    try {

        await sendEmail({
            email: agent.email,
            subject: `${process.env.APP_NAME} Password Recovery`,
            message
        });

        res.status(200).json({
            success: true,
            message: `email sent to: ${agent.email}`
        });

    } catch (error) {
        agent.resetPasswordToken = undefined;
        agent.resetPasswordExpires = undefined;

        await agent.save( { validateStateBeforeSave: false } );

        next(new ErrorHandler(error.message), 500)
    }

});

// Update / change password => /api/v1/agent/password/update
exports.updatePassword = catchAsyncErrors( async (req, res, next) => {
    const agent = await Agent.findById(req.agent.id).select('+password');

    // Check previous agent password

    const isPasswordMatched = await agent.compareUserPassword(req.body.oldPassword);

    if(!isPasswordMatched){
        return next(new ErrorHandler('Old pasword is incorect', 400));
    }

    agent.password = req.body.password;
    await agent.save();

    sendToken(agent, 200, res);
});

// Reset password => /api/v1/password/:token
exports.resetPassword = catchAsyncErrors( async (req, res, next) => {

    // Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    

    const agent = await Agent.findOne( { 
        resetPasswordToken,
        resetPasswordExpires: { $gt: Date.now() }
     });

     if(!agent){
         return next(new ErrorHandler('Password reset token is invalide or has expired', 400));
     }

     if(req.body.password !== req.body.confirmPassword){
         return next(new ErrorHandler('Password does not match', 400));
     }

     // Set up new password
     agent.password = req.body.password;
     agent.resetPasswordToken = undefined;
     agent.resetPasswordExpires = undefined;

     await agent.save();

     sendToken(agent, 200, res);

});

// Get currently logged in user details => /api/v1/agent/me
exports.getAgentProfile = catchAsyncErrors( async (req, res, next) => {
    const agent = req.agent;

    res.status(200).json({
        success: true,
        agent
    });
});

// Logout user => /app/v1/agent/logout
exports.logout = catchAsyncErrors( async (req, res, next)=>{
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: 'Logged out'
    })
});