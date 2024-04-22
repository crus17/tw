const express = require('express');
const router = express.Router();

const { whatsApp, whatsAppVerify } = require('../controllers/whatsAppWebhook');

router.route('/webhooks/whatsapp')
        .get(whatsAppVerify)
        .post(whatsApp);

module.exports = router