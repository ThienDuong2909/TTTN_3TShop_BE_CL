const express = require('express');
const TrangThaiDHController = require('../controllers/TrangThaiDHController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize, checkPermission } = require('../middlewares/authorize');

const router = express.Router();

// === PUBLIC ROUTES (Chỉ cần đăng nhập) ===
// Lấy tất cả trạng thái đơn hàng - chỉ cần đăng nhập
router.get('/', authenticateJWT, TrangThaiDHController.getAll);

// Lấy trạng thái đơn hàng theo ID - chỉ cần đăng nhập
router.get('/:id', authenticateJWT, TrangThaiDHController.getById);

// === ADMIN ROUTES ===
// Tạo trạng thái đơn hàng mới - chỉ Admin
// Body: { TrangThai: string, Note?: string }
router.post('/', 
  authenticateJWT, 
  authorize('Admin'), 
  TrangThaiDHController.create
);

// Cập nhật trạng thái đơn hàng - chỉ Admin
// Body: { TrangThai?: string, Note?: string }
router.put('/:id', 
  authenticateJWT, 
  authorize('Admin'), 
  TrangThaiDHController.update
);

// Xóa trạng thái đơn hàng - chỉ Admin
router.delete('/:id', 
  authenticateJWT, 
  authorize('Admin'), 
  TrangThaiDHController.delete
);

module.exports = router;
