const express = require('express');

const app = express();

const cors = require('cors')
const cron = require('node-cron')

const cookieParser = require('cookie-parser')
const bodyparser = require('body-parser')
const fileUpload = require('express-fileupload')
// const dotenv = require('dotenv');
const path = require('path')

const errorMiddleware = require('./midllewares/errors');

// Enable CORS using the cors middleware
const corsOptions = {
  origin: 'http://localhost:5173',
//   methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
  credentials: true, // Enable credentials (cookies, authorization headers)
};
app.use(cors(corsOptions))

// Setting up config file
// dotenv.config({ path: 'backend/config/config.env' });
if(process.env.NODE_ENV !== 'PRODUCTION') {
    require('dotenv').config({ path: 'backend/config/config.env' });
}

app.use(express.json({limit: "50mb"}));
app.use(bodyparser.urlencoded({limit: "50mb", extended: true}))
app.use(cookieParser());
app.use(fileUpload());

//Import all routes 
const accountVerification = require('./routes/accountVerification');
// const project = require('./routes/project');
// const payment = require('./routes/payment');
// const { updateTicketProgress, updateProjectProgress } = require('./utils/routineTasks');
/* 
const settings = require('./routes/settings');
const products = require('./routes/product');
const artisans = require('./routes/artisan');
const task = require('./routes/task');
const agent = require('./routes/agent');
const order = require('./routes/order');
const worker = require('./routes/worker')
const webhooks = require('./routes/webhooks')
//*/

app.use('/api/v1', accountVerification);
// app.use('/api/v1', project);
// app.use('/api/v1', payment)

/*
app.use('/api/v1', settings);
app.use('/api/v1', products);
app.use('/api/v1', artisans);
app.use('/api/v1', task);
app.use('/api/v1/agent', agent);
app.use('/api/v1', order)
app.use('/api/v1', worker)
app.use('/api/v1', webhooks)
//*/

cron.schedule('*/30 * * * *', async () => {
  // runs every 30 minues
  console.log('Updating bet tickets...');
  // const response = await updateTicketProgress();
  // console.log(response);
})

cron.schedule('0 * * * *', async () => {
  // runs every hour
  console.log('Updating projects...');
  // const response = await updateProjectProgress();
  // console.log(response);
})

if(process.env.NODE_ENV === 'PRODUCTION_'){
    app.use(express.static(path.join(__dirname, '../frontend/build')))

    app.get('*', (req, res)=>{
        res.sendFile(path.resolve(__dirname, '../frontend/build/index.html'))
    })
}

// Middleware to handle errors
app.use(errorMiddleware);

module.exports = app; 

// module.exports.handler = serverless(app);
