const mongoose  = require("mongoose");
const Flutterwave = require("flutterwave-node-v3");
const Transaction = require("../models/transaction");
const Wallet = require("../models/wallet");
const catchAsyncErrors = require("../midllewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const Agent = require('../models/agent')
const got = require('got');
const Bank = require("../models/bank");
const Cashout = require("../models/cashout");

const stripe = require('stripe')(process.env.STRIPE_SECRETE_KEY)


// Process stripe payments      =>  /api/v1/payment/process
exports.processPayment = catchAsyncErrors( async (req, res, next)=>{
    
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'usd',

        metadata: { integration_check: 'accept_a_payment' }
    });

    res.status(200).json({
        success: true,
        client_secret: paymentIntent.client_secret
    })
})

// Send Stripe API key      =>  /api/v1/stripeapi 
exports.sendStripeApiKey = catchAsyncErrors( async (req, res, next)=>{

    res.status(200).json({
        stripeApiKey: process.env.STRIPE_API_KEY
    })

})

// Credit account      =>  /api/v1/payment/credit
exports.credit = catchAsyncErrors( async(req, res, next)=>{
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const wallet = Wallet.findOne({userId: req.user.id}).session(session);

        if(req.body.amount < 1){
            throw new Error("Credit amount too low")
        }

        const transaction = new Transaction({
            userId: req.user.id,
            walletId: wallet.walletId,
            type: 'credit',
            amount: req.body.amount
        });

        wallet.balance += amount;
        await Promise.all([wallet.save(), transaction.save()])

        await session.commitTransaction()
        session.endSession();

        res.status(200).json({
            success: true,
            message: `${transaction.amount} successfully credited`
        }); 

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(new ErrorHandler(error.message, 500))
    }
     
})

// Debit account      =>  /api/v1/payment/debit
exports.debit = catchAsyncErrors( async(req, res, next)=>{
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const wallet = Wallet.findOne({userId: req.user.id}).session(session);
    
        if(wallet.amount < req.body.amount){
            throw new Error("Insufficient funds")
        }
    
        wallet.balance -= req.body.amount;

        const transaction = new Transaction({
            userId: req.user.id,
            walletId: wallet.walletId,
            type: 'debit',
            amount: req.body.amount
        });
    
        await Promise.all([wallet.save(), transaction.save()]);

        await session.commitTransaction()
        session.endSession();

        res.status(200).json({
            success: true,
            message: `${transaction.amount} successfully debited`
        });    
        
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(new ErrorHandler(error.message, 500))
    }
})

// credit wallet
exports.creditWallet = async (amount, title, userId)=>{
    const wallet = await Wallet.findOne({userId});

    const transaction = await Transaction.create({
        title,
        userId,
        amount,
        type: 'credit',
        walletId: wallet.walletId
    });

    transaction.balanceBefore = wallet.balance
    transaction.balanceAfter = wallet.balance + amount

    wallet.balance += amount;
    transaction.status = 'successful';

    await Promise.all([wallet.save(), transaction.save()]);

    return transaction.reference;
}

// debit wallet
exports.debitWallet = async (amount, title, userId)=>{
    const wallet = await Wallet.findOne({userId});

    if(wallet.balance < amount){
        throw new Error ('Insufficient balance')
    }

    const transaction = await Transaction.create({
        title,
        userId,
        amount,
        type: 'debit',
        walletId: wallet.walletId
    });

    transaction.balanceBefore = wallet.balance
    transaction.balanceAfter = wallet.balance - amount

    wallet.balance -= amount;
    transaction.status = 'successful';

    await Promise.all([wallet.save(), transaction.save()]);
    
    return { 
        transactionRef: transaction.reference, 
        walletBalance: wallet.balance
    };
}

// debit wallet
exports.debitPlateformCommission = async (amount, userId, taskId)=>{
    const title = `Platform Commission taskRef:${taskId}`
    const wallet = await Wallet.findOne({userId});

    const transaction = await Transaction.create({
        title,
        userId,
        amount,
        type: 'debit',
        walletId: wallet.walletId
    });

    transaction.balanceBefore = wallet.balance
    transaction.balanceAfter = wallet.balance - amount

    wallet.balance -= amount;
    transaction.status = 'successful';

    await Promise.all([wallet.save(), transaction.save()]);
}

// credit referral earnings
exports.creditReferralEarnings = async (amount, referralId, taskId)=>{
    const agent = await Agent.findOne({agentId: referralId})
    
    if(!agent) return 

    const title = `Referral earning taskRef: ${taskId}`
    const wallet = await Wallet.findOne({walletId: agent.walletId});

    const transaction = await Transaction.create({
        title,
        userId,
        amount,
        type: 'credit',
        walletId: agent.walletId
    });

    transaction.balanceBefore = wallet.balance
    transaction.balanceAfter = wallet.balance + amount

    wallet.balance += amount;
    transaction.status = 'successful';

    await Promise.all([wallet.save(), transaction.save()]);
}

// Process flutterwave payments      =>  /api/v1/flwpayment/process
exports.flwPayment = catchAsyncErrors( async(req, res, next)=>{
    // const got = await import ("got");
    
    const wallet = await Wallet.findOne({userId: req.user.id});
    const transaction = await Transaction.create({
        title: 'Fund Wallet',
        userId: req.user.id,
        walletId: wallet.walletId,
        type: 'credit',
        amount: parseFloat((req.body.amount).replace(/,/g, ""))
    });

    let response;
    try {
        response = await got.post("https://api.flutterwave.com/v3/payments", {
            headers: {
                Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
            },
            json: {
                tx_ref: transaction.reference,
                amount: transaction.amount,
                currency: "NGN",
                redirect_url: `${process.env.FRONTEND_URL}/receipt`,
                // meta: {
                //     consumer_id: 23,
                //     consumer_mac: "92a3-912ba-1192a"
                // },
                customer: {
                    email: req.user.email,
                    phonenumber: req.user.phoneNumber,
                    name: `${req.user.firstName} ${req.user.lastName}`
                },
                customizations: {
                    title: "Account Topup",
                    logo: `${process.env.FRONTEND_URL}/images/logo.png"`
                }
            },
        }).json();
    } catch (err) {
        next(new ErrorHandler(err.message, err.code))
    }

    if(response.status==='success'){
        res.status(200).json({
            success: true,
            link: response.data.link,
        })
    }

});

// Verify Account Number
exports.flwVerifyAccount = catchAsyncErrors( async(req, res, next)=>{

    const { credentials } =  req.body
    
    const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
    
    const response = await flw.Misc.verify_Account(credentials).then(response => response);

    if(response.status==='error'){
        return next(new ErrorHandler(response.message), 404)
    }

    res.status(200).json({
        success: true,
        bankAccountDetails: response.data,
    })

});

// Get All Banks 
exports.flwGetAllBanks = catchAsyncErrors( async(req, res, next)=>{

    let banks;
    try {
        banks = await Bank.find().sort({ name: 'asc' })
    } catch (err) {
        return next(new ErrorHandler(err.message, err.code))
    }

    res.status(200).json({
        success: true,
        banks,
    })

});

// Wallet balance     =>  /api/v1/wallet
exports.walletBalance = catchAsyncErrors(async(req,res,next)=>{
    const wallet = await Wallet.findOne({userId: req.user.id});

    if(!wallet){
        return next(new ErrorHandler('No valid wallet'))
    }

    res.status(200).json({
        success: true,
        balance: wallet.balance
    })
})

// Cashout request     =>  /api/v1/fund/cashout
exports.cashout = catchAsyncErrors(async(req,res,next)=>{

    const namesUpdated  = (req.user.firstName && req.user.otherNames)

    if(!namesUpdated){
        return next(new ErrorHandler('Please update your profile names before cashing out.', 403))
    }

    try {

        // console.log(req.body.details);
        await this.debitWallet(req.body.details.amount, "Cashout", req.user.id)

        await Cashout.create(req.body.details)
        
    } catch (error) {
        return next(new ErrorHandler(error.message, 500))
    }

    const wallet = await Wallet.findOne({userId: req.user.id});

    res.status(200).json({
        success: true,
        walletBalance: wallet.balance,
        message: 'Cashout request submitted successfully'
    })
})

//Wallet transactions   =>   /api/v1/transactions
exports.walletTransactions = catchAsyncErrors(async (req, res, next)=>{
    const transactions = await Transaction.find({
        $and:[
            {userId: req.user.id}, 
            {status: { $in:['successful', 'failed']}}
        ]}).sort({createdAt: -1})

    res.status(200).json({
        success: true,
        transactions
    })
})


// Handle flutterwave payments Callback     Get =>  /api/v1/flwpayment/callback
exports.flwPaymentCallback = catchAsyncErrors(async(req, res, next)=>{
    const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
    const transactionDetails = await Transaction.findOne({reference: req.query.tx_ref});
    const wallet = await Wallet.findOne({userId: transactionDetails.userId});
    
    let walletBalance;
    
    if (req.query?.status ==="completed" || req.query?.status ==="successful") {
        
        const response = await flw.Transaction.verify({id: req.query.transaction_id});
        // const response = await flw.Transaction.verify({id: req.query.transaction_id});
        
        
        if (
            response?.data?.status === "successful"
            && response.data.amount === transactionDetails.amount
            && response.data.currency === "NGN") {
            // Success! Confirm the customer's payment
            if(transactionDetails.status !== response.data.status){
                
                wallet.balance += response.data.amount;
                transactionDetails.status = "successful";
                await Promise.all([wallet.save(), transactionDetails.save()]);

            }

            walletBalance = wallet.balance;

        } else {
            transactionDetails.status = response.data?.status;
            await transactionDetails.save();
        }
        
    }else{
        return next(new ErrorHandler(req.query?.status || 'Not Allowed', 501))
    }

    res.status(200).json({
        success: true,
        message: `Payment ${transactionDetails.status}`,
        walletBalance
    })
});

// flutterwave payments webhook      Get =>  /api/v1/flwpayment/webhook
exports.flwPaymentWebhook = catchAsyncErrors(async(req, res, next)=>{
    const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = req.headers["verif-hash"];
    if (!signature || (signature !== secretHash)) {
        // This request isn't from Flutterwave; discard
        res.status(401).end();
    }

    const { data: payload} = req.body;

    const transactionDetails = await Transaction.findOne({reference: payload.tx_ref});
    const wallet = Wallet.findOne({userId: transactionDetails.userId});
    const response = await flw.Transaction.verify({id: payload.transaction_id});

    if (
        response.data.status !== transactionDetails.status
        && response.data.status === "successful"
        && response.data.amount === transactionDetails.amount
        && response.data.currency === "NGN") {
        // Success! Confirm the customer's payment
        if(transactionDetails.status === "pending"){
            wallet.amount += response.data.amount;
            transactionDetails.status = "successful"
            await Promise.all([wallet.save(), transactionDetails.save()]);
        }
    } else {
        // Inform the customer their payment was unsuccessful
        transactionDetails.status = "failed";
        await transactionDetails.save();

    }

    res.status(200).end()
});

// Admin =>/api/v1/admin/cashouts
exports.allWithdrawals = catchAsyncErrors(async(req, res, next)=>{
    let withdrawals = await Cashout.find().sort({createdAt: -1})

    res.status(200).json({
        success: true,
        withdrawals
    })
})