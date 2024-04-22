const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: String,
    uniqueId: {
        type: String,
        unique: true
    },
    punter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String,
    },
    minOdds: { 
        type: Number, 
        min: [1.3, 'Minimum odd must be at least 1.30']
    },
    maxOdds: { 
        type: Number, 
    },
    minContribution: { 
        type: Number, 
        default: 1000,
        min: [1000, 'Minimum contribution amount is NGN 1,000']
    },
    eRoi: { 
        type: Number, 
        required: true 
    },
    riskFreeContribution: { 
        type: Boolean, 
        default: false
    },
    progressiveStaking: { 
        type: Boolean, 
        default: false 
    },
    progressiveSteps: { 
        type: Number,
        default: 0
    },
    availableBalance: { 
        type: Number, 
        default: 0
    },
    stats:{
        lossStreakCount:{
            type: Number,
            default: 0
        },
        highestBalance:{
            type: Number,
            default: 0
        }
    },
    roi: {
        type: Number,
    },
    contributors: [
        {
            user: { 
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            amount: {
                type: Number,
                required: true,
                min: [1000, 'Minimum amount you can contribute is NGN 1,000']
            },
            riskFreeContribution: {
                type: Number,
                default: false
            },
            status: {
                type: String,
                enum: ['pending', 'settled'],
                default: 'pending'
            }
        }
    ],
    status: {
        type: String,
        enum: ['pending', 'in progress', 'successful', 'failed', 'no engagement'],
        default: 'pending'
    },
    punterSettlement: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending',
        select: false
    },
    balanceBefore: {
        type: Number,
    },
    balanceAfter: {
        type: Number,
    },
    startAt:{
        type: Date,
    },
    endAt:{
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

projectSchema.pre('save', async function(){
    if (!this.uniqueId) {
        this.uniqueId = await this.constructor.generateNextId();
    }

    ['budget', 'eRoi', 'availableBalance', 'roi'].forEach(field =>{
        if(this[field] && typeof this[field]==='string'){
            this[field] = parseFloat(this[field].replace(/[^\d.]/g, ''))
        }
    })
    
})

projectSchema.statics.generateNextId = async function () {
  const lastProject = await this.findOne().sort({ uniqueId: -1 });
  return lastProject? (parseInt(lastProject.uniqueId) + 1).toString() : "1178";
};

module.exports = mongoose.model('Project', projectSchema);