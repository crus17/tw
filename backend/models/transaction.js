const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    title: String,
    reference: {
        type: String,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    walletId: {
        type: String,
        required: true
    },
    amount: { 
        type: Number, 
        required: true 
    },
    type:{
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'successful', 'failed'],
        default: 'pending'
    },
    balanceBefore: {
        type: Number,
        select: false
    },
    balanceAfter: {
        type: Number,
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

transactionSchema.pre('save', async function(){
    if (!this.reference) {
        this.reference = await this.constructor.reference();
    }
})

transactionSchema.statics.reference = async function(){
    let reference = '';
    for (let i = 0; i < 30; i++) {
        reference += Math.floor(Math.random() * 10).toString();
    }
    const exists = await this.findOne({ reference: reference });
    if (exists) {
        return await this.constructor.reference();
    }
    return reference;
}

module.exports = mongoose.model('Transaction', transactionSchema);