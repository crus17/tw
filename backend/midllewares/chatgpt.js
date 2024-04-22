const got = require('got');
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const Category = require('../models/settings/category');

exports.classify = catchAsyncErrors(async(req, res, next)=>{
    const sample1 = "A worker is needed. Suggest a common worker category name for someone that performs a service. Limit your response to only the category name. It's okay if you repeat my input. Return back the input if it is a category. Think about the most suitable person to perform a task - ";
    const sample2 = 'Classify to closest niche category: i need someone to '
    const systemMsg = `you are a helpful assistant, you help to classify user 
                        input to their closest niche category. 
                        Think of the user looking for someone to perform some task for them. 
                        Only provide the category without any additional information`

    const systemMsgPersonified = `you are a helpful assistant, you help to classify user 
                        input to their closest niche category. 
                        Think of the user looking for someone to perform some task for them.
                        Only provide the personified category without any additional information`
    
    try {
        const response = await got.post('https://api.openai.com/v1/chat/completions', {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            json: {
                model: 'gpt-3.5-turbo',
                messages: [{"content":sample1,"role": "system"},
                            {"role": "user", "content": req.body.description}],
                temperature: 0,
                max_tokens: 7
            }
        }).json();
        // console.log(response.choices[0].message.content);
        const title = (response.choices[0].message.content)
            .replace(/[\r\n]+/gm, " ")
            .replace(/\s+/g, " ")
            .replace(/\./g, "")
            .trim();
        if(title.includes("cannot")){
            return next(new ErrorHandler("Apologies, we are unable to assist with this request. Please try a different service or rephrase your request.", 404))
        }
        req.body.title = title;

        try {

            let category = await Category.findOne({name: title});
            
            if(!category){
                category = await Category.create({ name: title })
            }

            req.body.category = category;

        } catch (error) {
            console.log(error)
        }

        next();
    } catch (error) {
        console.log(error);
        return next(new ErrorHandler('Internal server error', 500));
    }
})

exports.getProperTitle = async(description)=>{
    const sample1 = "A worker is needed. Suggest a common worker category name for someone that performs a service. Limit your response to only the category name. It's okay if you repeat my input. Return back the input if it is a category. Think about the most suitable person to perform a task - ";
  
    let title;
    let category;

    try {

        const response = await got.post('https://api.openai.com/v1/chat/completions', {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            json: {
                model: 'gpt-3.5-turbo',
                messages: [{"content":sample1,"role": "system"},
                            {"role": "user", "content": description}],
                temperature: 0,
                max_tokens: 7
            }
        }).json();

        title = (response.choices[0].message.content)
            .replace(/[\r\n]+/gm, " ")
            .replace(/\s+/g, " ")
            .replace(/\./g, "")
            .trim();

        if(title.includes("cannot")){
            title = ""

        }else{

            category = await Category.findOne({name: title});
            
            if(!category){
                category = await Category.create({ name: title })
            }

        }

    } catch (error) {
        console.log(error);
    }

    return category
}

exports.summarize = catchAsyncErrors(async(req, res, next)=>{
    const isDircectRequest = req.body.worker;
    const request = `The intention of the user is to find someone to perform 
                        a certain task, summarize what the user wants to get done. 
                        Your response should be as though its from the user and 
                        should prompt an action[${isDircectRequest?'show of interest or availability':'apply'}]. 
                        Limit your response to 15 words`
       
    try {
        const response = await got.post('https://api.openai.com/v1/chat/completions', {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            json: {
                model: 'gpt-3.5-turbo',
                messages: [{"content":request,"role": "system"},
                            {"role": "user", "content": req.body.description}],
                temperature: 0,
                max_tokens: 15
            }
        }).json();
        // console.log(response.choices[0].message.content);
        const summary = (response.choices[0].message.content)
                        .replace(/[\r\n]+/gm, " ")
                        .replace(/\s+/g, " ").trim();
        if(summary.includes("I cannot")){
            return next(new ErrorHandler("Apologies, we are unable to assist with this request. Please try a different service or rephrase your request.", 404))
        }
        req.body.summary = summary;
        next();
    } catch (error) {
        console.log(error);
        return next(new ErrorHandler('Internal server error', 500));
    }
})