const BoPhanService = require('../services/BoPhanService');
const response = require('../utils/response');

const BoPhanController = {
  async getAll(req, res) {
    try {
      const data = await BoPhanService.getAll();
      return response.success(res, data, 'Lấy danh sách bộ phận thành công');
    } catch (err) {
      return response.error(res, err.message, 'Lỗi server');
    }
  },
  async getById(req, res) {
    try {
      const data = await BoPhanService.getById(req.params.id);
      if (!data) return response.notFound(res, 'Không tìm thấy bộ phận');
      return response.success(res, data, 'Lấy bộ phận thành công');
    } catch (err) {
      return response.error(res, err.message, 'Lỗi server');
    }
  },
  async create(req, res) {
    try {
      const data = await BoPhanService.create(req.body);
      return response.success(res, data, 'Thêm bộ phận thành công', 201);
    } catch (err) {
      return response.error(res, err.message, 'Thêm bộ phận thất bại', 400);
    }
  },
  async update(req, res) {
    try {
      const data = await BoPhanService.update(req.params.id, req.body);
      if (!data) return response.notFound(res, 'Không tìm thấy bộ phận');
      return response.success(res, data, 'Cập nhật bộ phận thành công');
    } catch (err) {
      return response.error(res, err.message, 'Cập nhật bộ phận thất bại', 400);
    }
  },
  async delete(req, res) {
    try {
      const result = await BoPhanService.delete(req.params.id);
      if (!result) return response.notFound(res, 'Không tìm thấy bộ phận');
      return response.success(res, null, 'Xóa bộ phận thành công');
    } catch (err) {
      return response.error(res, err.message, 'Xóa bộ phận thất bại', 400);
    }
  },
};

module.exports = BoPhanController;
