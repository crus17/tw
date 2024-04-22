const mongoose = require('mongoose');

const cashoutSchema = new mongoose.Schema({
    uniqueId: {
        type: String,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    amount: {
        type: String,
        required: true
    },
    bankName: {
        type: String,
        required: true
    },
    bankCode: {
        type: String,
        required: true
    },
    accountName: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'declined'],
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

cashoutSchema.pre('save', async function(){
    if (!this.uniqueId) {
        this.uniqueId = await this.constructor.generateNextId();
    }
    if(this.amount && typeof this.amount==='string'){
        this.amount = parseFloat(this.amount.replace(/[^\d.]/g, ''))
    }
})

cashoutSchema.statics.generateNextId = async function () {
  const lastTicket = await this.findOne().sort({ uniqueId: -1 });
  return lastTicket? (parseInt(lastTicket.uniqueId) + 1).toString() : "01";
};
module.exports = mongoose.model('Cashout', cashoutSchema);