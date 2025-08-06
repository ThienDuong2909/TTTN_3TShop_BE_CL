const express = require('express');
const MauController = require('../controllers/MauController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

// === PUBLIC ROUTES (Không cần đăng nhập) ===
router.get('/', MauController.getAll);
router.get('/:id', MauController.getById);

// === AUTHENTICATED ROUTES ===
router.use(authenticateJWT);

// Thêm màu
router.post('/', authorize('mausac.tao'), MauController.create);

// Sửa màu
router.put('/:id', authorize('mausac.sua'), MauController.update);

// Xóa màu
router.delete('/:id', authorize('mausac.xoa'), MauController.delete);

module.exports = router; 