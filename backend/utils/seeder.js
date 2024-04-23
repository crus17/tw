const Bank = require("../models/bank");
const Badge = require("../models/badge");

const dotenv = require("dotenv");
const connectDatabase = require("../config/database");

const banks = require("../data/banks.json");
const badges = require("../data/badges.json");
const { connect } = require("mongoose");
const sendSMS = require("./sendSMS");
const { accountDisabledEmailTemplate } = require("./emailTemplates");
const sendEmail = require("./sendEmail");

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


const accountVeritificationTestEmail = async (email) => {

  const subject = 'Account Disabled'
  const link = `${process.env.FRONTEND_URL}/account/verify?email=${email}`
  const message = accountDisabledEmailTemplate(subject, link)

  await sendEmail({
    email,
    subject,
    message
  })

  process.exit()
}

accountVeritificationTestEmail('ekeuwei@gmail.com')
// seedBadges();
// seedBanks();
