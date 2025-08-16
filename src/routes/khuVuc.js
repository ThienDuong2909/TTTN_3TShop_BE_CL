const express = require('express');
const router = express.Router();
const KhuVucController = require('../controllers/KhuVucController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

// Lấy danh sách khu vực (Public - có thể xem để chọn khu vực giao hàng)
router.get('/', KhuVucController.getAll);

// Lấy khu vực có sẵn (chưa có nhân viên phụ trách)
router.get('/available', 
  authenticateJWT,
  authorize('Admin', 'NhanVienCuaHang'),
  KhuVucController.getAvailableAreas
);

// Lấy khu vực theo mã
router.get('/:id', KhuVucController.getById);

// Tạo khu vực mới (chỉ Admin)
router.post('/', 
  authenticateJWT,
  authorize('Admin'),
  KhuVucController.create
);

// Cập nhật khu vực (chỉ Admin)
router.put('/:id', 
  authenticateJWT,
  authorize('Admin'),
  KhuVucController.update
);

// Xóa khu vực (chỉ Admin)
router.delete('/:id', 
  authenticateJWT,
  authorize('Admin'),
  KhuVucController.delete
);

module.exports = router;
