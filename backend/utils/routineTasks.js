const { sporty } = require('./bookies');
const Ticket = require('../models/ticket');
const Project = require('../models/project');
const User = require('../models/user');
const { creditWallet } = require('../controllers/paymentController');
const logger = require('../config/logger');
const { ProjectCompletionNotification, ProjectNoEngagementNotification } = require('./notifications');
const Wallet = require('../models/wallet');

exports.formatAmount = value => `₦${new Intl.NumberFormat('en-US').format(parseFloat(value.toString().replace(/[^\d.]/g, '')).toFixed(2))}`;

exports.getTicketStatus = async (ticket)=> {

    let liveScores

    switch (ticket.bookie) {
        case 'Sporty':
            liveScores = await sporty(ticket.ticketId)
            break;
    
        default:
            break;
    }

    const updatedGames = ticket.games.map(localGame => {
        let fixture = liveScores.find(liveGame => (/*localGame.time === liveGame.time &&*/ localGame.league === liveGame.league && localGame.homeTeam === liveGame.homeTeam && localGame.awayTeam===liveGame.awayTeam))

        if(fixture){
            localGame.scores = fixture.scores
            localGame.outcome = fixture.outcome
            localGame.matchStatus = fixture.matchStatus
            localGame.status = fixture.status
        }

        return localGame;
    })

    ticket.games = updatedGames

    return ticket;
}

exports.updateTicketProgress_ = async ()=>{
    const tickets = await Ticket.find({status: 'progress'})

    const updatedTickets = tickets.map(async (ticket, idx) => {

      let newTicket = await this.getTicketStatus(ticket)
      ticket.games = newTicket.games

      // Update status
      const matchesConcluded = ticket.games.every(game => game.scores.ft!=='')
      const wonAllMatches = ticket.games.every(game => game.outcome===1)
      ticket.status = matchesConcluded && wonAllMatches?'successful':
                      matchesConcluded && !wonAllMatches? 'failed': ticket.status
      
      if(ticket.status === 'successful'){
        const settlement = ticket.games.reduce((prev, current) => prev*(current.outcome===1?current.odds:1), ticket.stakeAmount)
        const project = await Project.findById(ticket.projectId)
        project.availableBalance += settlement
        await project.save()
      }

      console.log(`ticket ${idx+1} updated`);

      return ticket.save();
    });

    await Promise.all(updatedTickets);

    return `${tickets.length} tickets updated`

}

exports.updateTicketProgress = async () => {
  try {
    // const tickets = await Ticket.find({ status: 'in progress' });
    const tickets = await Ticket.find({ "games.scores.ft": '' });

    const updatedTickets = await Promise.all(tickets.map(async (ticket, idx) => {
      // Get updated ticket status
      const newTicket = await this.getTicketStatus(ticket);
      ticket.games = newTicket.games;

      if(ticket.status === 'in progress'){

        // Update ticket status based on game outcomes
        // const matchesConcluded = ticket.games.every(game => game.scores.ft !== '');
        const matchesConcluded = ticket.games.every(game => game.outcome != undefined);
        const wonAllMatches = ticket.games.every(game => game.outcome === 1);
        const lostAGame = ticket.games.some(game => game.outcome === 0);
        ticket.status = lostAGame ? 'failed' : matchesConcluded? 'successful' : ticket.status;
        // ticket.status = matchesConcluded && wonAllMatches ? 'successful' :
        //   (matchesConcluded && !wonAllMatches) || lostAGame ? 'failed' : ticket.status;
          
        if(ticket.status !== 'in progress'){
          
          // Settlement for successful tickets
          const project = await Project.findById(ticket.projectId);
          if (ticket.status === 'successful') {
            const settlement = ticket.games.reduce((prev, current) => prev * (current.outcome === 1 ? current.odds : 1), ticket.stakeAmount);
            project.availableBalance += settlement;
    
            project.stats.lossStreakCount = 0
            project.stats.highestBalance = Math.max(project.stats.highestBalance, project.availableBalance)
    
          }
          
          if(ticket.status === 'failed'){
            project.stats.lossStreakCount += 1
          }
          
          await project.save();
  
        }
        
      }


      console.log(`Ticket ${idx + 1} updated`);

      return ticket.save();
    }));

    return `${tickets.length} tickets updated`;
  } catch (error) {
    logger.error('Error in updateTicketProgress:', error);
    throw error; // Propagate the error if necessary
  }
};



exports.updateProjectProgress = async () => {
  const sevenDaysFromNow = new Date().setDate(new Date().getDate() + 7)
  const currentDate = new Date();
  
  try {
    const projects = await Project.find({ endAt: { $lte: sevenDaysFromNow }, status: 'in progress' })
                          .populate('punter', 'username')
                          .populate('contributors.user', 'username')
                          .select('+punterSettlement');

    const updatedRunningProjects = await Promise.all(projects.map(async (project) => {
      let tickets = await Ticket.find({ projectId: project._id });
      const isTicketInprogress = tickets.some(ticket => ticket.status === 'in progress');
      
      const supposedEndDate  = (new Date()).setDate(project.endAt.getDate() - project.progressiveSteps)
      const projectRoundingUp = currentDate < supposedEndDate && 
            // Last ticket was successfull or failed or progressiveStaking not applied
            (project.stats.lossStreakCount=== 0 || project.stats.lossStreakCount > project.progressiveSteps)

      if (!isTicketInprogress && projectRoundingUp) {

        const contributedAmount = project.contributors.reduce((amount, contributor) => amount + contributor.amount, 0);
        
        if(tickets.length === 0){
          // Either no value was contributed or punter did not submit ticket
          project.status = 'no engagement'
          project.availableBalance = 0

          if(project.contributors.length > 0){
            // Refund contributed amount
            await Promise.all(project.contributors.map(async (contributor) => {
              if (contributor.status !== 'settled') {

                await creditWallet(contributor.amount, `Investment capital and returns. Project: ${project.uniqueId}`, contributor.user._id);
                contributor.status = 'settled';

                // Send notification to contributor about refund
                await ProjectNoEngagementNotification({
                  username: contributor.user.username,
                  userId: contributor.user._id,
                  projectId: project.uniqueId,
                  contributedAmount: contributor.amount,
                })

                await project.save();
              }
            }));
          }

          // Send No engagement notification to punter
          await ProjectNoEngagementNotification({
            username: project.punter.username,
            userId: project.punter._id,
            projectId: project.uniqueId,
            contributedAmount,
          })

          return project.save()
        }

        const projectCurrentBalance = tickets.reduce((prev, ticket) => {
          // Total odds only calculate odds where the outcome was a success
          const totalOdds = ticket.games.reduce((odds, game) => odds * (game.outcome==1? game.odds : 1), 1);
          const outcome = ticket.status === 'successful' ? (ticket.stakeAmount * totalOdds - ticket.stakeAmount) : -ticket.stakeAmount;
          return prev + outcome;
        }, contributedAmount);

        const profit = projectCurrentBalance - contributedAmount;
        project.status = profit>0?'successful':'failed'
        
        const platformCommission = project.status==='successful'? profit * 0.1 : 0; // 10%
        const punterCommission = project.status==='successful'? profit * 0.2 : 0; // 20%
        const contributorsCommission = profit - platformCommission - punterCommission;
        
        // Settle contributors
        await Promise.all(project.contributors.map(async (contributor) => {
          if (contributor.status !== 'settled') {
            const investmentQuota = contributor.amount / contributedAmount;
            const contributorProfit = contributorsCommission * investmentQuota;
            
            const onePercentContributedAmount = contributedAmount * 0.01
            if(projectCurrentBalance >= onePercentContributedAmount || onePercentContributedAmount >= 100){
              // At least 1% or N100 of contributed amount is remaining
              await creditWallet((contributorProfit + contributor.amount), `Investment capital and returns. Project: ${project.uniqueId}`, contributor.user._id);
              contributor.status = 'settled';

            }else{
              contributor.status = 'settled';
            }

            // Send notification contributor
            await ProjectCompletionNotification({
              username: contributor.user.username,
              userId: contributor.user._id,
              projectId: project.uniqueId,
              contributedAmount: contributor.amount,
              profit: contributorProfit,
            })

            await project.save();
          }
        }));
        
        // Settle punter
        if(project.status === 'successful'){
          await creditWallet(punterCommission, `Project commission. Project: ${project.uniqueId}`, project.punter._id);
        }
        
        project.punterSettlement = 'completed'
        const wallet = await Wallet.findOne({userId: project.punter._id});

        // Send notification to punter
        await ProjectCompletionNotification({
          username: project.punter.username,
          userId: project.punter._id,
          projectId: project.uniqueId,
          commission: punterCommission,
          profit,
          contributedAmount,
          walletBalance: wallet.balance,
        })

        // Settle platform
        // await creditWallet(platformCommission, `Platform commission settlement. Project: ${project.uniqueId}`, 'platform purse');
        
        project.availableBalance = 0
        project.roi = profit
      }


      return project.save();
    }));

    // Update pending projects to 'in progress' when startAt is reached
    const pendingProjects = await Project.find({ startAt: { $lte: currentDate }, status: 'pending' });
    const updatedPendingProjects = await Promise.all(pendingProjects.map(async (project) => {
      project.status = 'in progress';
      return project.save();
    }));

    return `${updatedRunningProjects.length} running projects and ${updatedPendingProjects.length} pending projects updated`;
  } catch (error) {
    logger.error(error);
    throw error; // Propagate the error if necessary
  }
};
