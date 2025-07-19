const express = require('express');
const NhaCungCapController = require('../controllers/NhaCungCapController');
// const authenticateJWT = require('../middlewares/jwt');
// const authorize = require('../middlewares/authorize');

const router = express.Router();

// Lấy tất cả nhà cung cấp
router.get('/', NhaCungCapController.getAll);
// Lấy nhà cung cấp theo id
router.get('/:id', NhaCungCapController.getById);
// Thêm nhà cung cấp
router.post('/', /*authenticateJWT, authorize('Admin'),*/ NhaCungCapController.create);
// Sửa nhà cung cấp
router.put('/:id', /*authenticateJWT, authorize('Admin'),*/ NhaCungCapController.update);
// Xóa nhà cung cấp
router.delete('/:id', /*authenticateJWT, authorize('Admin'),*/ NhaCungCapController.delete);

module.exports = router; 