const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const agentSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true,
        maxlength: [20, "Your name cannot exceed 20 characters"]
    },
    lastName:{
        type: String,
        required: true,
        maxlength: [20, "Your name cannot exceed 20 characters"]
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [validator.isEmail, "Please enter valide email address"],
    },
    phoneNumber: {
        type: Number,
        required: true,
        minlength: [10, "Phone number not complete"],
    },
    gender: {
        type: String,
        required: true,
    },
    contact: {
        address: {
            type: String,
            required: true,
        },
        town: {
            type: String,
            required: true,
        },
        lga: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
    },
    password: {
        type: String,
        required: true,
        minlength: [6, "Your password must be at least 6 characters long"],
        select: false, //the password should not be displayed when displaying the artisan
    },
    avatar: {
        public_id: String,
        url: String
    },
    isActivated: {
        type: Boolean,
        select: false,
        default: false
    },
    activationToken:{
        type: String,
        select: false
    },
    walletId:{
        type: mongoose.Schema.Types.ObjectId
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    agentId:{
        type: String
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date    
})

// Encrypting password before saving
agentSchema.pre('save', async function (next){
    
    if(this.isNew){
        this.agentId = await this.constructor.generateNextAgentId();
    }
    
    if(!this.isModified('password')){
        next();
    }


    this.password = await bcrypt.hash(this.password, 10);

});

// Compare user password
agentSchema.methods.compareAgentPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

// Return JWT token
agentSchema.methods.getJwtToken = function(){
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { 
        expiresIn: process.env.JWT_EXPIRES_TIME
    })
}

// Generate activation token
agentSchema.methods.getActivationToken = function(){
    // Generate token
    const activationToken = crypto.randomBytes(20).toString('hex');

    // set to activationToken
    this.activationToken = activationToken;

    return activationToken;
}

// Generate password reset token
agentSchema.methods.getResetPasswordToken = function(){
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash and set to resetpasswordToken
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token expire time
    this.resetPasswordExpires = Date.now() + 30 * 60 * 1000;

    return resetToken;
}

agentSchema.statics.generateNextAgentId = async function () {
  const lastAgent = await this.findOne().sort({ agentId: -1 });
  return lastAgent && !isNaN(lastAgent.agentId)? (parseInt(lastAgent.agentId) + 1).toString() : "1000";
};

module.exports = mongoose.model('Agent', agentSchema);