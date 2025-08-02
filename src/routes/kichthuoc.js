const express = require('express');
const KichThuocController = require('../controllers/KichThuocController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

// === PUBLIC ROUTES (Chỉ cần đăng nhập) ===
// Lấy tất cả kích thước - chỉ cần đăng nhập
router.get('/', KichThuocController.getAll);

// Lấy kích thước theo id - chỉ cần đăng nhập
router.get('/:id', KichThuocController.getById);

// === ADMIN & NHÂN VIÊN CỬA HÀNG ROUTES ===
// Thêm kích thước - chỉ Admin và Nhân viên cửa hàng
router.post('/', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  KichThuocController.create);

// Sửa kích thước - chỉ Admin và Nhân viên cửa hàng
router.put('/:id', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  KichThuocController.update);

// Xóa kích thước - chỉ Admin và Nhân viên cửa hàng
router.delete('/:id', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  KichThuocController.delete);

module.exports = router; 