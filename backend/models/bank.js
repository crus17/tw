const mongoose = require('mongoose')

const bankSchema = new mongoose.Schema({
    id: Number,
    code: String,
    name: String,
})

module.exports = mongoose.model('Bank', bankSchema)