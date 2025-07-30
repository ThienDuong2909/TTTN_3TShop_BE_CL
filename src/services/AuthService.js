const { TaiKhoan, VaiTro, NhanVien, KhachHang } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const AuthService = {
  login: async (email, password) => {
    // Find user by email
    const taiKhoan = await TaiKhoan.findOne({
      where: { Email: email },
      include: [{ model: VaiTro }]
    });
    if (!taiKhoan) {
      throw new Error('Email không tồn tại');
    }
    // Check password
    const isValidPassword = await bcrypt.compare(password, taiKhoan.Password);
    if (!isValidPassword) {
      throw new Error('Mật khẩu không chính xác');
    }
    // Get user info based on role
    let userInfo = null;
    if (taiKhoan.VaiTro.TenVaiTro === 'Admin' || taiKhoan.VaiTro.TenVaiTro === 'NhanVienCuaHang' || taiKhoan.VaiTro.TenVaiTro === 'NhanVienGiaoHang') {
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
        Email: taiKhoan.Email,
        VaiTro: taiKhoan.VaiTro.TenVaiTro,
        id: taiKhoan.MaTK
      },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '24h' }
    );
    return {
      token,
      user: userInfo,
      role: taiKhoan.VaiTro.TenVaiTro,
      id: userInfo.MaTK || userInfo.MaKH
    };
  },

  register: async (userData) => {
    // Không cho phép đăng ký nhân viên qua API này
    if (userData.MaVaiTro === 2 || userData.MaVaiTro === 3 || userData.TenNV || userData.NgaySinh || userData.Luong) {
      throw new Error('Chỉ admin mới được phép tạo tài khoản nhân viên');
    }
    // Check if email already exists
    const existingUser = await TaiKhoan.findOne({
      where: { Email: userData.Email }
    });
    if (existingUser) {
      throw new Error('Email đã tồn tại');
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.Password, 10);
    // Create account
    const taiKhoan = await TaiKhoan.create({
      Email: userData.Email,
      Password: hashedPassword,
      MaVaiTro: 4 // Luôn là khách hàng
    });
    // Create KhachHang
    const userRecord = await KhachHang.create({
      TenKH: userData.TenKH,
      DiaChi: userData.DiaChi,
      SDT: userData.SDT,
      CCCD: userData.CCCD,
      MaTK: taiKhoan.MaTK
    });
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