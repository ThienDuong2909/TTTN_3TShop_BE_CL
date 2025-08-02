// src/routes/taikhoan.js
const express = require('express');
const router = express.Router();
const { taoTaiKhoan } = require('../controllers/TaiKhoanController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

// Tạo tài khoản - chỉ Admin
router.post('/', 
  authenticateJWT, 
  authorize('Admin'), 
  taoTaiKhoan);

module.exports = router;