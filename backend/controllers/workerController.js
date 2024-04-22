const mongoose = require('mongoose');
const Worker = require("../models/worker");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../midllewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");
const sendEmail = require("../utils/sendEmail");

const cloudinary = require("cloudinary");
const User = require("../models/user");
const Task = require('../models/task');
const Town = require('../models/address/town')
const Review = require('../models/review');
const FuzzySearch = require('../utils/FuzzySearch');
const { creditWallet } = require('./paymentController');
const sendSMS = require('../utils/sendSMS');

exports.createWorker = catchAsyncErrors(async (req, res, next) => {
    
  const { user } = req;

  // console.log(user);

  if(user.workers.length < 1 || user.role === 'admin'){


    const featuredGraphicsUpload = await cloudinary.v2.uploader.upload(req.body.featuredGraphics, {
        folder: 'avatars',
        // width: 1024, // Adjust this value to match ui
        crop: 'scale'
    })

    let {description, localities, category, minRate, dailyRate} = req.body;
  
    let worker;
    
    const { lga, state } = user.contact.town;
    
    const bulkOps = localities.map(el => {
      const doc = { name: el.name, lga: lga._id, state: state._id }
      return {
        updateOne: {
          filter: doc,
          update: { $set: {name: el.name}},
          upsert: true,
        },
      }
    })
    
    await Town.bulkWrite(bulkOps)
    
    const existingLocalities = localities.map(el => el.name);

    const userLocation = await Town.findById(user.contact.town.id).populate({
      path: "lga state", select: "name sn"
    })
    const location = {state: userLocation.state.sn, lga: userLocation.lga.sn, town: userLocation.name};

    try {
      worker = await Worker.create({
        owner: user.id,
        description,
        location,
        localities: existingLocalities,
        category,
        featuredGraphics: {public_id: featuredGraphicsUpload.public_id, url: featuredGraphicsUpload.secure_url},
        pricing: {
          minRate: parseFloat((minRate).replace(/,/g, "")), 
          dailyRate: parseFloat((dailyRate).replace(/,/g, ""))
        }
      })
    } catch (error) {
      await cloudinary.v2.uploader.destroy(featuredGraphicsUpload.public_id); // Delete uploaded image
      return next(error)
    }
    
    user.workers.push(worker._id)
    user.role = 'worker'
    user.userMode = !user.userMode
    
    if(user.workers.length === 1){
      // credit the newly created worker account with 500 bonus 
      creditWallet(500, "Complementary sign-up bonus", user.id);
      const message = `Congratulations! ${worker.category.name} worker profile has been created. You now have N500 complementary work credit to use for tasks and services on our platform.`
      const to = `234${user.phoneNumber.slice(-10)}`
      sendSMS(message, to);
    }

    await user.save()

    res.status(200).json({
          success: true
      });
  } else{
    return next(new ErrorHandler("You cannot create more workers", 405))
  }
});

// Get all workers => /api/v1/workers?keyword=apple
exports.getWorkers = catchAsyncErrors(async (req, res, next) => {

  const resPerPage = 5;
  const workersCount = await Worker.countDocuments();
  const searchFields = ['category.name', 'description', 'displayName']
  const query = Worker.find().populate('owner', 'firstName lastName avatar contact', User)
  // const apiFeatures = new APIFeatures(query, req.query, searchFields)
  //                     .search()
                      // .filter()

  const searchQuery = {}
  if (req.query.s) {
    searchQuery['location.state'] = req.query.s;
  }

  if (req.query.l) {
    searchQuery['location.lga'] = req.query.l;
  }

  if (req.query.t) {
    searchQuery['location.town'] = req.query.t;
  }
  if (req.query.category) {
    searchQuery['category.sn'] = req.query.category;
  }
 
  const documents = await Worker.find(searchQuery)
                    .populate({
                      path: 'owner',
                      select: 'firstName lastName avatar',
                      populate: {
                        path: 'contact.town', select: 'name'
                      }
                    }).lean()
                    
  const fuzzySearch = new FuzzySearch(documents, req.query, searchFields)
                    .search()
                    .pagination(resPerPage);

  let workers = fuzzySearch.documents;

   // apiFeatures.pagination(resPerPage);
  // let workers = await apiFeatures.query;
  let filteredWorkersCount = workers.length;


  res.status(200).json({
    success: true,
    workersCount,
    resPerPage,
    filteredWorkersCount,
    workers
  });
});

exports.getWorkerDetails = catchAsyncErrors (async (req, res, next)=>{

  const worker = await Worker.findById(req.params.id)
                      // .populate('owner', 'avatar firstName lastName phoneNumber', User)
                      .populate({
                        path: 'owner',
                        select: 'avatar firstName lastName phoneNumber',
                        populate: {
                          path: 'contact',
                          select: 'address town',
                          populate:{
                            path: 'town',
                            select: 'name',
                            populate: {
                              path: 'lga state',
                              select: 'name'
                            }
                          }
                        }
                      })
  if(!worker){
    next(new ErrorHandler(`Worker not found with ID:${req.params.id}`, 404))
  }

  res.status(200).json({
    success: true,
    worker
  })
})

exports.getLoggedInUserWorkers = catchAsyncErrors (async (req, res, next)=>{
  
  const user = await User.findById(req.user.id)
              .populate('workers', 'displayName featuredGraphics description status pricing localities category rating createdAt', Worker)
              .select('workers')
  
  // const ObjectId = mongoose.Types.ObjectId;
  // const ids = JSON.parse(req.body.data);
  // const workers = await Worker.find({ _id: { $in: ids.map(id => ObjectId(id)) } });

  if(!user?.workers){
    next(new ErrorHandler(`No Worker was found`, 404))
  }

  res.status(200).json({
    success: true,
    workers: user.workers
  })
})

// Create new review =>     /api/v1/create/worker/review
exports.createWorkertReview = catchAsyncErrors( async (req, res, next) => {
    const { rating, comment, workerId, taskId } = req.body;
    const reviewDetails = {
        taskId,
        workerId,
        userId: req.user._id,
        name: req.user.firstName,
        rating: Number(rating),
        comment
    }

    const worker = await Worker.findById(workerId)

    const task = await Task.findById(taskId)

    const review = await Review.findOneAndUpdate({taskId, workerId}, reviewDetails, { upsert: true, new: true });

    const workerReviews = await Review.find({workerId});

    worker.numOfReviews = await Review.countDocuments({workerId});
    
    worker.ratings = workerReviews.reduce( (acc, item) => item.rating + acc, 0 ) / workerReviews.length
    
    task.workers = task.workers.map(worker => {
      if(worker.worker._id.toString() === workerId){
        worker.review = review._id
      }
      return worker;
    })

    await Promise.all[task.save(), worker.save( { validateBeforeSave: false } )]

    res.status(200).json({
        success: true
    })
})

// Get Worker Reviews   =>  /api/v1/reviews
exports.workerReviews = catchAsyncErrors( async (req, res, next) => {
    const reviews = await Review.find({workerId: req.params.id});

    res.status(200).json({
        success: true,
        reviews
    })
})