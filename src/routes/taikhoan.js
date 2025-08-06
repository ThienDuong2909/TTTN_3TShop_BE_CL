// src/routes/taikhoan.js
const express = require('express');
const router = express.Router();
const { taoTaiKhoan } = require('../controllers/TaiKhoanController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

// === AUTHENTICATED ROUTES ===
router.use(authenticateJWT);

// Tạo tài khoản
router.post('/', authorize('toanquyen'), taoTaiKhoan);

module.exports = router;