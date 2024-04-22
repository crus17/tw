const mongoose = require('mongoose');

const connectDatabase = () => {
    mongoose.set("strictQuery", false);
    mongoose.connect(process.env.DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useCreateIndex: true
    }).then(con => {
        console.log(`MondgoDB connected to HOST ${con.connection.host}`);
    })
}


module.exports = connectDatabase;
