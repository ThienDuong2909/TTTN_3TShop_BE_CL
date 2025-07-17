const AuthService = require('../services/AuthService');
const NhanVienService = require('../services/NhanVienService');
const response = require('../utils/response');

const AuthController = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return response.validationError(res, null, 'Thiếu tên đăng nhập hoặc mật khẩu');
      }
      
      const result = await AuthService.login(username, password);
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
      
      const data = await NhanVienService.getByTaiKhoanId(taiKhoanId);
      if (!data) return response.notFound(res, 'Không tìm thấy thông tin nhân viên');
      return response.success(res, data, 'Lấy thông tin nhân viên thành công');
    } catch (err) {
      return response.error(res, err);
    }
  }
};

module.exports = AuthController; 