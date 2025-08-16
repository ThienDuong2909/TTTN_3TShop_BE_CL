const express = require('express');
const KichThuocController = require('../controllers/KichThuocController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

// === PUBLIC ROUTES (Không cần đăng nhập) ===
router.get('/', KichThuocController.getAll);
router.get('/:id', KichThuocController.getById);

// === AUTHENTICATED ROUTES ===
router.use(authenticateJWT);

// Thêm kích thước
router.post('/', authorize('kichthuoc.tao'), KichThuocController.create);

// Sửa kích thước
router.put('/:id', authorize('kichthuoc.sua'), KichThuocController.update);

// Xóa kích thước
router.delete('/:id', authorize('kichthuoc.xoa'), KichThuocController.delete);

module.exports = router; 