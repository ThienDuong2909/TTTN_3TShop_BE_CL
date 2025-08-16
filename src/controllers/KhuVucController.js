const KhuVucService = require('../services/KhuVucService');
const response = require('../utils/response');

const KhuVucController = {
  // Lấy tất cả khu vực
  getAll: async (req, res) => {
    try {
      const { includeStaff } = req.query;
      
      let data;
      if (includeStaff === 'true') {
        data = await KhuVucService.getAllWithStaff();
      } else {
        data = await KhuVucService.getAll();
      }
      
      return response.success(res, data, 'Lấy danh sách khu vực thành công');
    } catch (err) {
      console.error('Error in getAll:', err);
      return response.error(res, err.message || 'Lỗi khi lấy danh sách khu vực');
    }
  },

  // Lấy khu vực theo mã
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const data = await KhuVucService.getById(id);
      
      if (!data) {
        return response.notFound(res, 'Không tìm thấy khu vực');
      }
      
      return response.success(res, data, 'Lấy thông tin khu vực thành công');
    } catch (err) {
      console.error('Error in getById:', err);
      return response.error(res, err.message || 'Lỗi khi lấy thông tin khu vực');
    }
  },

  // Tạo khu vực mới
  create: async (req, res) => {
    try {
      const data = await KhuVucService.create(req.body);
      return response.success(res, data, 'Tạo khu vực thành công', 201);
    } catch (err) {
      console.error('Error in create:', err);
      return response.error(res, err.message || 'Lỗi khi tạo khu vực', 400);
    }
  },

  // Cập nhật khu vực
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const data = await KhuVucService.update(id, req.body);
      
      if (!data) {
        return response.notFound(res, 'Không tìm thấy khu vực');
      }
      
      return response.success(res, data, 'Cập nhật khu vực thành công');
    } catch (err) {
      console.error('Error in update:', err);
      return response.error(res, err.message || 'Lỗi khi cập nhật khu vực', 400);
    }
  },

  // Xóa khu vực
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const data = await KhuVucService.delete(id);
      
      if (!data) {
        return response.notFound(res, 'Không tìm thấy khu vực');
      }
      
      return response.success(res, data, 'Xóa khu vực thành công');
    } catch (err) {
      console.error('Error in delete:', err);
      return response.error(res, err.message || 'Lỗi khi xóa khu vực', 400);
    }
  },

  // Lấy khu vực có sẵn (chưa có nhân viên phụ trách)
  getAvailableAreas: async (req, res) => {
    try {
      const data = await KhuVucService.getAvailableAreas();
      return response.success(res, data, 'Lấy danh sách khu vực có sẵn thành công');
    } catch (err) {
      console.error('Error in getAvailableAreas:', err);
      return response.error(res, err.message || 'Lỗi khi lấy danh sách khu vực có sẵn');
    }
  }
};

module.exports = KhuVucController;
