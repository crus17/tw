exports.updateProjectProgress = async () => {
  try {
    const sevenDaysFromNow = new Date().setDate(new Date().getDate() + 7);
    const currentDate = new Date();

    const projectsToUpdate = await Project.find({ endAt: { $lte: sevenDaysFromNow }, status: 'in progress' })
      .populate('punter', 'username')
      .populate('contributors.user', 'username')
      .select('+punterSettlement');

    const updatedProjects = await Promise.all(projectsToUpdate.map(async (project) => {
      const tickets = await Ticket.find({ projectId: project._id });
      const isTicketInProgress = tickets.some(ticket => ticket.status === 'in progress');

      if (!isTicketInProgress && shouldRoundUpProject(project, currentDate)) {
        await handleProjectCompletion(project, tickets);
        return project.save();
      }

      return project;
    }));

    const pendingProjectsToUpdate = await Project.find({ startAt: { $lte: currentDate }, status: 'pending' });
    const updatedPendingProjects = await Promise.all(pendingProjectsToUpdate.map(async (project) => {
      project.status = 'in progress';
      return project.save();
    }));

    return `${updatedProjects.length} running projects and ${updatedPendingProjects.length} pending projects updated`;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

function shouldRoundUpProject(project, currentDate) {
  const supposedEndDate = new Date(project.endAt);
  supposedEndDate.setDate(supposedEndDate.getDate() - project.progressiveSteps);
  const projectRoundingUp = currentDate > supposedEndDate &&
    (!project.progressiveStaking || (project.stats.lossStreakCount === 0 || project.stats.lossStreakCount > project.progressiveSteps));
  return projectRoundingUp;
}

async function handleProjectCompletion(project, tickets) {
  const contributedAmount = project.contributors.reduce((amount, contributor) => amount + contributor.amount, 0);

  if (tickets.length === 0) {
    await handleNoEngagementProject(project, contributedAmount);
  } else {
    await settleProject(project, tickets, contributedAmount);
  }
}

async function handleNoEngagementProject(project, contributedAmount) {
  project.status = 'no engagement';
  project.availableBalance = 0;

  await Promise.all(project.contributors.map(async (contributor) => {
    if (contributor.status !== 'settled') {
      await creditWalletAndNotifyUser(contributor.amount, project, contributor);
      contributor.status = 'settled' //---
    }
  }));

  await creditWalletAndNotifyUser(contributedAmount, project, project.punter);
}

async function settleProject(project, tickets, contributedAmount) {
  const projectCurrentBalance = calculateProjectBalance(project, tickets, contributedAmount);
  const profit = projectCurrentBalance - contributedAmount;
  project.status = profit > 0 ? 'successful' : 'failed';

  const { platformCommission, punterCommission, contributorsCommission } = calculateCommissions(project, profit);
  await settleContributors(project, contributorsCommission);
  await settlePunter(project, punterCommission);

  project.punterSettlement = 'completed';
  project.availableBalance = 0;
  project.roi = profit;
}

function calculateProjectBalance(project, tickets, contributedAmount) {
  // Calculation logic for project balance
}

function calculateCommissions(project, profit) {
  // Calculation logic for commissions
}

async function settleContributors(project, contributorsCommission) {
  // Settlement logic for contributors
}

async function settlePunter(project, punterCommission) {
  // Settlement logic for punter
}

async function creditWalletAndNotifyUser(amount, project, user) {
  // Credit wallet and send notification to user

  await creditWallet(amount, `Investment capital and returns. Project: ${project.uniqueId}`, user._id);
  contributor.status = 'settled';
  
  // Send notification to contributor about refund
  await ProjectNoEngagementNotification({
    username: contributor.user.username,
    userId: contributor.user._id,
    projectId: project.uniqueId,
    contributedAmount: contributor.amount,
  })
}
