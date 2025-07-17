const express = require('express');
const controller = require('../controllers/PhieuNhapController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const authenticateJWT = require('../middlewares/jwt');
const authorize = require('../middlewares/authorize');
const router = express.Router();

// Chỉ Admin hoặc NhanVien mới được tạo phiếu nhập
router.post('/', authenticateJWT, authorize('Admin', 'NhanVien'), controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.put('/:id/update-inventory', authenticateJWT, authorize('Admin', 'NhanVien'), controller.updateInventory);
router.post('/excel', authenticateJWT, authorize('Admin', 'NhanVien'), upload.single('file'), controller.importExcel);

module.exports = router; 