const express = require('express');
const NhanVienController = require('../controllers/NhanVienController');
// const authenticateJWT = require('../middlewares/jwt');
// const authorize = require('../middlewares/authorize');

const router = express.Router();

// Lấy tất cả nhân viên
router.get('/', NhanVienController.getAll);
// Lấy nhân viên theo id
router.get('/:id', NhanVienController.getById);
// Thêm nhân viên
router.post('/', /*authenticateJWT, authorize('Admin'),*/ NhanVienController.create);
// Sửa nhân viên
router.put('/:id', /*authenticateJWT, authorize('Admin'),*/ NhanVienController.update);
// Xóa nhân viên
router.delete('/:id', /*authenticateJWT, authorize('Admin'),*/ NhanVienController.delete);
// Chuyển bộ phận cho nhân viên
router.post('/transfer', NhanVienController.chuyenBoPhan);
// Lấy lịch sử làm việc tại các bộ phận của nhân viên
router.get('/:id/department-history', NhanVienController.getLichSuBoPhan);

module.exports = router; 