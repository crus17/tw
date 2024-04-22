const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    categories:[
        {
            key: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            }
        }
    ],
    billingFormat:[
        {type: String}
    ]
    
});

module.exports = mongoose.model('Setting', settingSchema);