const express = require('express');
const router = express.Router();

const {
    walletBalance,
    processPayment, 
    sendStripeApiKey, 
    flwPaymentCallback, 
    flwPaymentWebhook, 
    flwPayment,
    walletTransactions,
    flwVerifyAccount,
    flwGetAllBanks,
    cashout,
    allWithdrawals
} = require('../controllers/paymentController')

const { isAuthenticatedUser } = require('../midllewares/auth');

router.route('/payment/process').post(isAuthenticatedUser, processPayment)
router.route('/banks').get(isAuthenticatedUser, flwGetAllBanks);
router.route('/verify/account').post(isAuthenticatedUser, flwVerifyAccount);
router.route('/fund/cashout').post(isAuthenticatedUser, cashout);
router.route('/stripeapi').get(isAuthenticatedUser, sendStripeApiKey)

router.route('/wallet').get(isAuthenticatedUser, walletBalance);
router.route('/transactions').get(isAuthenticatedUser, walletTransactions);
router.route('/flwpayment/process').post(isAuthenticatedUser, flwPayment);
router.route('/flwpayment/callback').get(isAuthenticatedUser, flwPaymentCallback);
router.route('/flwpayment/webhook').get(flwPaymentWebhook);

router.route('/admin/withdrawals').get(/*isAuthenticatedUser, */allWithdrawals);

module.exports = router;