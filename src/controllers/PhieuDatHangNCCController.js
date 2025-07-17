const { success, error, notFound } = require('../utils/response');
const PhieuDatHangNCCService = require('../services/PhieuDatHangNCCService');

const PhieuDatHangNCCController = {
  create: async (req, res) => {
    try {
      // Lấy MaNV từ user đăng nhập
      const MaNV = req.body.MaNV;
      if (!MaNV) return error(res, null, 'Không xác định được nhân viên lập phiếu', 401);
      
      // Map frontend "details" to backend "chiTiet"
      const data = { 
        ...req.body, 
        MaNV,
        chiTiet: req.body.details || req.body.chiTiet  // Support both "details" and "chiTiet"
      };
      
      const result = await PhieuDatHangNCCService.create(data);
      return success(res, result, 'Tạo phiếu đặt hàng NCC thành công', 201);
    } catch (err) {
      console.log(err);
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
  
  updateStatus: async (req, res) => {
    try {
      const { MaTrangThai } = req.body;
      const data = await PhieuDatHangNCCService.updateStatus(req.params.id, MaTrangThai);
      if (!data) return notFound(res, 'Không tìm thấy phiếu đặt hàng NCC');
      return success(res, data, 'Cập nhật trạng thái phiếu đặt hàng NCC thành công');
    } catch (err) {
      return error(res, err);
    }
  },
  
  getAvailableForReceipt: async (req, res) => {
    try {
      const data = await PhieuDatHangNCCService.getAvailableForReceipt();
      return success(res, data, 'Lấy danh sách phiếu đặt hàng có thể tạo phiếu nhập thành công');
    } catch (err) {
      return error(res, err);
    }
  },
  
  getForReceipt: async (req, res) => {
    try {
      const data = await PhieuDatHangNCCService.getForReceipt(req.params.id);
      if (!data) return notFound(res, 'Không tìm thấy phiếu đặt hàng NCC');
      return success(res, data, 'Lấy phiếu đặt hàng để tạo phiếu nhập thành công');
    } catch (err) {
      return error(res, err);
    }
  },
};

module.exports = PhieuDatHangNCCController; 