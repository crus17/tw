const mongoose = require('mongoose')
const badgeSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    number: {
        type: Number,
        unique: true,
    },
    minOdds: {
        type: Number,
    },
    maxOdds: {
        type: Number,
    },
})

module.exports = mongoose.model('Badge', badgeSchema)