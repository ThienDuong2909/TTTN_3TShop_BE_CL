const express = require('express');
const NhanVienController = require('../controllers/NhanVienController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize, checkPermission } = require('../middlewares/authorize');

const router = express.Router();

// === ROUTES CHO TÍNH NĂNG PHÂN CÔNG GIAO HÀNG (đặt trước các route động) ===
// Tìm nhân viên giao hàng tối ưu - chỉ Admin và Nhân viên cửa hàng
router.post('/delivery/find-optimal', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  NhanVienController.findOptimalDeliveryStaff);

// Lấy danh sách nhân viên giao hàng khả dụng - chỉ Admin và Nhân viên cửa hàng
router.post('/delivery/available', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  NhanVienController.getAvailableDeliveryStaff);

// Lấy nhân viên giao hàng (bộ phận 11) - chỉ cần đăng nhập
router.get('/delivery/list', 
  authenticateJWT, 
  NhanVienController.getNhanVienGiaoHang);

// Lấy thống kê công việc tất cả nhân viên giao hàng - chỉ Admin và Nhân viên cửa hàng
router.get('/delivery/workload', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  NhanVienController.getDeliveryStaffWorkload);

// Phân công đơn hàng cho nhân viên giao hàng - chỉ Admin và Nhân viên cửa hàng
router.post('/delivery/assign-order', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  NhanVienController.assignOrderToDeliveryStaff);

// Lấy nhân viên theo bộ phận - chỉ cần đăng nhập
router.get('/department/:maBoPhan', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'),
  NhanVienController.getByBoPhan);

// Chuyển bộ phận cho nhân viên - chỉ Admin
router.post('/transfer', 
  authenticateJWT, 
  authorize('Admin'), 
  NhanVienController.chuyenBoPhan);

// Lấy tất cả nhân viên - chỉ cần đăng nhập
router.get('/', 
  authenticateJWT, 
  authorize('Admin'),
  NhanVienController.getAll);

// Thêm nhân viên - chỉ Admin
router.post('/', 
  authenticateJWT, 
  authorize('Admin'), 
  NhanVienController.create);

// Lấy thống kê công việc của một nhân viên cụ thể - chỉ Admin và Nhân viên cửa hàng
router.get('/delivery/workload/:id', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  NhanVienController.getDeliveryStaffWorkload);

// Lấy lịch sử làm việc tại các bộ phận của nhân viên - chỉ cần đăng nhập
router.get('/:id/department-history', 
  authenticateJWT,
  authorize('Admin'),
  NhanVienController.getLichSuBoPhan);

// Lấy nhân viên theo id - chỉ cần đăng nhập
router.get('/:id', 
  authenticateJWT, 
  NhanVienController.getById);

// Sửa nhân viên - chỉ Admin
router.put('/:id', 
  authenticateJWT, 
  authorize('Admin'), 
  NhanVienController.update);

// Xóa nhân viên - chỉ Admin
router.delete('/:id', 
  authenticateJWT, 
  authorize('Admin'), 
  NhanVienController.delete);

module.exports = router;