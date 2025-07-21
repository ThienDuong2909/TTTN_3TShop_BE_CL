const AuthService = require('../services/AuthService');
const NhanVienService = require('../services/NhanVienService');
const response = require('../utils/response');

const AuthController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return response.validationError(res, null, 'Thiếu email hoặc mật khẩu');
      }
      const result = await AuthService.login(email, password);
      return response.success(res, result, 'Đăng nhập thành công');
    } catch (err) {
      return response.error(res, err.message, 'Đăng nhập thất bại', 401);
    }
  },
  register: async (req, res) => {
    try {
      const result = await AuthService.register(req.body);
      return response.success(res, result, 'Đăng ký thành công', 201);
    } catch (err) {
      if (err.message === 'Chỉ admin mới được phép tạo tài khoản nhân viên') {
        return response.error(res, err.message, 'Không được phép', 403);
      }
      return response.error(res, err.message, 'Đăng ký thất bại', 400);
    }
  },
  logout: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const result = await AuthService.logout(token);
      return response.success(res, result, 'Đăng xuất thành công');
    } catch (err) {
      return response.error(res, err.message, 'Đăng xuất thất bại');
    }
  },
  profile: async (req, res) => {
    try {
      // Get user info from JWT middleware
      const taiKhoanId = req.user?.id || req.user?.MaTK;
      if (!taiKhoanId) {
        return response.error(res, null, 'Chưa đăng nhập', 401);
      }
      // Lấy profile cho cả nhân viên và khách hàng
      const nhanVien = await NhanVienService.getByTaiKhoanId(taiKhoanId);
      if (nhanVien) return response.success(res, nhanVien, 'Lấy thông tin nhân viên thành công');
      // Nếu không phải nhân viên, trả về thông tin khách hàng
      const { KhachHang } = require('../models');
      const khachHang = await KhachHang.findOne({ where: { MaTK: taiKhoanId } });
      if (khachHang) return response.success(res, khachHang, 'Lấy thông tin khách hàng thành công');
      return response.notFound(res, 'Không tìm thấy thông tin tài khoản');
    } catch (err) {
      return response.error(res, err);
    }
  }
};

module.exports = AuthController; 