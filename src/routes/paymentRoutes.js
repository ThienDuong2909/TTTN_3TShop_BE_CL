const express = require('express');
const router = express.Router();
const payOSController = require('../controllers/payOSController');

// Create payment link - Tạo link thanh toán cho khách hàng
router.post('/payos/create-payment-link/:maKH', payOSController.createPaymentLink);

// Webhook
router.post('/payos/webhook', payOSController.handleWebhook);

module.exports = router;
