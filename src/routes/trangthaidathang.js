const express = require('express');
const TrangThaiDatHangNCCController = require('../controllers/TrangThaiDatHangNCCController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

// === PUBLIC ROUTES (Chỉ cần đăng nhập) ===
// Lấy tất cả trạng thái đơn đặt hàng - chỉ cần đăng nhập
router.get('/', authenticateJWT, TrangThaiDatHangNCCController.getAll);

// Lấy trạng thái đơn đặt hàng theo id - chỉ cần đăng nhập
router.get('/:id', authenticateJWT, TrangThaiDatHangNCCController.getById);

// === ADMIN & NHÂN VIÊN CỬA HÀNG ROUTES ===
// Thêm trạng thái đơn đặt hàng - chỉ Admin và Nhân viên cửa hàng
router.post('/', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  TrangThaiDatHangNCCController.create);

// Sửa trạng thái đơn đặt hàng - chỉ Admin và Nhân viên cửa hàng
router.put('/:id', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  TrangThaiDatHangNCCController.update);

// Xóa trạng thái đơn đặt hàng - chỉ Admin và Nhân viên cửa hàng
router.delete('/:id', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  TrangThaiDatHangNCCController.delete);

module.exports = router; 