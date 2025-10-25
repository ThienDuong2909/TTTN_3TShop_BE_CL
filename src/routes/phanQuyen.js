const express = require('express');
const router = express.Router();
const PhanQuyenController = require('../controllers/PhanQuyenController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

// Tất cả routes đều yêu cầu xác thực
router.use(authenticateJWT);

// Lấy tất cả quyền (chỉ admin)
router.get('/all', authorize('toanquyen'), PhanQuyenController.getAllPermissions);

// Lấy tất cả quyền (alias cho /all)
router.get('/', authorize('toanquyen'), PhanQuyenController.getAllPermissions);

// Lấy quyền theo vai trò (chỉ admin)
router.get('/role/:vaiTroId', authenticateJWT, PhanQuyenController.getPermissionsByRole);

// Cập nhật quyền cho vai trò (chỉ admin)
router.put('/role/:vaiTroId', authorize('toanquyen'), PhanQuyenController.updateRolePermissions);

// Lấy quyền của user hiện tại
router.get('/my-permissions', PhanQuyenController.getCurrentUserPermissions);

// Kiểm tra quyền của user
router.post('/check', PhanQuyenController.checkUserPermission);

// Gán quyền cho một nhân viên (chỉ admin)
router.put('/employee/:nhanVienId', authorize('toanquyen'), PhanQuyenController.assignPermissionsToEmployee);

// Lấy quyền theo nhân viên (chỉ admin)
router.get('/employee/:nhanVienId', PhanQuyenController.getPermissionsByEmployee);

module.exports = router; 