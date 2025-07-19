const { success, error, notFound } = require('../utils/response');
const PhieuNhapService = require('../services/PhieuNhapService');

const PhieuNhapController = {
  create: async (req, res) => {
    try {
      // Lấy MaNV từ user đăng nhập
      const MaNV = 1;
      // const MaNV = req.user && req.user.MaNV;
      if (!MaNV) return error(res, null, 'Không xác định được nhân viên lập phiếu', 401);
      const data = { 
        ...req.body, 
        MaNV,
        chiTiet: req.body.details || req.body.chiTiet  // Support both "details" and "chiTiet"
      };
      const result = await PhieuNhapService.create(data);
      return success(res, result, 'Tạo phiếu nhập thành công', 201);
    } catch (err) {
      return error(res, err);
    }
  },
  getAll: async (req, res) => {
    try {
      const data = await PhieuNhapService.getAll();
      return success(res, data, 'Lấy danh sách phiếu nhập thành công');
    } catch (err) {
      return error(res, err);
    }
  },
  getById: async (req, res) => {
    try {
      const data = await PhieuNhapService.getById(req.params.id);
      if (!data) return notFound(res, 'Không tìm thấy phiếu nhập');
      return success(res, data, 'Lấy chi tiết phiếu nhập thành công');
    } catch (err) {
      return error(res, err);
    }
  },
  importExcel: async (req, res) => {
    try {
      // Lấy MaNV từ user đăng nhập, truyền vào service
      const MaNV = req.user && req.user.MaNV;
      if (!MaNV) return error(res, null, 'Không xác định được nhân viên lập phiếu', 401);
      const result = await PhieuNhapService.importExcel(req.file, MaNV);
      if (result.success === false) {
        return error(res, result.errors, 'Có lỗi ở một số dòng Excel', 400);
      }
      return success(res, result.phieu, 'Nhập phiếu nhập từ Excel thành công', 201);
    } catch (err) {
      return error(res, err);
    }
  },
  
  updateInventory: async (req, res) => {
    try {
      const result = await PhieuNhapService.updateInventory(req.params.id);
      return success(res, result, 'Cập nhật tồn kho thành công');
    } catch (err) {
      return error(res, err);
    }
  },
};

module.exports = PhieuNhapController; 