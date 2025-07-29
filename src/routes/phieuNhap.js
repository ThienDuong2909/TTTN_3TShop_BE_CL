const express = require('express');
const controller = require('../controllers/PhieuNhapController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const authenticateJWT = require('../middlewares/jwt');
const authorize = require('../middlewares/authorize');
const router = express.Router();

// Áp dụng cho tất cả endpoint
router.use(authenticateJWT, authorize('Admin', 'NhanVien'));

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.put('/:id/update-inventory', controller.updateInventory);
router.post('/excel', upload.single('file'), controller.importExcel);

module.exports = router; 