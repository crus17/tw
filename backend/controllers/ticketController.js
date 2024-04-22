const Ticket = require('../models/ticket')
const Project = require('../models/project')
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../midllewares/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures');
const cloudinary = require('cloudinary')
const got = require('got');
const { sporty } = require('../utils/bookies');

// Create new ticket => /api/v1/ticket/new
exports.newTicket = catchAsyncErrors( async (req, res, next) => {
    
    let games;

    const project = await Project.findById(req.body.projectId)

    if(!project){
        return next(new ErrorHandler("Invalid project ID", 403))
    }

    const authorizedPunter = project.punter.equals(req.user._id)

    if(!authorizedPunter){
        return next(new ErrorHandler("Unauthorized action", 403))
    }

    if(project.status !== 'in progress'){
        return next(new ErrorHandler("Project cannot receive tickets", 403))
    }

    // Check if the last ticket was won and the project has reached progressiveSteps - endAt
    const currentDate = new Date().getTime();
    const supposedEndDate = new Date().setDate(project.endAt.getDate() - project.progressiveSteps)
    let tickets = await Ticket.find({ projectId: project._id }).sort({createdAt: -1});
    const wonLastTicket = tickets.length > 0 && tickets[0].status === 'successful'
    if(currentDate < supposedEndDate && wonLastTicket){
        // Cannot stake because we have fewer time remaining to stake
        return next(new ErrorHandler("Project is winding down and cannot receive more tickets.", 403))
    }

    const isTicketInProgress = tickets.some(ticket => !['successful', 'failed'].includes(ticket.status))

    if(isTicketInProgress && project.progressiveStaking){
        return next(new ErrorHandler("Allow the last ticket to conclude before posting a new ticket.", 403))
    }
    
    if(project.availableBalance < parseInt(req.body.stakeAmount)){
        return next(new ErrorHandler("Bankroll too lower! Try lower stake amount", 403))
    }
    
    try {
        switch (req.body.bookie) {
            case "Sporty":
                games = await sporty(req.body.ticketId);
                break;
        
            default:
                return next(new ErrorHandler("Invalid Option Selected", 403))
            }
    } catch (error) {
        return next(new ErrorHandler('Error creating ticket.', 403))
    }

    const threeHoursLater = new Date().getTime() + 3 * 60 * 60 * 1000
    const startTimeLimit = new Date().setHours(18, 0, 0); // 6 PM
    const endTimeLimit = new Date().setHours(8, 0, 0); // 8 AM next day
    
    const allGamesStartThreeHoursLaterAndNotStartingAfterWorkTime = games.every(game => 
        game.time > threeHoursLater // Event starts at least 3 hours from now
        && !(game.time >= startTimeLimit && game.time < endTimeLimit) // Event is not starting between 6 PM and 8 AM next day
        )

    const allGamesStartThreeHoursLater = games.every(game => game.time > threeHoursLater)
    if(!allGamesStartThreeHoursLater){
        // return next(new ErrorHandler("Tickets must be submitted 3 hours before kickoff of all matches.", 403))   
    }
    if(!allGamesStartThreeHoursLaterAndNotStartingAfterWorkTime){
        console.log('Caught a ticket violating work time posting');
        // return next(new ErrorHandler("Please submit a ticket that starts 3 hours from now and does not start our off time!", 403))   
    }

    const totalOdds  = games.reduce((prev, game)=> prev * game.odds, 1)
    const allowedOddsRange = !project.minOdds || project.maxOdds >= totalOdds && totalOdds >= project.minOdds

    if(!allowedOddsRange){
        return next(new ErrorHandler(`Minimum and maximum odds allowed per ticket is [min: ${parseFloat(project.minOdds).toFixed(2)}] and [max:${parseFloat(project.maxOdds).toFixed(2)}]`))
    }

    project.availableBalance -= parseFloat(req.body.stakeAmount)

    await project.save()

    req.body.games = games
    const ticket = await Ticket.create(req.body);

    res.status(201).json({
        success: true,
        message: 'New ticket added succesfully',
        ticket
    });
});


// Get ticket details from bookmaker => /api/v1/bookie/ticket
exports.loadBookieTicket = catchAsyncErrors(async (req, res, next) =>{
    let games;
    try {
        
        switch (req.query.bookie) {
            case "Sporty":
                games = await sporty(req.query.id);
                break;
        
            default:
                return next(new ErrorHandler("Invalid Option Selected", 403))
        }
    } catch (error) {
        
        return next(new ErrorHandler(error.message, 403))   
    }

    

    res.status(200).json({
        success: true,
        games
    })
})

// Get tickets => /api/v1/admin/tickets?=pending
exports.allTickets =  catchAsyncErrors(async (req, res, next)=>{
    let tickets  = await Ticket.find().sort({createdAt: -1})

    res.status(200).json({
        success: true,
        tickets
    })
})


// Upate ticket => /api/v1/admin/ticket/:id
exports.updateTicket = catchAsyncErrors(async (req, res, next) => {
    
    let ticket = await Ticket.findById(req.params.id);

    if(!ticket){
        return next(new ErrorHandler('Ticket Not Found', 404));
    }

    ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        ticket
    })
});

// Delete Ticket
exports.deleteTicket = catchAsyncErrors(async (req, res, next) => {
    let ticket = await Ticket.findById(req.params.id);

    if(!ticket){
        return next(new ErrorHandler('Ticket Not Found', 404));
    }

    await ticket.remove();

    res.status(200).json({
        success: true,
        message: 'Ticket is deleted succesfully'
    });
});

