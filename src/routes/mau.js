const express = require('express');
const MauController = require('../controllers/MauController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

// === PUBLIC ROUTES (Chỉ cần đăng nhập) ===
// Lấy tất cả màu - chỉ cần đăng nhập
router.get('/', authenticateJWT, MauController.getAll);

// Lấy màu theo id - chỉ cần đăng nhập
router.get('/:id', authenticateJWT, MauController.getById);

// === ADMIN & NHÂN VIÊN CỬA HÀNG ROUTES ===
// Thêm màu - chỉ Admin và Nhân viên cửa hàng
router.post('/', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  MauController.create);

// Sửa màu - chỉ Admin và Nhân viên cửa hàng
router.put('/:id', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  MauController.update);

// Xóa màu - chỉ Admin và Nhân viên cửa hàng
router.delete('/:id', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  MauController.delete);

module.exports = router; 