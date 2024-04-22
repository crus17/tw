const got = require("got");
const Task = require("../models/task");
const Town = require("../models/address/town");
const User = require("../models/user");
const Artisan = require("../models/artisan");
const catchAsyncErrors = require("../midllewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");
const ErrorHandler = require("../utils/errorHandler");
const Worker = require("../models/worker");
const { debitWallet, creditWallet, debitPlateformCommission, creditReferralEarnings } = require("./paymentController");
const Review = require("../models/review");
const FuzzySearch = require("../utils/FuzzySearch");
const WhatAppTempId = require("../models/whatAppTempId");
const { sendWhatsAppMessage } = require("../utils/taskNotification");
const sendSMS = require("../utils/sendSMS");
const user = require("../models/user");
const sendEmail = require("../utils/sendEmail");

//Create new task => /api/v1/task/new
exports.newTask = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  req.body.workers = req.body.worker? [{worker: req.body.worker}]:[]

  const tasksBelongsToUser = user.workers?.find(profile => profile._id.toString() === req.body.worker);

  if(tasksBelongsToUser){
    return next(new ErrorHandler("You cannot apply to self!", 403))
  }

  const task = await Task.create({...req.body, user: user.id});


  if(task && task.workers.length > 0){
    //Send a WhatsApp notification to the worker, where he can accept or reject the request

    const moreTask = await Task.findById(task._id)
            .populate({
              path: "workers.worker",
              select: "pricing",
              populate: {
                path: "owner",
                select: "firstName lastName phoneNumber",
              },
            })
            .populate({
              path: "location.lga",
              select: "name",
              populate: {
                path: "state",
                select: "name",
              },
            })
            .populate("user", "firstName lastName phoneNumber", User);

    const header = `${moreTask.title} Job Request`.toUpperCase();
    const message = `Hello ${moreTask.workers[0].worker.owner.firstName},
        You have a ${moreTask.title} job request from ${moreTask.user.firstName} ${moreTask.user.lastName}. Please confirm your availability within 30 minutes to receive the task owner's contact info.\n
        Confirming availability incurs a N100 service fee.\n
        For more details, log in to your dashboard on our web platform.
        https://www.ebiwoni.com`;
    const SMSmessage = `Hello ${moreTask.workers[0].worker.owner.firstName}, ${task.title} job request in ${moreTask.location.town}, ${moreTask.location.lga.name}. You have 30 mins to confirm your availability for this job. Visit www.ebiwoni.com`
    const location = `Task location: ${moreTask.location.town}, ${moreTask.location.lga.name}, ${moreTask.location.lga.state.name} State.`

    // create a whatsapp chat identifier
    const worker = await Worker.findById(req.body.worker).populate({path:'owner', select:'phoneNumber'});
    
    const waId = `234${worker.owner.phoneNumber.slice(-10)}`

    sendSMS(SMSmessage, `+${waId}`);
    sendWhatsAppMessage(waId, worker._id, {id:moreTask._id, header, message, location});

    // Send a notification to the admin
    sendSMS(`${task.title} job request in ${moreTask.location.town}, ${moreTask.location.lga.name}, ${moreTask.location.state.name}`, "2348030572700")
    sendEmail({
      email: "al.ekeuwei@gmail.com",
      subject: "New Job Request",
      message: `We have ${task.title} job request in ${moreTask.location.town}, ${moreTask.location.lga.name}, ${moreTask.location.state.name}`
    })
  }

  res.status(201).json({
    success: true,
    mesage: "Task created successfully",
  });
});

//Create a task request => /api/v1/task/request
exports.newTaskRequest = catchAsyncErrors(async(req, res, next)=>{
  req.body.user = req.user.id
  req.body.status = 'Request';
  
  const { state, lga, town:name } = req.body.location
  const filter = { state, lga, name }
  const options = {upsert: true, new: true}

  // Set the task rate so worker can't change rate
  req.body.rate = {value: req.body.budget, agreed: true}

  await Town.findOneAndUpdate(filter, filter, options);
  
  const task = await Task.create(req.body);

  // Send a notification to the admin
  sendSMS(`Someone is looking for a ${task.title} in ${task.location.town}`, "2348030572700")
  sendEmail({
    email: "al.ekeuwei@gmail.com",
    subject: "Worker Request",
    message: `Someone is looking for a ${task.title} in ${task.location.town}. Kindly assist in getting a worker as soon as possible for the job. \n\nSUMMARY:\n${task.summary}`
  })

  res.status(200).json({
    success: true,
    message: "Task created successfully"
  })
})


exports.requestApplication = catchAsyncErrors(async(req, res, next)=>{
  const task = await Task.findById(req.body.taskId)
                .populate("user", "firstName lastName phoneNumber", User);
  
  const workerProfile = req.user.workers.find(workerProfile => workerProfile._id.equals(req.body.profileId));

  if(task && workerProfile){

    const hasApplied = task.applicants.findIndex(applicant => applicant.worker.equals(workerProfile._id)) !== -1;

    const tasksBelongsToUser = task.user.equals(req.user._id);

    if(tasksBelongsToUser){
      return next(new ErrorHandler("You cannot apply to self!", 403))
    }

    if(hasApplied){
      return next(new ErrorHandler("This business profile has already applied", 409))
    }

    let { message } = req.body;
    
    message = message?.length > 7? message : "Sure, I'd be happy to take on the job!";

    task.applicants.push({worker: workerProfile._id, message});

    if(task.applicants.length === 1){
      const waId = `234${task.user.phoneNumber.slice(-10)}`
      const message = `Hello ${task.user.firstName}, your ${task.title} job request has started receiving applications. Check your dashboard on the web platform to review and select the perfect candidate for the job. Visit https://www.ebiwoni.com for more details.`
      await sendSMS(message, `+${waId}`);
      // Consider sending to the whatsapp platform
    }


    await task.save();

    // TODO: Notify the task requester about this application

    res.status(200).json({
      success: true,
      message: 'Application received'
    });
  }else{
    next(new ErrorHandler('Not authorized action', 401))
  }
})

// Get logged in user task => /api/v1/user/tasks
exports.myTasks = catchAsyncErrors(async (req, res, next) => {
  const searchFields = ['status']
  const resPerPage = 10;
  const searchQuery = req.query.keyword==='undefined'?'':req.query;
  const apiFeatures = new APIFeatures(Task.find({ user: req.user.id })
    .sort({createdAt: -1})
    .populate("workers.review", "name comment rating", Review)
    .populate({
      path:"applicants.worker",
      select:"message createdAt",
      populate:{
        path: "owner", 
        select:"firstName lastName avatar"
      }
    })
    .populate({
      path:"workers.worker",
      select:"pricing",
      populate:{
        path: "owner", 
        select:"firstName lastName phoneNumber avatar"
      }
    }), searchQuery, searchFields)
    .search()
    // .filter()

  apiFeatures.pagination(resPerPage);
  let tasks = await apiFeatures.query;

  tasks = tasks.map(task => {
      // if(!['Completed', 'Accepted'].includes(task.status)) 
          task.workers = task.workers.map(workerObj => {
            
            // Worker must confirm availability before user can access workers contact details
            if(!['Completed', 'Accepted'].includes(workerObj.escrow.worker)){
              workerObj.worker.owner.phoneNumber = null
            }

            return workerObj;
          })

      return task
    })

  res.status(200).json({
    success: true,
    tasks,
  });
});

// Get logged in worker task => /api/v1/user/works
exports.myWorks = catchAsyncErrors(async (req, res, next) => {
  const searchQuery = req.query.keyword==='undefined'?'':req.query;
  const searchFields = ['status']
  const resPerPage = 10;
  const apiFeatures = new APIFeatures(Task.find({ "workers.worker": { $in: req.user.workers } })
    .sort({createdAt: -1})
    .populate('workers.worker','pricing')
    .populate("user","firstName lastName avatar phoneNumber",User), searchQuery, searchFields)
    .search()

  apiFeatures.pagination(resPerPage);
  let works = await apiFeatures.query;


  if(works){
    works = works.map(task =>{

      const workerIndex = task.workers.findIndex(workerObj => {
        return req.user.workers.some(worker => worker._id.equals(workerObj.worker._id))
      })
      
      const taskObj = task.toObject();
      const newTask = {...taskObj.workers[workerIndex], ...taskObj}
      delete newTask.workers
      
      if(!['Completed', 'Accepted'].includes(newTask.escrow.worker)){
        newTask.user.phoneNumber = null
      }

      return newTask;
    })
  }

  res.status(200).json({
    success: true,
    works,
  });
});

exports.allowedUpdate = (incoming)=>{
  switch (incoming) {
    case "Request":
      return ['Pending', 'Cancelled']
    case "Pending":
      return ['Accepted', 'Completed', 'Cancelled', 'Declined']
    case "Accepted":
      return ['Completed', 'Abandoned', 'Cancelled']

    default:
      return []
  }
}

exports.updateTask = catchAsyncErrors(async (req, res, next) => {
  
  const task = await Task.findById(req.params.id)
  .populate({
      path: "workers.worker",
      select: "pricing",
      populate: {
        path: "owner",
        select: "firstName lastName phoneNumber referralId",
      },
    })
    .populate({
      path: "location.lga",
      select: "name",
      populate: {
        path: "state",
        select: "name",
      },
    })
    .populate("user", "firstName lastName phoneNumber", User);

  // Get the index of the worker in the task workers array
  let workerIndex = task.workers.findIndex(workersObj => workersObj.worker._id.equals(req.body.workerId))
  
  // Check if the update request is from task owner
  const isUser = task.user.equals(req.user.id);

  const loggedWorkerIndex = task.workers.findIndex(workerObj => {
    return req.user.workers.some(profile => profile._id.equals(workerObj.worker._id))
  });

  const completedWork = task.workers[workerIndex]?.escrow.worker==="Completed" && 
                        task.workers[workerIndex]?.escrow.user==="Completed"
  
  
  if (isUser) {
    //Make sure the worker index is also the applicant index
    const applicantId = req.body.workerId;
    
    const applicantExist = task.workers.find(workerObj => workerObj.worker._id.toString() === applicantId)
    
    const worker = await Worker.findById(applicantId)
    const platformCommission = 100; 
      
    if(!applicantExist && task.status === "Request"){
      task.workers = [...task.workers, {worker: applicantId}]

      // Delete the applicant's ID from the list of applicants
      task.applicants = task.applicants.filter(applicant => applicant.worker.toString() !== applicantId)
      
      const applicant = await Worker.findById(applicantId).populate({path:'owner', select:'firstName phoneNumber'});
      const waId = `234${applicant.owner.phoneNumber.slice(-10)}`
      
      const header = `${task.title} Job Approval Notice`.toUpperCase();
      const message = `Hi ${applicant.owner.firstName},
          Congrats on being approved for the ${task.title} job! Please confirm your availability within 30 minutes to receive the task owner's contact info.\n
          Confirming availability incurs a ₦${platformCommission} service fee.\n
          For more details, log in to your dashboard on our web platform.
          https://www.ebiwoni.com`;
      const SMSmessage = `Hello ${applicant.owner.firstName}, Congrats on being approved for the ${task.title} job! You have 30 mins to confirm your availability for this job. Visit www.ebiwoni.com`
          
      const location = `Task location: ${task.location.town}, ${task.location.lga.name}, ${task.location.lga.state.name} State.`

      // Notify the applicant to accept the work
      // TODO: check if worker has opted to receive whatsApp notification
      sendSMS(SMSmessage, `+${waId}`)
      sendWhatsAppMessage(waId, applicantId, {id:task._id, header, message, location})
    }
      
    if(applicantExist){

      // user cannot cancell a task that has been accepted
      if(req.body.status === "Cancelled" && task.workers[workerIndex].escrow.worker === "Accepted"){
        return next(new ErrorHandler("You cannot cancel this task"))
      }
  
      if(this.allowedUpdate(task.workers[workerIndex].escrow.user).includes(req.body.status)){
        
        task.workers[workerIndex].escrow.user = req.body.status;

        if(['Cancelled', 'Declined', 'Abandoned'].includes(req.body.status)){
          task.status = req.body.status
        }
      }

    }

  }else if(loggedWorkerIndex !== -1) {
    
    const debitWorker = task.workers[loggedWorkerIndex].escrow.worker === 'Pending' && req.body.status === 'Accepted'
        
    const platformCommission = 100; 

    if(this.allowedUpdate(task.workers[workerIndex].escrow.worker).includes(req.body.status)){
      task.workers[loggedWorkerIndex].escrow.worker = req.body.status;
      
      if(['Cancelled', 'Declined', 'Abandoned'].includes(req.body.status)){
        task.status = req.body.status
      }
    }
  
    if(debitWorker){

      const debitStatus = await debitWallet(platformCommission, `Task service fee taskId:${task._id}`, req.user._id);
      
      if(debitStatus === "insufficient"){
        return next(new ErrorHandler("Insufficient fund, top up and try again", 402))
      }

    }
  
  }else{
    return next(new ErrorHandler("Unauthorized Action", 400));
  }


  // Finalize a job
  if(isUser && req.body.status === 'Completed' && 
  task.workers[workerIndex].escrow.user==="Completed"&&
  task.workers[workerIndex].escrow.worker==="Completed" && !completedWork){
    // Debit the worker 10% of the rate
    
    const commission = task.rate.value * 0.1 //10%
    
    if(req.body.paymentOption === "wallet"){

      // Debit user
      const debitUserAccount = await debitWallet(task.rate.value, `Worker settlement ref:${task._id}`, req.user.id)
      
      if(debitUserAccount === "insufficient"){
        return next(new ErrorHandler("Insufficient fund, top up and try again", 402))
      }

      // Credit worker
      await creditWallet(task.rate.value, `Work settlement taskRef:${task.taskId}`, task.workers[workerIndex].worker.owner._id)
    }

    debitPlateformCommission(commission, task.workers[workerIndex].worker.owner._id, task.taskId)

    // Credit the agent/referer
    creditReferralEarnings((commission/10), task.workers[workerIndex].worker.owner.referralId, task.taskId)

    // TODO: Notify worker if payment was wallet transfer
  }

  if(task.workers.length >= task.numberOfWorkers){

    // Check if both user and workr has comfirmed job completion
    const allCompleted = task.workers.map(taskObj => 
      taskObj.escrow.user === 'Completed' && taskObj.escrow.worker === 'Completed')
    .every(status => status === true);
    
    if(task.status === "Request"){
      // Delete all applicants
      // task.applicants = []
    }
    
    task.status = allCompleted? 'Completed': task.status

  }

  await task.save();

  res.status(200).json({
    success: true,
    message: `Task ${req.body.status}`
  });
});

// updates task rates => '/api/v1/task/rate'
exports.updateTaskRate = catchAsyncErrors(async (req, res, next)=>{
  const task = await Task.findById(req.query.id);

  const taskOwner = task.user._id.equals(req.user.id);
  const taskWorker = task.workers.some(taskWorker => req.user.workers.find(userWorker => taskWorker.worker.equals(userWorker._id)))

  const cleanedValue = req.query.amount.replace(/,/g, '');
  
  if(taskOwner && task.rate?.postedBy=== 'worker' || 
    taskWorker && task.rate?.postedBy === 'owner'){
      
      task.rate = {
        value: parseFloat(cleanedValue),
        postedBy: taskOwner? 'owner':'worker',
        finalRate: req.query.final==='final',
        agreed: parseFloat(task.rate.value) === parseFloat(cleanedValue)
      }
    
      // Task is accepted when both parties have agreed on the rate
      if(task.rate.agreed){
        task.status = "Accepted"
      }

      await task.save();

    // TODO: notify taskOwner/taskWoker of the change in rate
  }

  res.status(200).json({
    success: true,
    message: "Rate updated succefully"
  })

})


// return nearby tasks => '/api/v1/tasks/nearby'
exports.nearbyTasks = catchAsyncErrors(async(req, res, next)=>{
  
  const {categories, location} = req.body;

  const searchFields = ['location.town']
  
  const resPerPage = 10;

  const query = { status: 'Request' };

  if (location.state) { query['location.state'] = location.state; }

  if (location.lga) { query['location.lga'] = location.lga; }

  req.query.keyword = location.name
  req.query.page = '1'

  const tasks = await Task.find(query).populate("user","firstName lastName avatar",User)
  
  const fuzzySearch = new FuzzySearch(tasks, req.query, searchFields)
                        .search().pagination(resPerPage)

  let nearbyTasks = fuzzySearch.documents;

  res.status(200).json({
    success: true,
    nearbyTasks:tasks,
  });
})

exports.updateTaskProgress = catchAsyncErrors(async (req, res, next) => {
  const role = req.body.role;
  const task = await Task.findById(req.params.id);
  const user = req.body.role === "user"
                ? await User.findById(req.body.uid)
                : await Artisan.findById(req.body.uid);

  const isAuthorizedUser = role === "user"
                            ? task.user.equals(user._id)
                            : task.artisan.equals(user._id);

  if (isAuthorizedUser) {
    task.escrow[role] = req.body.status;
  } else {
    return next(new ErrorHandler("Unauthorized Action", 400));
  }

  await task.save();

  res.status(200).json({
    success: true,
  });
});
