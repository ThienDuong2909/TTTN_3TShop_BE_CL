const express = require('express');
const TrangThaiDatHangNCCController = require('../controllers/TrangThaiDatHangNCCController');
// const authenticateJWT = require('../middlewares/jwt');
// const authorize = require('../middlewares/authorize');

const router = express.Router();

// Lấy tất cả trạng thái đơn đặt hàng
router.get('/', TrangThaiDatHangNCCController.getAll);
// Lấy trạng thái đơn đặt hàng theo id
router.get('/:id', TrangThaiDatHangNCCController.getById);
// Thêm trạng thái đơn đặt hàng
router.post('/', /*authenticateJWT, authorize('Admin'),*/ TrangThaiDatHangNCCController.create);
// Sửa trạng thái đơn đặt hàng
router.put('/:id', /*authenticateJWT, authorize('Admin'),*/ TrangThaiDatHangNCCController.update);
// Xóa trạng thái đơn đặt hàng
router.delete('/:id', /*authenticateJWT, authorize('Admin'),*/ TrangThaiDatHangNCCController.delete);

module.exports = router; 