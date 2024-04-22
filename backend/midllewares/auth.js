// Check if user is authenticated or not

const jwt  = require("jsonwebtoken");
const User = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");

exports.isAuthenticatedUser = catchAsyncErrors( async (req, res, next)=>{

    const { token } = req.cookies;

    if(!token){
        return next(new ErrorHandler('Login first to access the resource', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id)

    /*if(!req.user){
        
        res.cookie('token', null, {
            expires: new Date(Date.now()),
            httpOnly: true
        })

        res.redirect('/login')
        // return next(new ErrorHandler('Login first to access the resource', 401));
    }*/
    
    next();

});

exports.isAuthenticatedAgent = catchAsyncErrors( async (req, res, next)=>{

    const { token } = req.cookies;

    if(!token){
        return next(new ErrorHandler('Login first to access the resource', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.agent = await Agent.findById(decoded.id)
                .populate({path: 'contact.town', select: 'name lga state', populate:{path: 'lga state', select: 'name sn'}})

    if(!req.agent){
        
        res.cookie('token', null, {
            expires: new Date(Date.now()),
            httpOnly: true
        })

        res.redirect('/agent/login')
        // return next(new ErrorHandler('Login first to access the resource', 401));
    }
    
    next();

});

// Handling user roles
exports.authorizeRoles = (...roles) => { // Spread the routes ...
    return (req, res, next)=>{
        if(!roles.includes(req.user.role)){
            return next(
                    new ErrorHandler(`Role (${req.user.role}) is not allowed to access this resources`, 403)
                )
        }

        next();
    }
}