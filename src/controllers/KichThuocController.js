const KichThuocService = require('../services/KichThuocService');
const response = require('../utils/response');

const KichThuocController = {
  getAll: async (req, res) => {
    try {
      const data = await KichThuocService.getAll();
      return response.success(res, data, 'Lấy danh sách kích thước thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  getById: async (req, res) => {
    try {
      const data = await KichThuocService.getById(req.params.id);
      if (!data) return response.notFound(res, 'Không tìm thấy kích thước');
      return response.success(res, data, 'Lấy kích thước thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  create: async (req, res) => {
    try {
      const data = await KichThuocService.create(req.body);
      return response.success(res, data, 'Tạo kích thước thành công', 201);
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  update: async (req, res) => {
    try {
      const data = await KichThuocService.update(req.params.id, req.body);
      if (!data) return response.notFound(res, 'Không tìm thấy kích thước');
      return response.success(res, data, 'Cập nhật kích thước thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  delete: async (req, res) => {
    try {
      const data = await KichThuocService.delete(req.params.id);
      if (!data) return response.notFound(res, 'Không tìm thấy kích thước');
      return response.success(res, data, 'Xóa kích thước thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
};

module.exports = KichThuocController; 