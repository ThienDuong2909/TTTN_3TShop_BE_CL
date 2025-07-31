const express = require('express');
const NhanVienController = require('../controllers/NhanVienController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize, checkPermission } = require('../middlewares/authorize');

const router = express.Router();

// === ROUTES CHO TÍNH NĂNG PHÂN CÔNG GIAO HÀNG (đặt trước các route động) ===
// Tìm nhân viên giao hàng tối ưu
router.post('/delivery/find-optimal', NhanVienController.findOptimalDeliveryStaff);
// Lấy danh sách nhân viên giao hàng khả dụng
router.post('/delivery/available', NhanVienController.getAvailableDeliveryStaff);
// Lấy nhân viên giao hàng (bộ phận 11)
router.get('/delivery/list', NhanVienController.getNhanVienGiaoHang);
// Lấy thống kê công việc tất cả nhân viên giao hàng
router.get('/delivery/workload', NhanVienController.getDeliveryStaffWorkload);
// Phân công đơn hàng cho nhân viên giao hàng
router.post('/delivery/assign-order', NhanVienController.assignOrderToDeliveryStaff);

// Lấy nhân viên theo bộ phận
router.get('/department/:maBoPhan', NhanVienController.getByBoPhan);

// Chuyển bộ phận cho nhân viên
router.post('/transfer', NhanVienController.chuyenBoPhan);

// Lấy tất cả nhân viên
router.get('/', NhanVienController.getAll);

// Thêm nhân viên - chỉ admin
router.post('/', 
    // authenticateJWT, authorize('Admin'), 
NhanVienController.create);

// Lấy thống kê công việc của một nhân viên cụ thể (đặt trước route /:id)
router.get('/delivery/workload/:id', NhanVienController.getDeliveryStaffWorkload);

// Lấy lịch sử làm việc tại các bộ phận của nhân viên
router.get('/:id/department-history', NhanVienController.getLichSuBoPhan);

// Lấy nhân viên theo id (đặt cuối cùng vì có path động)
router.get('/:id', NhanVienController.getById);

// Sửa nhân viên - chỉ admin
router.put('/:id', 
    // authenticateJWT, authorize('Admin'), 
NhanVienController.update);

// Xóa nhân viên
router.delete('/:id', /*authenticateJWT, authorize('Admin'),*/ NhanVienController.delete);

module.exports = router;