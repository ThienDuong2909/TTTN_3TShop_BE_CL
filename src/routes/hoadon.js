const express = require('express');
const HoaDonController = require('../controllers/HoaDonController');
const authenticateJWT = require('../middlewares/jwt');
const authorize = require('../middlewares/authorize');

const router = express.Router();

// Tạo hóa đơn mới (yêu cầu quyền admin hoặc nhân viên)
router.post('/', 
    // authenticateJWT, authorize('Admin', 'NhanVien'),
    HoaDonController.createInvoice);

// Lấy chi tiết hóa đơn theo số hóa đơn
router.get('/detail/:soHD', 
    // authenticateJWT, authorize('Admin', 'NhanVien'),
    HoaDonController.getHoaDonDetail);

// Lấy hóa đơn theo mã đơn hàng
router.get('/order/:maDDH', authenticateJWT, authorize('Admin', 'NhanVien'), HoaDonController.getHoaDonByOrderId);

// Lấy danh sách hóa đơn (có phân trang và tìm kiếm)
router.get('/', authenticateJWT, authorize('Admin', 'NhanVien'), HoaDonController.getAllHoaDon);

module.exports = router;
