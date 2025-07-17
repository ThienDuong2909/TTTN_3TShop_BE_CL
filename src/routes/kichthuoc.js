const express = require('express');
const KichThuocController = require('../controllers/KichThuocController');
// const authenticateJWT = require('../middlewares/jwt');
// const authorize = require('../middlewares/authorize');

const router = express.Router();

// Lấy tất cả kích thước
router.get('/', KichThuocController.getAll);
// Lấy kích thước theo id
router.get('/:id', KichThuocController.getById);
// Thêm kích thước
router.post('/', /*authenticateJWT, authorize('Admin'),*/ KichThuocController.create);
// Sửa kích thước
router.put('/:id', /*authenticateJWT, authorize('Admin'),*/ KichThuocController.update);
// Xóa kích thước
router.delete('/:id', /*authenticateJWT, authorize('Admin'),*/ KichThuocController.delete);

module.exports = router; 