const express = require('express');
const NhaCungCapController = require('../controllers/NhaCungCapController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

// === PUBLIC ROUTES (Chỉ cần đăng nhập) ===
// Lấy tất cả nhà cung cấp - chỉ cần đăng nhập
router.get('/', authenticateJWT, NhaCungCapController.getAll);
router.get('/get-all', authenticateJWT, NhaCungCapController.getAll);

// Lấy nhà cung cấp theo id - chỉ cần đăng nhập
router.get('/:id', authenticateJWT, NhaCungCapController.getById);

// === ADMIN & NHÂN VIÊN CỬA HÀNG ROUTES ===
// Thêm nhà cung cấp - chỉ Admin và Nhân viên cửa hàng
router.post('/', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  NhaCungCapController.create);

// Sửa nhà cung cấp - chỉ Admin và Nhân viên cửa hàng
router.put('/:id', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  NhaCungCapController.update);

// Xóa nhà cung cấp - chỉ Admin và Nhân viên cửa hàng
router.delete('/:id', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  NhaCungCapController.delete);

module.exports = router; 