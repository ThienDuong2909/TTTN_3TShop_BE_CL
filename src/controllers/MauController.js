const MauService = require('../services/MauService');
const response = require('../utils/response');

const MauController = {
  getAll: async (req, res) => {
    try {
      const data = await MauService.getAll();
      return response.success(res, data, 'Lấy danh sách màu thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
  getById: async (req, res) => {
    try {
      const data = await MauService.getById(req.params.id);
      if (!data) return response.notFound(res, 'Không tìm thấy màu');
      return response.success(res, data, 'Lấy màu thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
  create: async (req, res) => {
    try {
      const data = await MauService.create(req.body);
      return response.success(res, data, 'Tạo màu thành công', 201);
    } catch (err) {
      return response.error(res, err);
    }
  },
  update: async (req, res) => {
    try {
      const data = await MauService.update(req.params.id, req.body);
      if (!data) return response.notFound(res, 'Không tìm thấy màu');
      return response.success(res, data, 'Cập nhật màu thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
  delete: async (req, res) => {
    try {
      const data = await MauService.delete(req.params.id);
      if (!data) return response.notFound(res, 'Không tìm thấy màu');
      return response.success(res, data, 'Xóa màu thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
};

module.exports = MauController;
