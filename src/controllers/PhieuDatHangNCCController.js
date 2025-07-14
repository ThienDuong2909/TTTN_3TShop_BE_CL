const { success, error, notFound } = require('../utils/response');
const PhieuDatHangNCCService = require('../services/PhieuDatHangNCCService');

const PhieuDatHangNCCController = {
  create: async (req, res) => {
    try {
      // Lấy MaNV từ user đăng nhập
      const MaNV = req.user && req.user.MaNV;
      if (!MaNV) return error(res, null, 'Không xác định được nhân viên lập phiếu', 401);
      const data = { ...req.body, MaNV };
      const result = await PhieuDatHangNCCService.create(data);
      return success(res, result, 'Tạo phiếu đặt hàng NCC thành công', 201);
    } catch (err) {
      return error(res, err);
    }
  },
  getAll: async (req, res) => {
    try {
      const data = await PhieuDatHangNCCService.getAll();
      return success(res, data, 'Lấy danh sách phiếu đặt hàng NCC thành công');
    } catch (err) {
      return error(res, err);
    }
  },
  getById: async (req, res) => {
    try {
      const data = await PhieuDatHangNCCService.getById(req.params.id);
      if (!data) return notFound(res, 'Không tìm thấy phiếu đặt hàng NCC');
      return success(res, data, 'Lấy chi tiết phiếu đặt hàng NCC thành công');
    } catch (err) {
      return error(res, err);
    }
  },
};

module.exports = PhieuDatHangNCCController; 