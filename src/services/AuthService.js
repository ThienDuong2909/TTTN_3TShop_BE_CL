const { TaiKhoan, VaiTro, NhanVien, KhachHang } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const AuthService = {
  login: async (username, password) => {
    // Find user by username
    const taiKhoan = await TaiKhoan.findOne({
      where: { TenTK: username },
      include: [{ model: VaiTro }]
    });
    
    if (!taiKhoan) {
      throw new Error('Tên đăng nhập không tồn tại');
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, taiKhoan.MatKhau);
    if (!isValidPassword) {
      throw new Error('Mật khẩu không chính xác');
    }
    
    // Get user info based on role
    let userInfo = null;
    if (taiKhoan.VaiTro.TenVaiTro === 'NhanVien' || taiKhoan.VaiTro.TenVaiTro === 'Admin') {
      userInfo = await NhanVien.findOne({
        where: { MaTK: taiKhoan.MaTK },
        include: [{ model: TaiKhoan, include: [{ model: VaiTro }] }]
      });
    } else {
      userInfo = await KhachHang.findOne({
        where: { MaTK: taiKhoan.MaTK },
        include: [{ model: TaiKhoan, include: [{ model: VaiTro }] }]
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        MaTK: taiKhoan.MaTK,
        TenTK: taiKhoan.TenTK,
        VaiTro: taiKhoan.VaiTro.TenVaiTro,
        id: taiKhoan.MaTK
      },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '24h' }
    );
    
    return {
      token,
      user: userInfo,
      role: taiKhoan.VaiTro.TenVaiTro
    };
  },
  
  register: async (userData) => {
    // Check if username already exists
    const existingUser = await TaiKhoan.findOne({
      where: { TenTK: userData.TenTK }
    });
    
    if (existingUser) {
      throw new Error('Tên đăng nhập đã tồn tại');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.MatKhau, 10);
    
    // Create account
    const taiKhoan = await TaiKhoan.create({
      TenTK: userData.TenTK,
      MatKhau: hashedPassword,
      MaVaiTro: userData.MaVaiTro || 2 // Default to customer role
    });
    
    // Create user record based on role
    let userRecord = null;
    if (userData.MaVaiTro === 1) { // Admin/Employee
      userRecord = await NhanVien.create({
        ...userData,
        MaTK: taiKhoan.MaTK
      });
    } else { // Customer
      userRecord = await KhachHang.create({
        ...userData,
        MaTK: taiKhoan.MaTK
      });
    }
    
    return { taiKhoan, userRecord };
  },
  
  verifyToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    } catch (error) {
      throw new Error('Token không hợp lệ');
    }
  },
  
  logout: async (token) => {
    // In a real app, you might want to maintain a blacklist of tokens
    // For now, we'll just return success
    return { message: 'Đăng xuất thành công' };
  }
};

module.exports = AuthService; 