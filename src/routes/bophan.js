const express = require('express');
const BoPhanController = require('../controllers/BoPhanController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

// === PUBLIC ROUTES (Chỉ cần đăng nhập) ===
// Lấy tất cả bộ phận - chỉ cần đăng nhập
router.get('/', authenticateJWT, BoPhanController.getAll);

// Lấy bộ phận theo id - chỉ cần đăng nhập
router.get('/:id', authenticateJWT, BoPhanController.getById);

// === ADMIN ROUTES ===
// Thêm bộ phận - chỉ Admin
router.post('/', 
  authenticateJWT, 
  authorize('Admin'), 
  BoPhanController.create);

// Sửa bộ phận - chỉ Admin
router.put('/:id', 
  authenticateJWT, 
  authorize('Admin'), 
  BoPhanController.update);

// Xóa bộ phận - chỉ Admin
router.delete('/:id', 
  authenticateJWT, 
  authorize('Admin'), 
  BoPhanController.delete);

module.exports = router;
