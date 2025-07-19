const express = require('express');
const AuthController = require('../controllers/AuthController');
// const authenticateJWT = require('../middlewares/jwt');

const router = express.Router();

// Đăng nhập
router.post('/login', AuthController.login);
// Đăng ký
router.post('/register', AuthController.register);
// Đăng xuất
router.post('/logout', AuthController.logout);
// Lấy thông tin profile
router.get('/profile', /*authenticateJWT,*/ AuthController.profile);

module.exports = router; 