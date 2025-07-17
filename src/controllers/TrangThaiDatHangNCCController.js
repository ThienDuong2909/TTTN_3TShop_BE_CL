const TrangThaiDatHangNCCService = require('../services/TrangThaiDatHangNCCService');
const response = require('../utils/response');

const TrangThaiDatHangNCCController = {
  getAll: async (req, res) => {
    try {
      const data = await TrangThaiDatHangNCCService.getAll();
      return response.success(res, data, 'Lấy danh sách trạng thái đơn đặt hàng thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  getById: async (req, res) => {
    try {
      const data = await TrangThaiDatHangNCCService.getById(req.params.id);
      if (!data) return response.notFound(res, 'Không tìm thấy trạng thái đơn đặt hàng');
      return response.success(res, data, 'Lấy trạng thái đơn đặt hàng thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  create: async (req, res) => {
    try {
      const data = await TrangThaiDatHangNCCService.create(req.body);
      return response.success(res, data, 'Tạo trạng thái đơn đặt hàng thành công', 201);
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  update: async (req, res) => {
    try {
      const data = await TrangThaiDatHangNCCService.update(req.params.id, req.body);
      if (!data) return response.notFound(res, 'Không tìm thấy trạng thái đơn đặt hàng');
      return response.success(res, data, 'Cập nhật trạng thái đơn đặt hàng thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  delete: async (req, res) => {
    try {
      const data = await TrangThaiDatHangNCCService.delete(req.params.id);
      if (!data) return response.notFound(res, 'Không tìm thấy trạng thái đơn đặt hàng');
      return response.success(res, data, 'Xóa trạng thái đơn đặt hàng thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
};

module.exports = TrangThaiDatHangNCCController; 