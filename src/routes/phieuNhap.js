const express = require('express');
const controller = require('../controllers/PhieuNhapController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

// === AUTHENTICATED ROUTES ===
router.use(authenticateJWT);

// Tạo phiếu nhập
router.post('/', authorize('nhaphang.tao'), controller.create);

// Lấy tất cả phiếu nhập
router.get('/', authorize('nhaphang.xem'), controller.getAll);

// Lấy phiếu nhập theo ID
router.get('/:id', authorize('nhaphang.xem'), controller.getById);

// Cập nhật tồn kho
router.put('/:id/update-inventory', authorize('nhaphang.sua'), controller.updateInventory);

// Import Excel
router.post('/excel', upload.single('file'), authorize('nhaphang.tao'), controller.importExcel);

module.exports = router; 