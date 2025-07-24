const express = require('express');
const controller = require('../controllers/PhieuDatHangNCCController');
const authenticateJWT = require('../middlewares/jwt');
const authorize = require('../middlewares/authorize');
const router = express.Router();

// Áp dụng cho tất cả endpoint
router.use(authenticateJWT, authorize('Admin', 'NhanVien'));

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/available-for-receipt', controller.getAvailableForReceipt);
router.get('/:id', controller.getById);
router.get('/:id/for-receipt', controller.getForReceipt);
router.get('/:id/received-status', controller.getReceivedStatusByPDH);
router.put('/:id/status', controller.updateStatus);

module.exports = router; 