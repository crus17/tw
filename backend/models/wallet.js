const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    walletId: {
        type: String,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance:{
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

walletSchema.pre('save', async function(){
    if(this.isNew){
        this.walletId = await this.constructor.generateNextWalletId();
    } 
})

walletSchema.statics.generateNextWalletId = async function () {
  const lastWallet = await this.findOne().sort({ walletId: -1 });
  return lastWallet? (parseInt(lastWallet.walletId) + 1).toString() : "700700700";
};

module.exports = mongoose.model('Wallet', walletSchema);