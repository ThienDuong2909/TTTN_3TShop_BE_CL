const express = require('express');
const TraHangController = require('../controllers/TraHangController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

// === AUTHENTICATED ROUTES ===
router.use(authenticateJWT);

// === CUSTOMER ROUTES ===
// Khách hàng yêu cầu trả hàng
router.post('/request', authorize('thongtin.xem'), TraHangController.requestReturn);

// Lấy lịch sử trả hàng của khách hàng
router.get('/history', authorize('thongtin.xem'), TraHangController.getCustomerReturnHistory);

// === EMPLOYEE ROUTES ===
// Lấy danh sách yêu cầu trả hàng
router.get('/requests', authorize('toanquyen'), TraHangController.getReturnRequests);

// Tạo phiếu trả hàng
router.post('/slip', authorize('toanquyen'), TraHangController.createReturnSlip);

// Tạo phiếu chi cho phiếu trả hàng
router.post('/payment', authorize('toanquyen'), TraHangController.createPaymentSlip);

// Duyệt phiếu trả hàng
// PUT /api/tra-hang/slip/:maPhieuTra/approve
// Body: { trangThaiPhieu: number, lyDoDuyet?: string }
router.put('/slip/:maPhieuTra/approve',
  authenticateJWT,
  authorize('toanquyen'),
  TraHangController.approveReturnSlip
);

// Lấy chi tiết phiếu trả hàng
router.get('/slip/:id', authorize('toanquyen'), TraHangController.getReturnSlipDetail);

// Lấy danh sách phiếu trả hàng
router.get('/slips', authorize('toanquyen'), TraHangController.getReturnSlips);

// Lấy chi tiết phiếu chi theo mã phiếu trả hàng
router.get('/payment/:maPhieuTra', authorize('toanquyen'), TraHangController.getPaymentSlipByReturnSlip);

// Lấy danh sách phiếu chi
router.get('/payments', authorize('toanquyen'), TraHangController.getPaymentSlips);

module.exports = router;
