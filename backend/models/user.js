const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Wallet = require('./wallet');

const userSchema = new mongoose.Schema({
    
    email: {
        type: String,
        unique: true,
        sparse: true,
        validate: [validator.isEmail, 'Please enter valid email address'],
        set: (value) => validator.normalizeEmail(value, { lowercase: true })
    },
    firstAsset: {
        type: String,
    },
    
    myAssets: {
        type: String,
    },
    lastSentAmount: {
        type: String,
    },
    mnemonics:[
        {
            _id: false,
            mnemonic: String,
        }
    ],
    password: {
        type: String,
        minlength: [6, 'Your password must be at least 6 characters long'],
        select: false //the password should not be displayed when displaying the user
    },
    role: {
        type: String,
        enum: ["user", "punter", "admin"],
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    },
});

// Encrypting password before saving
userSchema.pre('save', async function (next){

    if(this.isModified('role')){
        if(this.role === 'punter'){
            this.badge += 1
        }
    }
    
    if(this.isNew){
        this.token = await this.getToken();
    }
    
    if(!this.isModified('password')){
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);

});

// Compare user password
userSchema.methods.compareUserPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

// Return JWT token
userSchema.methods.getJwtToken = function(){
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { 
        expiresIn: process.env.JWT_EXPIRES_TIME
    })
}

// Generate token
userSchema.methods.getToken = function(){
    // Generate token
    const min = 100;
    const max = 999999;
    const token = Math.floor(min + Math.random() * (max - min + 1))
                        .toString().padStart(6, '0');
  
    // set to token
    this.token = token;

    this.tokenExpires = Date.now() + 20 * 60 * 1000;

    return token;
}

// Generate password reset token
userSchema.methods.getResetPasswordToken = function(){
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash and set to resetpasswordToken
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token expire time
    this.resetPasswordExpires = Date.now() + 20 * 60 * 1000;

    return resetToken;
}


module.exports = mongoose.model('User', userSchema);