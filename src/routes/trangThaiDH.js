const express = require('express');
const TrangThaiDHController = require('../controllers/TrangThaiDHController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

// === AUTHENTICATED ROUTES ===
router.use(authenticateJWT);

// Lấy tất cả trạng thái đơn hàng
router.get('/', authorize('donhang.xem'), TrangThaiDHController.getAll);

// Lấy trạng thái đơn hàng theo ID
router.get('/:id', authorize('donhang.xem'), TrangThaiDHController.getById);

// Tạo trạng thái đơn hàng mới
router.post('/', authorize('toanquyen'), TrangThaiDHController.create);

// Cập nhật trạng thái đơn hàng
router.put('/:id', authorize('toanquyen'), TrangThaiDHController.update);

// Xóa trạng thái đơn hàng
router.delete('/:id', authorize('toanquyen'), TrangThaiDHController.delete);

module.exports = router;
