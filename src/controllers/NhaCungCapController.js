const NhaCungCapService = require('../services/NhaCungCapService');
const response = require('../utils/response');

const NhaCungCapController = {
  getAll: async (req, res) => {
    try {
      const data = await NhaCungCapService.getAll();
      return response.success(res, data, 'Lấy danh sách nhà cung cấp thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  getById: async (req, res) => {
    try {
      const data = await NhaCungCapService.getById(req.params.id);
      if (!data) return response.notFound(res, 'Không tìm thấy nhà cung cấp');
      return response.success(res, data, 'Lấy nhà cung cấp thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  create: async (req, res) => {
    try {
      const data = await NhaCungCapService.create(req.body);
      return response.success(res, data, 'Tạo nhà cung cấp thành công', 201);
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  update: async (req, res) => {
    try {
      const data = await NhaCungCapService.update(req.params.id, req.body);
      if (!data) return response.notFound(res, 'Không tìm thấy nhà cung cấp');
      return response.success(res, data, 'Cập nhật nhà cung cấp thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  delete: async (req, res) => {
    try {
      const data = await NhaCungCapService.delete(req.params.id);
      if (!data) return response.notFound(res, 'Không tìm thấy nhà cung cấp');
      return response.success(res, data, 'Xóa nhà cung cấp thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
};

module.exports = NhaCungCapController; 