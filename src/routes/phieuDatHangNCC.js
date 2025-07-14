const express = require('express');
const controller = require('../controllers/PhieuDatHangNCCController');
const authenticateJWT = require('../middlewares/jwt');
const authorize = require('../middlewares/authorize');
const router = express.Router();

router.post('/', authenticateJWT, authorize('Admin', 'NhanVien'), controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);

module.exports = router; 