const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    punterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    name: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
})

module.exports = mongoose.model('Review', reviewSchema)