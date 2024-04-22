const User = require('../models/user');
const got = require('got');

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../midllewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const validator = require('validator');

const crypto = require('crypto');
const cloudinary = require('cloudinary');
const Wallet = require('../models/wallet');
const sendSMS = require('../utils/sendSMS');
const sendUserToken = require('../utils/sendUserToken');
const Badge = require('../models/badge');
 
// Register a user => /api/v1/auth/validate
exports.validateUser = catchAsyncErrors( async (req, res, next)=>{

    const { loginId } = req.query;

    // check if loginId is phone number or email
    const phoneRegex = /^(\+[0-9]{1,3})?(\s?[0-9]){10,14}[0-9]$/;
    const validPhoneNumber = phoneRegex.test(loginId)
    const validEmail = validator.isEmail(loginId)

    let user;

    try {
        if(validEmail){

            user = await User.findOne({ email: req.query.loginId }).select('+isActivated +token')

            if(!user){

                user = await User.create({
                    email: loginId
                })
            }
            else if(user.isActivated){
                return next(new ErrorHandler("Already has account! Please login to continue.", 404))
            }
            else{
                user.getToken()
                await user.save();
            }

        }
        else if(validPhoneNumber){

            user = await User.findOne({ phoneNumber: req.query.loginId.slice(-10) }).select('+isActivated +token')
                
            if(!user){
                user = await User.create({
                    phoneNumber: loginId.slice(-10)
                })
            }
            else if(user.isActivated){
                return next(new ErrorHandler("Already has account! Please login to continue.", 404))
            }
            else{
                user.getToken()
                await user.save();
            }


        }else{
            return next(new ErrorHandler('Please enter a valid email or phone number', 500));
        }
        
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }

    const token = user.token;

    try {
        const type = 'User Validation'
        await sendUserToken(token, loginId, type)

    } catch (error) {
        
        return next(new ErrorHandler(error.message, 500))
        
    }

    res.status(200).json({
        success: true,
        tokenExpires: user.tokenExpires,
        message: `We've just sent a 6-digit code to your ${validEmail?'email':'phone number'}.`
    })
})

// Validate token => /api/v1/auth/validatetoken
exports.validateToken = catchAsyncErrors( async (req, res, next)=>{
    let user;

    const { loginId, token } = req.body;
    
    const validEmail = validator.isEmail(loginId)
    const phoneRegex = /^(\+[0-9]{1,3})?(\s?[0-9]){10,14}[0-9]$/;
    const validPhoneNumber = phoneRegex.test(loginId)

    try {

        if(validEmail){

            user = await User.findOne({ email: loginId }).select('+token')
            
        }else if(validPhoneNumber){

            user = await User.findOne({ phoneNumber: loginId.slice(-10) }).select('+token')

        }else{
            
            return next(new ErrorHandler("Invalid email or phone number", 404))
        }

        if(!user){
            return next(new ErrorHandler("Not a valid user", 404))
        }

        const validToken = user.token!==undefined && user.token === token;
        
        const tokenExpired = user.tokenExpires < new Date()

        if(!validToken){
            return next(new ErrorHandler('Invalid token!', 500))
        }

        if(tokenExpired){
            return next(new ErrorHandler('Token expired! Resend activation token', 500))
        }

    
    } catch (error) {
        return next(new ErrorHandler(error.message, 500))
    }

    res.status(200).json({
        success: true,
        isValidToken: true,
        message: `Token validated.`
    })
})


// Register a user => /api/v1/register
exports.registerUser = catchAsyncErrors( async (req, res, next) =>{

    const { loginId, password, username, token, referralId } = req.body;

    const validEmail = validator.isEmail(loginId)
    const phoneRegex = /^(\+[0-9]{1,3})?(\s?[0-9]){10,14}[0-9]$/;
    const validPhoneNumber = phoneRegex.test(loginId)
    
    let user;

    try {

        if(validEmail){
            
            user = await User.findOne({ email: loginId }).select('+isActivated +password +token')
            
        }else if(validPhoneNumber){

            user = await User.findOne({ phoneNumber: loginId.slice(-10) }).select('+isActivated +password +token')

        }else{

            return next(new ErrorHandler('Invalid email or phone number', 401))
        }

        if(user.isActivated){
            return next(new ErrorHandler('Account already created! Login to continue.', 401))
        }

        const tokenExpired = user.tokenExpires < new Date();
        user.isActivated = !tokenExpired && user.token!=undefined && user.token === token
        
        if(!user.isActivated){
            return next(new ErrorHandler('Token expired or account not validated! Revalidate account', 500))
        }
        
        if(!user.walletId){
            const wallet = await Wallet.create({ userId: user._id })
            user.walletId = wallet._id;
        }

        user.username = username?username:undefined
        user.password = password
        user.token = undefined
        user.tokenExpires = undefined

        user = await user.save({ validateStateBeforeSave: false });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }

    sendToken(user, 200, res);

})

// Register a punter => /api/v1/register/punter
exports.registerPunter = catchAsyncErrors( async (req, res, next) =>{

    const { email, password, username, token, bio, referralId } = req.body;

    const validEmail = validator.isEmail(email)
    
    let user;

    try {

        if(validEmail){
            
            user = await User.findOne({ email }).select('+isActivated +password +token')
            
        }else{

            return next(new ErrorHandler('Invalid email or phone number', 401))
        }

        if(user.password){
            return next(new ErrorHandler('Account already created! Login to continue.', 401))
        }

        const tokenExpired = user.tokenExpires < new Date();
        user.isActivated = !tokenExpired && user.token!=undefined && user.token === token
        
        if(!user.isActivated){
            return next(new ErrorHandler('Token expired or account not validated! Revalidate account', 500))
        }
        
        if(!user.walletId){
            const wallet = await Wallet.create({ userId: user._id })
            user.walletId = wallet._id;
        }

        user.username = username
        user.password = password
        user.bio = bio
        user.role = 'punter'
        user.token = undefined
        user.tokenExpires = undefined

        user = await user.save({ validateStateBeforeSave: false });

        // Send a welcome message to punter

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }

    sendToken(user, 200, res);

})

// Login user => /api/v1/login
exports.loginUser = catchAsyncErrors( async (req, res, next)=>{
    const { loginId, password } = req.body;

    const validEmail = validator.isEmail(loginId)

    // Check if email is entered by user
    if(!(loginId || password)){
        return next(new ErrorHandler(`Invalid ${validEmail?'Email':'Phone Number'} or Password`, 400))
    }

    // Finding user in database
    let user;

    if(validEmail){
        user = await User.findOne({ email: loginId, password: { $exists: true, $ne: ''} }).select('+password +isActivated');
    }
    else{
        user = await User.findOne({ phoneNumber: loginId.slice(-10), password: { $exists: true, $ne: ''} }).select('+password +isActivated');
    }

    if(!user){
        return next(new ErrorHandler(`Invalid ${validEmail?'email':'phone number'} or password`, 401))
    }

    // Check if password is correct or not
    const isPasswordMatched = await user.compareUserPassword(password);
    
    if(!isPasswordMatched){
        return next(new ErrorHandler(`Invalid ${validEmail?'Email':'Phone Number'} or Password`, 401))
    }
    
    if(!user.isActivated){

        res.status(401).json({
            isActivated: false,
            message: 'Please activate your account and try again'
        })

    }else{

        sendToken(user, 200, res);
    }

});

// Keep page alive => /api/v1/alive
exports.keepAlive = catchAsyncErrors(async (req, res, next)=>{
    res.status(200).json({
        success: true,
        message: "We're live :-)"
    })
})

// Reset password => /api/v1/auth/requesttoken
exports.requestToken = catchAsyncErrors( async (req, res, next) => {

    const validEmail = validator.isEmail(req.query.loginId)

    let user;// = await User.findOne( { email: req.query.email });

    if(validEmail){
        user = await User.findOne({ email: req.query.loginId })
    }
    else{
        user = await User.findOne({ phoneNumber: req.query.loginId.slice(-10) })
    }

    if(!user){
        return next(new ErrorHandler(`User not found with this ${validEmail?'email':'number'}`, 404));
    }

    // Set up new password
    const token = user.getToken();
    await user.save({ validateStateBeforeSave: false });

    // Send email or SMS
    try {
        // For ${type}
        const type = "Account Validation"
        await sendUserToken(token, req.query.loginId, type)

    } catch (error) {
        
        next(new ErrorHandler(error.message, 500))

    }

    res.status(200).json({
        success: true,
        tokenExpires: user.tokenExpires,
        message: `A verification ${validEmail?'email':'sms'} has been sent.`
    });

});

// Update / change password => /api/v1/password/update
exports.updatePassword = catchAsyncErrors( async (req, res, next) => {
    
    const user = await User.findById(req.user.id).select('+password');

    // Check previous user password

    const isPasswordMatched = await user.compareUserPassword(req.body.oldPassword);

    if(!isPasswordMatched){
        return next(new ErrorHandler('Old pasword is incorect', 400));
    }

    user.password = req.body.password;
    await user.save();

    sendToken(user, 200, res);
});

// Forgot Password => /api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors( async (req, res, next) => {

    const { loginId } = req.query;

    let user;// = await User.findOne({ email: req.body.email });

    const validEmail = validator.isEmail(loginId)

    if(validEmail){
        user = await User.findOne({ email: loginId });
    }
    else{
        user = await User.findOne({ phoneNumber: loginId.slice(-10) });
    }

    if(!user){
        return next(new ErrorHandler(`User not found with this ${validEmail?'email':'phone number'}`, 404))
    }

    // Get reset token 
    const token = user.getToken();

    await user.save( { validateStateBeforeSave: false });

    // Send email or SMS
    try {
        // For ${type}
        const type = 'Password Reset'
        await sendUserToken(token, loginId, type)

    } catch (error) {
        
        return next(new ErrorHandler(error.message, 500))

    }

    res.status(200).json({
        success: true,
        tokenExpires: user.tokenExpires,
        message: `We've just sent a 6-digit code to your registered ${validEmail?'email':'phone number'}.`
    });

});

// Reset password => /api/v1/password
exports.resetPassword = catchAsyncErrors( async (req, res, next) => {

    const { loginId, token, password } = req.body

    const validEmail = validator.isEmail(loginId)

    let user;

    if(validEmail){
        user = await User.findOne({ email: loginId }).select('+token');
    }
    else{
        user = await User.findOne({ phoneNumber: loginId.slice(-10) }).select('+token');
    }
    
    const isResetToken = user.token!==undefined && user?.token === token
    const tokenExpired = user?.tokenExpires < new Date()
    
    if(!isResetToken || tokenExpired){
        return next(new ErrorHandler('Password reset token is invalid or has expired', 400));
    }
    
    // Set up new password
    user.password = password;
    user.token = undefined;
    user.tokenExpires = undefined;
    
    await user.save();

    res.status(200).json({
       success: true,
       message: "Password reset successful! Proceed to login."
    })
    //  sendToken(user, 200, res);

});


// Get currently logged in user details => /api/v1/me
exports.getUserProfile = catchAsyncErrors( async (req, res, next) => {
    const user = req.user;
    let badge;

    if(req.user.role==='punter'){
        badge = await Badge.findOne({number: req.user.badge}).select('-_id -__v')
    }

    res.status(200).json({
        success: true,
        user,
        badge
    });
});

exports.changeMode = catchAsyncErrors(async(req, res, next) => {
    
    const user = req.user;

    if(user.role !== 'worker'){
        return next(new ErrorHandler('Not Allowed', 403))
    }
    
    user.userMode = !user.userMode;

    await user.save()

    res.status(200).json({
        success: true,
        message: 'Mode changed',
        user,
    })
})

// Update user profile  => /api/v1/me/update
exports.updateProfile = catchAsyncErrors( async (req, res, next) => {
    const newUserData = req.body

    delete newUserData.bankAccounts

    const { firstName, otherNames } = req.body;
    if(firstName || otherNames){
        // User wants to update names
        if(req.user.bankAccounts.length > 0){
            // User has added account details 
            // names update not permitted when user has updated account details
            return next(new ErrorHandler('Contact admin for names update', 500))
        }
    }

    if(newUserData.email || newUserData.phoneNumber){
        // Delete any uncompleted registration 
        await User.findOneAndDelete({
            $or:[
                {$and:[{email:newUserData.email},{$or:[{password:{$exists:false}},{password:''}]}]},
                {$and:[{phoneNumber:newUserData.phoneNumber},{$or:[{password:{$exists:false}},{password:''}]}]}
            ]
        })
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        user
    });
});

// Logout user => /app/v1/logout
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

// BVN Details user => /app/v1/bvn/validate
exports.getBvnDetails = catchAsyncErrors( async (req, res, next)=>{
    
    const url = `https://nibloansapi.azurewebsites.net/api/v1/bvnvalidationsimple/`;
    
    let bvnDetails;
    try {
        bvnDetails = await got.post(url, {
                
                json: {
                    bvn: req.query.bvn,
                },
            }).json();
        
    } catch (error) {
        return next(new ErrorHandler('Error fetching BVN details'))
    } 
    
    if(!bvnDetails.gender){
        return next(new ErrorHandler('BVN not valid'))
    }

    res.status(200).json({
        success: true,
        bvnDetails
    })
});


// Admin Routes

// Get all users => /api/v1/users
exports.allUsers = catchAsyncErrors( async (req, res, next) => {
    const users = await User.find().sort({createdAt: -1});

    res.status(200).json({
        success: true,
        users
    });
});

// Get user details => /api/v1/admin/user/:id
exports.getUserDetails = catchAsyncErrors( async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User does not found with id: ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        user
    });

});

// Update user profile  => /api/v1/admin/user/:id
exports.updateUser = catchAsyncErrors( async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true
    });
});

// Delete user => /api/v1/admin/user/:id
exports.deleteUser = catchAsyncErrors( async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User does not found with id: ${req.params.id}`, 404));
    }

    // Remove avatar from cloudinary server
    const image_id = user.avatar.public_id
    await cloudinary.v2.uploader.destroy(image_id)

    await user.remove();

    res.status(200).json({
        success: true,
        user
    });

});