const express = require('express');
const TrangThaiDatHangNCCController = require('../controllers/TrangThaiDatHangNCCController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

// === AUTHENTICATED ROUTES ===
router.use(authenticateJWT);

// Lấy tất cả trạng thái đơn đặt hàng
router.get('/', authorize('dathang.xem'), TrangThaiDatHangNCCController.getAll);

// Lấy trạng thái đơn đặt hàng theo id
router.get('/:id', authorize('dathang.xem'), TrangThaiDatHangNCCController.getById);

// Thêm trạng thái đơn đặt hàng
router.post('/', authorize('dathang.tao'), TrangThaiDatHangNCCController.create);

// Sửa trạng thái đơn đặt hàng
router.put('/:id', authorize('dathang.sua'), TrangThaiDatHangNCCController.update);

// Xóa trạng thái đơn đặt hàng
router.delete('/:id', authorize('dathang.xoa'), TrangThaiDatHangNCCController.delete);

module.exports = router; 