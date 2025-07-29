const express = require('express');
const TrangThaiDHController = require('../controllers/TrangThaiDHController');
const authenticateJWT = require('../middlewares/jwt');
const authorize = require('../middlewares/authorize');

const router = express.Router();

// Lấy tất cả trạng thái đơn hàng
router.get('/', TrangThaiDHController.getAll);

// Lấy trạng thái đơn hàng theo ID
router.get('/:id', TrangThaiDHController.getById);

// Tạo trạng thái đơn hàng mới
// Body: { TrangThai: string, Note?: string }
router.post('/', 
  authenticateJWT, 
  authorize('Admin'), 
  TrangThaiDHController.create
);

// Cập nhật trạng thái đơn hàng
// Body: { TrangThai?: string, Note?: string }
router.put('/:id', 
  authenticateJWT, 
  authorize('Admin'), 
  TrangThaiDHController.update
);

// Xóa trạng thái đơn hàng
router.delete('/:id', 
  authenticateJWT, 
  authorize('Admin'), 
  TrangThaiDHController.delete
);

module.exports = router;
