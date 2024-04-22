const Bank = require("../models/bank");
const Badge = require("../models/badge");

const dotenv = require("dotenv");
const connectDatabase = require("../config/database");

const banks = require("../data/banks.json");
const badges = require("../data/badges.json");
const { connect } = require("mongoose");
const sendSMS = require("./sendSMS");
const Ticket = require("../models/ticket");
const Project = require("../models/project");
const { getTicketStatus, updateProjectProgress } = require("./routineTasks");

// Setting dotenv file
dotenv.config({ path: "backend/config/config.env" });

connectDatabase();


const seedBanks = async () => {
  try {
    await Bank.deleteMany();
    console.log("Banks deleted");

    await Bank.insertMany(banks);
    console.log("All banks are added");

    process.exit();
  } catch (error) {
    console.error(error.message);
    process.exit();
  }
};

const seedBadges = async () => {
  try {
    await Badge.deleteMany();
    console.log("Batches deleted");

    await Badge.insertMany(badges);
    console.log("All badges are added");

    process.exit();
  } catch (error) {
    console.error(error.message);
    process.exit();
  }
};

const updateTickets = async ()=>{
    const tickets = await Ticket.find({status: 'in progress'})

     // Step 2: Manipulate the documents
    const updatedTickets = tickets.map(async (ticket, idx) => {

      let newTicket = await getTicketStatus(ticket)
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

    process.exit(1)
}

const updateProject = async ()=>{
  const response = await updateProjectProgress()
  console.log(response);
  process.exit(1)
}

updateProject();
// seedBadges();
// updateTickets();
// seedBanks();
