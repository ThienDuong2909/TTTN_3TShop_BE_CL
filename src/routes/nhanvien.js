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

module.exports = router; 