const catchAsyncErrors = require("../midllewares/catchAsyncErrors");
const State = require("../models/address/state");
const Lga = require("../models/address/lga");
const Settings = require("../models/settings");
const Town = require("../models/address/town");
const ErrorHandler = require("../utils/errorHandler");
const Category = require("../models/settings/category");

exports.getSettings = catchAsyncErrors(async (req, res, next)=>{
    const settings =  await Settings.find();

    res.status(200).json({
        success: true,
        settings
    })
});

exports.getStates = catchAsyncErrors(async (req, res, next)=>{
    const states = await State.find({});
    
    res.status(200).json({
        success: true,
        states
    })
})

exports.getLgas = catchAsyncErrors(async (req, res, next)=>{
    const lgas = await Lga.find({state: req.params.id});
    res.status(200).json({
        success: true,
        lgas
    })
})

exports.getTowns = catchAsyncErrors(async (req, res, next)=>{
    const towns = await Town.find({lga: req.params.id});
    res.status(200).json({
        success: true,
        towns
    })
})

exports.getCategories = catchAsyncErrors(async (req, res, next)=>{
    const categories = await Category.find();

    res.status(200).json({
        success: true,
        categories
    })
})



exports.updateSettings = catchAsyncErrors(async (req, res, next)=>{

    let settings = await Settings.findById(req.params.id);

    if(!settings){
        return next(new ErrorHandler('Settings Not Found', 404));
    }

    settings = await Settings.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        settings
    })
})

exports.createSettings = catchAsyncErrors(async(req, res, next)=>{
    const settings = await Settings.create(req.body);
})