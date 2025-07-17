const NhanVienService = require('../services/NhanVienService');
const response = require('../utils/response');

const NhanVienController = {
  getAll: async (req, res) => {
    try {
      const data = await NhanVienService.getAll();
      return response.success(res, data, 'Lấy danh sách nhân viên thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  getById: async (req, res) => {
    try {
      const data = await NhanVienService.getById(req.params.id);
      if (!data) return response.notFound(res, 'Không tìm thấy nhân viên');
      return response.success(res, data, 'Lấy nhân viên thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  getProfile: async (req, res) => {
    try {
      // Assuming we have user info from JWT middleware
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
  },
  
  create: async (req, res) => {
    try {
      const data = await NhanVienService.create(req.body);
      return response.success(res, data, 'Tạo nhân viên thành công', 201);
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  update: async (req, res) => {
    try {
      const data = await NhanVienService.update(req.params.id, req.body);
      if (!data) return response.notFound(res, 'Không tìm thấy nhân viên');
      return response.success(res, data, 'Cập nhật nhân viên thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  delete: async (req, res) => {
    try {
      const data = await NhanVienService.delete(req.params.id);
      if (!data) return response.notFound(res, 'Không tìm thấy nhân viên');
      return response.success(res, data, 'Xóa nhân viên thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
};

module.exports = NhanVienController; 