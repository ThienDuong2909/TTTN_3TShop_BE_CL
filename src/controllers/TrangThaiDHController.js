const TrangThaiDHService = require('../services/TrangThaiDHService');
const response = require('../utils/response');

const TrangThaiDHController = {
  // Lấy tất cả trạng thái đơn hàng
  getAll: async (req, res) => {
    try {
      const data = await TrangThaiDHService.getAll();
      return response.success(res, data, 'Lấy danh sách trạng thái đơn hàng thành công');
    } catch (err) {
      console.error('Error in getAll:', err);
      return response.error(res, err.message || 'Lỗi khi lấy danh sách trạng thái đơn hàng');
    }
  },

  // Lấy trạng thái đơn hàng theo ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const data = await TrangThaiDHService.getById(id);
      
      if (!data) {
        return response.notFound(res, 'Không tìm thấy trạng thái đơn hàng');
      }
      
      return response.success(res, data, 'Lấy trạng thái đơn hàng thành công');
    } catch (err) {
      console.error('Error in getById:', err);
      return response.error(res, err.message || 'Lỗi khi lấy trạng thái đơn hàng');
    }
  },

  // Tạo trạng thái đơn hàng mới
  create: async (req, res) => {
    try {
      const data = await TrangThaiDHService.create(req.body);
      return response.success(res, data, 'Tạo trạng thái đơn hàng thành công', 201);
    } catch (err) {
      console.error('Error in create:', err);
      return response.error(res, err.message || 'Lỗi khi tạo trạng thái đơn hàng');
    }
  },

  // Cập nhật trạng thái đơn hàng
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const data = await TrangThaiDHService.update(id, req.body);
      
      if (!data) {
        return response.notFound(res, 'Không tìm thấy trạng thái đơn hàng');
      }
      
      return response.success(res, data, 'Cập nhật trạng thái đơn hàng thành công');
    } catch (err) {
      console.error('Error in update:', err);
      return response.error(res, err.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
    }
  },

  // Xóa trạng thái đơn hàng
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const data = await TrangThaiDHService.delete(id);
      
      if (!data) {
        return response.notFound(res, 'Không tìm thấy trạng thái đơn hàng');
      }
      
      return response.success(res, data, 'Xóa trạng thái đơn hàng thành công');
    } catch (err) {
      console.error('Error in delete:', err);
      return response.error(res, err.message || 'Lỗi khi xóa trạng thái đơn hàng');
    }
  }
};

module.exports = TrangThaiDHController;
