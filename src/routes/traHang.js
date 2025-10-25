const express = require('express');
const TraHangController = require('../controllers/TraHangController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

// === AUTHENTICATED ROUTES ===
router.use(authenticateJWT);

// === CUSTOMER ROUTES ===
// Khách hàng yêu cầu trả hàng
router.post('/request', authorize("phieuchi.tao", "trahang.duyet"), TraHangController.requestReturn);

// Lấy lịch sử trả hàng của khách hàng
router.get('/history', authorize('thongtin.xem', "trahang.duyet"), TraHangController.getCustomerReturnHistory);

// === EMPLOYEE ROUTES ===
// Lấy danh sách yêu cầu trả hàng
router.get('/requests', authorize("trahang.duyet"), TraHangController.getReturnRequests);

// Tạo phiếu trả hàng
router.post('/slip', authorize('trahang.tao'), TraHangController.createReturnSlip);

// Tạo phiếu chi cho phiếu trả hàng
router.post('/payment', authorize('phieuchi.tao'), TraHangController.createPaymentSlip);

// Duyệt phiếu trả hàng
// PUT /api/tra-hang/slip/:maPhieuTra/approve
// Body: { trangThaiPhieu: number, lyDoDuyet?: string }
router.put('/slip/:maPhieuTra/approve',
  authenticateJWT,
  authorize("trahang.duyet"),
  TraHangController.approveReturnSlip
);

// Lấy chi tiết phiếu trả hàng
router.get('/slip/:id', authorize('trahang.duyet'), TraHangController.getReturnSlipDetail);

// Lấy danh sách phiếu trả hàng
router.get('/slips', authorize('trahang.duyet'), TraHangController.getReturnSlips);

// Lấy chi tiết phiếu chi theo mã phiếu trả hàng
router.get('/payment/:maPhieuTra', authorize("trahang.duyet"), TraHangController.getPaymentSlipByReturnSlip);

// Lấy danh sách phiếu chi
router.get('/payments', authorize('trahang.duyet'), TraHangController.getPaymentSlips);

module.exports = router;
