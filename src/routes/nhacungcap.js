const express = require('express');
const NhaCungCapController = require('../controllers/NhaCungCapController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

// === AUTHENTICATED ROUTES ===
router.use(authenticateJWT);

// Lấy tất cả nhà cung cấp
router.get('/', authorize('nhacungcap.xem'), NhaCungCapController.getAll);

// Lấy nhà cung cấp theo id
router.get('/:id', authorize('nhacungcap.xem'), NhaCungCapController.getById);

// Thêm nhà cung cấp
router.post('/', authorize('nhacungcap.tao'), NhaCungCapController.create);

// Sửa nhà cung cấp
router.put('/:id', authorize('nhacungcap.sua'), NhaCungCapController.update);

// Xóa nhà cung cấp
router.delete('/:id', authorize('nhacungcap.xoa'), NhaCungCapController.delete);

module.exports = router; 