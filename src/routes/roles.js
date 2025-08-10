const express = require('express');
const router = express.Router();
const PhanQuyenController = require('../controllers/PhanQuyenController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

// Tất cả routes đều yêu cầu xác thực
router.use(authenticateJWT);

// Lấy tất cả vai trò (chỉ admin)
// Endpoint: GET /api/roles
router.get('/', authorize('toanquyen'), PhanQuyenController.getAllRoles);

// Cập nhật quyền cho vai trò (chỉ admin)
// Endpoint: PUT /api/roles/{roleId}/permissions
router.put('/:roleId/permissions', authorize('toanquyen'), PhanQuyenController.updateRolePermissions);

module.exports = router;
