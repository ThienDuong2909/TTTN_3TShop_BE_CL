const express = require('express');
const AuthController = require('../controllers/AuthController');
const authenticateJWT = require('../middlewares/jwt');

const router = express.Router();

// === PUBLIC ROUTES (Không cần đăng nhập) ===
// Đăng nhập (POST /auth/login)
// Body: { email, password }
router.post('/login', AuthController.login);

// Đăng ký (POST /auth/register)
// Khách hàng: { Email, Password, TenKH, DiaChi, SDT, CCCD }
// Nhân viên: { Email, Password, MaVaiTro: 2, TenNV, NgaySinh, DiaChi, Luong }
router.post('/register', AuthController.register);

// Đăng xuất
router.post('/logout', AuthController.logout);

// === AUTHENTICATED ROUTES ===
// Lấy thông tin profile (cả nhân viên và khách hàng) - chỉ cần đăng nhập
router.get('/profile', authenticateJWT, AuthController.profile);

module.exports = router; 