const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    uniqueId: {
        type: String,
        unique: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    bookie: {
        type: String,
        required: true
    },
    stakeAmount: { 
        type: Number, 
        required: true 
    },
    ticketId: { 
        type: String, 
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in progress', 'successful', 'failed'],
        default: 'in progress'
    },
    games: [
        {
            time: Date,
            league: String,
            homeTeam: String,
            awayTeam: String,
            scores: {
                ht:{
                    type: String,
                    default:""
                },
                ft:{
                    type: String,
                    default:""
                },
            },
            prediction: String,
            market: String,
            outcome: Number,
            matchStatus: String,
            satus: String,
            odds: String,
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

ticketSchema.pre('save', async function(){
    if (!this.uniqueId) {
        this.uniqueId = await this.constructor.generateNextId();
    }

    if(this.stakeAmount && typeof this.stakeAmount==='string'){
        this.stakeAmount = parseFloat(this.stakeAmount.replace(/[^\d.]/g, ''))
    }
})


ticketSchema.statics.generateNextId = async function () {
  const lastTicket = await this.findOne().sort({ uniqueId: -1 });
  return lastTicket? (parseInt(lastTicket.uniqueId) + 1).toString().padStart(2,'0') : "01";
};
module.exports = mongoose.model('Ticket', ticketSchema);