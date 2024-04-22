const Badge = require('../models/badge')
// Create and send token and save in the cookie.
const sendToken = async (user, statusCode, res) => {

    // Create JWT cookie
    const token = user.getJwtToken();

    //Options for cookie
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    }

    let badge;

    if(user.role==='punter'){
        badge = await Badge.findOne({number: user.badge}).select('-_id -__v')
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        user,
        badge
    })
}

module.exports = sendToken;