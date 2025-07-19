// src/routes/taikhoan.js
const express = require('express');
const router = express.Router();
const { taoTaiKhoan } = require('../controllers/TaiKhoanController');

router.post('/', taoTaiKhoan);

module.exports = router;