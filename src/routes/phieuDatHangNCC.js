const express = require('express');
const controller = require('../controllers/PhieuDatHangNCCController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

// === AUTHENTICATED ROUTES ===
router.use(authenticateJWT);

// Tạo phiếu đặt hàng NCC
router.post('/', authorize('dathang.tao'), controller.create);

// Lấy tất cả phiếu đặt hàng NCC
router.get('/', authorize('dathang.xem'), controller.getAll);

// Lấy phiếu đặt hàng có thể nhập
router.get('/available-for-receipt', authorize('dathang.xem'), controller.getAvailableForReceipt);

// Lấy phiếu đặt hàng theo ID
router.get('/:id', authorize('dathang.xem'), controller.getById);

// Lấy thông tin để nhập hàng
router.get('/:id/for-receipt', authorize('dathang.xem'), controller.getForReceipt);

// Lấy trạng thái đã nhập
router.get('/:id/received-status', authorize('dathang.xem'), controller.getReceivedStatusByPDH);

// Cập nhật phiếu đặt hàng
router.put('/:id', authorize('dathang.sua'), controller.update);

// Cập nhật trạng thái
router.put('/:id/status', authorize('dathang.sua'), controller.updateStatus);

// Cập nhật ngày kiến nghị giao
router.put('/:id/ngay-kien-nghi-giao', authorize('dathang.sua'), controller.updateNgayKienNghiGiao);

// Tải Excel
router.get('/:id/download-excel', authorize('dathang.xem'), controller.downloadExcel);

// Lấy thông tin Excel
router.get('/:id/excel-info', authorize('dathang.xem'), controller.getExcelInfo);

module.exports = router; 