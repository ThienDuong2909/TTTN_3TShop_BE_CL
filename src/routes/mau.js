const express = require('express');
const MauController = require('../controllers/MauController');
// const authenticateJWT = require('../middlewares/jwt');
// const authorize = require('../middlewares/authorize');

const router = express.Router();

// Lấy tất cả màu
router.get('/', MauController.getAll);
// Lấy màu theo id
router.get('/:id', MauController.getById);
// Thêm màu
router.post('/', /*authenticateJWT, authorize('Admin'),*/ MauController.create);
// Sửa màu
router.put('/:id', /*authenticateJWT, authorize('Admin'),*/ MauController.update);
// Xóa màu
router.delete('/:id', /*authenticateJWT, authorize('Admin'),*/ MauController.delete);

module.exports = router; 