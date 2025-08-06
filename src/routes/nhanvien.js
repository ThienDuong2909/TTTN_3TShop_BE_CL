const express = require('express');
const NhanVienController = require('../controllers/NhanVienController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

// === AUTHENTICATED ROUTES ===
router.use(authenticateJWT);

// === ROUTES CHO TÍNH NĂNG PHÂN CÔNG GIAO HÀNG ===
// Tìm nhân viên giao hàng tối ưu
router.post('/delivery/find-optimal', authorize('nhanvien.phancong'), NhanVienController.findOptimalDeliveryStaff);

// Lấy danh sách nhân viên giao hàng khả dụng
router.post('/delivery/available', authorize('nhanvien.phancong'), NhanVienController.getAvailableDeliveryStaff);

// Lấy nhân viên giao hàng (bộ phận 11)
router.get('/delivery/list', authorize('nhanvien.xem'), NhanVienController.getNhanVienGiaoHang);

// Lấy thống kê công việc tất cả nhân viên giao hàng
router.get('/delivery/workload', authorize('nhanvien.phancong'), NhanVienController.getDeliveryStaffWorkload);

// Phân công đơn hàng cho nhân viên giao hàng
router.post('/delivery/assign-order', authorize('donhang.phancong_giaohang'), NhanVienController.assignOrderToDeliveryStaff);

// Lấy nhân viên theo bộ phận
router.get('/department/:maBoPhan', authorize('nhanvien.xem'), NhanVienController.getByBoPhan);

// Chuyển bộ phận cho nhân viên
router.post('/transfer', authorize('nhanvien.phancong'), NhanVienController.chuyenBoPhan);

// Lấy tất cả nhân viên
router.get('/', authorize('nhanvien.xem'), NhanVienController.getAll);

// Thêm nhân viên
router.post('/', authorize('nhanvien.phancong'), NhanVienController.create);

// Lấy thống kê công việc của một nhân viên cụ thể
router.get('/delivery/workload/:id', authorize('nhanvien.phancong'), NhanVienController.getDeliveryStaffWorkload);

// Lấy lịch sử làm việc tại các bộ phận của nhân viên
router.get('/:id/department-history', authorize('nhanvien.xem'), NhanVienController.getLichSuBoPhan);

// Lấy nhân viên theo id
router.get('/:id', authorize('nhanvien.xem'), NhanVienController.getById);

// Sửa nhân viên
router.put('/:id', authorize('nhanvien.phancong'), NhanVienController.update);

// Xóa nhân viên
router.delete('/:id', authorize('nhanvien.phancong'), NhanVienController.delete);

module.exports = router;