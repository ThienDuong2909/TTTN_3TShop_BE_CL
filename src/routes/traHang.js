const express = require('express');
const TraHangController = require('../controllers/TraHangController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

// === CUSTOMER ROUTES (Chỉ khách hàng) ===

// Khách hàng yêu cầu trả hàng
// POST /api/tra-hang/request
// Body: { maDDH: number, lyDo: string }
router.post('/request',
  authenticateJWT,
  authorize('KhachHang'),
  TraHangController.requestReturn
);

// Lấy lịch sử trả hàng của khách hàng
// GET /api/tra-hang/history?page=1&limit=10
router.get('/history',
  authenticateJWT,
  authorize('KhachHang'),
  TraHangController.getCustomerReturnHistory
);

// === EMPLOYEE ROUTES (Chỉ nhân viên) ===

// Lấy danh sách yêu cầu trả hàng
// GET /api/tra-hang/requests?page=1&limit=10&status=pending
router.get('/requests',
  authenticateJWT,
  authorize('NhanVienBanHang', 'Admin'),
  TraHangController.getReturnRequests
);

// Tạo phiếu trả hàng
// POST /api/tra-hang/slip
// Body: { maDDH: number, danhSachSanPham: [{ maCTDDH: number, soLuongTra: number }], lyDo: string, trangThaiPhieu?: number }
router.post('/slip',
  authenticateJWT,
  authorize('NhanVienCuaHang', 'Admin', 'KhachHang'),
  TraHangController.createReturnSlip
);

// Tạo phiếu chi cho phiếu trả hàng
// POST /api/return/payment
// Body: { maPhieuTra: number, soTien: number }
router.post('/payment',
  authenticateJWT,
  authorize('NhanVienCuaHang', 'Admin'),
  TraHangController.createPaymentSlip
);

// Duyệt phiếu trả hàng
// PUT /api/tra-hang/slip/:maPhieuTra/approve
// Body: { trangThaiPhieu: number, lyDoDuyet?: string }
router.put('/slip/:maPhieuTra/approve',
  authenticateJWT,
  authorize('NhanVienCuaHang', 'Admin'),
  TraHangController.approveReturnSlip
);

// Lấy chi tiết phiếu trả hàng
// GET /api/tra-hang/slip/:id
router.get('/slip/:id',
  authenticateJWT,
  authorize('NhanVienCuaHang', 'Admin'),
  TraHangController.getReturnSlipDetail
);

// Lấy danh sách phiếu trả hàng
// GET /api/tra-hang/slips?page=1&limit=10&fromDate=2025-01-01&toDate=2025-12-31
router.get('/slips',
  authenticateJWT,
  authorize('NhanVienCuaHang', 'Admin'),
  TraHangController.getReturnSlips
);

// Lấy chi tiết phiếu chi theo mã phiếu trả hàng
// GET /api/tra-hang/payment/:maPhieuTra
router.get('/payment/:maPhieuTra',
  authenticateJWT,
  authorize('NhanVienCuaHang', 'Admin'),
  TraHangController.getPaymentSlipByReturnSlip
);

// Lấy danh sách phiếu chi
// GET /api/tra-hang/payments?page=1&limit=10&fromDate=2025-01-01&toDate=2025-12-31
router.get('/payments',
  authenticateJWT,
  authorize('NhanVienCuaHang', 'Admin'),
  TraHangController.getPaymentSlips
);

module.exports = router;
