const app = require('./app');

// const dotenv = require('dotenv');

const cloudinary = require('cloudinary')

const connectDatabase = require('./config/database')

// Handle Uncaught exceptions
process.on('uncaughtException', err => {
    console.error(`ERROR: ${err.stack}`);
    console.error('Shutting down due to uncaught exception');
    process.exit(1);
 });

// Setting up config file
// dotenv.config({ path: 'backend/config/config.env' });
if(process.env.NODE_ENV !== 'PRODUCTION') {
    require('dotenv').config({ path: 'backend/config/config.env' });
}

// Connecting to database
connectDatabase();

// Setting up cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const server = app.listen(process.env.PORT, () => {
    console.log(`Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
}); 

// Handle Unhandled Promise rejection
process.on('unhandledRejection', err => {
   console.error(`ERROR: ${err.message}`);
   console.error('Shutting down the server due to unhandled Promise rejection');
   server.close(()=> process.exit(1)); 
});