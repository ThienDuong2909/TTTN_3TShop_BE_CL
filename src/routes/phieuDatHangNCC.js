const express = require('express');
const controller = require('../controllers/PhieuDatHangNCCController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize, checkPermission } = require('../middlewares/authorize');
const router = express.Router();

// Áp dụng cho tất cả endpoint - chỉ Admin và Nhân viên cửa hàng
router.use(authenticateJWT, authorize('Admin', 'NhanVienCuaHang'));

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/available-for-receipt', controller.getAvailableForReceipt);
router.get('/:id', controller.getById);
router.get('/:id/for-receipt', controller.getForReceipt);
router.get('/:id/received-status', controller.getReceivedStatusByPDH);
router.put('/:id/status', controller.updateStatus);
router.get('/:id/download-excel', controller.downloadExcel);
router.get('/:id/excel-info', controller.getExcelInfo);

module.exports = router; 