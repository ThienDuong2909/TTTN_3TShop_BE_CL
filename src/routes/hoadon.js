const express = require('express');
const HoaDonController = require('../controllers/HoaDonController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

// === AUTHENTICATED ROUTES ===
router.use(authenticateJWT);

// Tạo hóa đơn mới
router.post('/', authorize('hoadon.tao'), HoaDonController.createInvoice);

// Lấy chi tiết hóa đơn theo số hóa đơn
router.get('/detail/:soHD', authorize('hoadon.xem'), HoaDonController.getHoaDonDetail);

// Lấy hóa đơn theo mã đơn hàng
router.get('/order/:maDDH', authorize('hoadon.xem'), HoaDonController.getHoaDonByOrderId);

// Lấy danh sách hóa đơn (có phân trang và tìm kiếm)
router.get('/', authorize('hoadon.xem'), HoaDonController.getAllHoaDon);

module.exports = router;
