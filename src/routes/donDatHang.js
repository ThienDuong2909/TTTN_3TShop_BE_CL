const express = require('express');
const DonDatHangController = require('../controllers/DonDatHangController');
const authenticateJWT = require('../middlewares/jwt');
const authorize = require('../middlewares/authorize');

const router = express.Router();

// Lấy thống kê đơn hàng theo trạng thái
router.get('/statistics', DonDatHangController.getStatistics);

// Lấy danh sách đơn hàng theo trạng thái
// Query params: status (required), page (optional), limit (optional)
// Example: /don-dat-hang/by-status?status=1&page=1&limit=10
router.get('/by-status', DonDatHangController.getByStatus);

// Lấy tất cả đơn hàng
// Query params: page (optional), limit (optional)
router.get('/', DonDatHangController.getAll);

// Lấy đơn hàng theo khách hàng
// Query params: page (optional), limit (optional)
router.get('/customer/:customerId', DonDatHangController.getByCustomer);

// Lấy thông tin chi tiết đầy đủ của đơn hàng theo ID
router.get('/:id/detail', DonDatHangController.getDetailById);

// Lấy chi tiết đơn hàng theo ID (basic)
router.get('/:id', DonDatHangController.getById);

// Cập nhật trạng thái nhiều đơn hàng cùng lúc
// Body: { orders: [{ id: number, maTTDH: number, maNVDuyet?: number, maNVGiao?: number }] }
router.put('/batch/status', 
  // authenticateJWT, 
  // authorize('Admin', 'NhanVien'), 
  DonDatHangController.updateBatchStatus
);

// Cập nhật nhân viên giao hàng cho đơn hàng
// Body: { maNVGiao: number }
router.put('/:id/delivery-staff', 
  // authenticateJWT, 
  // authorize('Admin', 'NhanVien'), 
  DonDatHangController.updateDeliveryStaff
);

// Cập nhật trạng thái đơn hàng
// Body: { maTTDH: number, maNVDuyet?: number, maNVGiao?: number }
router.put('/:id/status', 
  // authenticateJWT, 
  // authorize('Admin', 'NhanVien'), 
  DonDatHangController.updateStatus
);


module.exports = router;
