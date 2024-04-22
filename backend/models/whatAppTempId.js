const mongoose = require('mongoose')

const whatsAppTempIdSchema = mongoose.Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker'
    },
    waId: {
        type: String
    }
})

module.exports = mongoose.model('WhatsAppTempIdSchema', whatsAppTempIdSchema);