const TraHangService = require('../services/TraHangService');
const response = require('../utils/response');
const {KhachHang} = require("../models");

const TraHangController = {
  // Khách hàng yêu cầu trả hàng (chuyển trạng thái đơn hàng thành 7)
  requestReturn: async (req, res) => {
    try {
      const { maDDH, danhSachSanPham, lyDo } = req.body;
      const maTK = req.user.id || req.user.MaKH; // Lấy từ JWT token
        const khachHang = await KhachHang.findOne({
            where: {MaTK: maTK}
        });

      if (!khachHang) {
        return response.error(res, null, 'Không xác định được khách hàng', 401);
      }

      if (!maDDH || !danhSachSanPham || !Array.isArray(danhSachSanPham) || danhSachSanPham.length === 0 || !lyDo) {
        return response.error(res, null, 'Thiếu thông tin mã đơn hàng, danh sách sản phẩm hoặc lý do trả hàng', 400);
      }

      // Validate danhSachSanPham structure
      for (const item of danhSachSanPham) {
        if (!item.maCTDDH || !item.soLuongTra || item.soLuongTra <= 0) {
          return response.error(res, null, 'Thông tin sản phẩm trả không hợp lệ. Cần có maCTDDH và soLuongTra > 0', 400);
        }
      }

      const result = await TraHangService.requestReturn(khachHang.MaKH, maDDH, danhSachSanPham, lyDo);
      return response.success(res, result, 'Yêu cầu trả hàng thành công', 200);
    } catch (err) {
      console.error('Error in requestReturn:', err);
      return response.error(res, err.message || 'Lỗi khi yêu cầu trả hàng', 400);
    }
  },

  // Lấy danh sách đơn hàng yêu cầu trả hàng (cho nhân viên)
  getReturnRequests: async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;

      const parsedPage = Math.max(1, parseInt(page) || 1);
      const parsedLimit = Math.max(1, Math.min(100, parseInt(limit) || 10));

      const data = await TraHangService.getReturnRequests(parsedPage, parsedLimit, status);
      return response.success(res, data, 'Lấy danh sách yêu cầu trả hàng thành công');
    } catch (err) {
      console.error('Error in getReturnRequests:', err);
      return response.error(res, err.message || 'Lỗi khi lấy danh sách yêu cầu trả hàng');
    }
  },

  // Nhân viên tạo phiếu trả hàng
  createReturnSlip: async (req, res) => {
    try {
      const { maDDH, danhSachSanPham, lyDo } = req.body;
      const maNV = req.user.id || req.user.MaNV; // Lấy từ JWT token

      if (!maNV) {
        return response.error(res, null, 'Không xác định được nhân viên', 401);
      }

      if (!maDDH || !danhSachSanPham || !Array.isArray(danhSachSanPham) || danhSachSanPham.length === 0) {
        return response.error(res, null, 'Thiếu thông tin đơn hàng hoặc danh sách sản phẩm trả', 400);
      }

      const result = await TraHangService.createReturnSlip(maNV, maDDH, danhSachSanPham, lyDo);
      return response.success(res, result, 'Tạo phiếu trả hàng thành công', 201);
    } catch (err) {
      console.error('Error in createReturnSlip:', err);
      return response.error(res, err.message || 'Lỗi khi tạo phiếu trả hàng', 400);
    }
  },

  // Tạo phiếu chi cho phiếu trả hàng
  createPaymentSlip: async (req, res) => {
    try {
      const { maPhieuTra, soTien } = req.body;

      if (!maPhieuTra || !soTien) {
        return response.error(res, null, 'Thiếu thông tin mã phiếu trả hàng hoặc số tiền', 400);
      }

      const result = await TraHangService.createPaymentSlip(maPhieuTra, soTien);
      return response.success(res, result, 'Tạo phiếu chi thành công', 201);
    } catch (err) {
      console.error('Error in createPaymentSlip:', err);
      return response.error(res, err.message || 'Lỗi khi tạo phiếu chi', 400);
    }
  },

  // Lấy chi tiết phiếu chi theo mã phiếu trả hàng
  getPaymentSlipByReturnSlip: async (req, res) => {
    try {
      const { maPhieuTra } = req.params;

      if (!maPhieuTra || isNaN(maPhieuTra)) {
        return response.error(res, null, 'Mã phiếu trả hàng không hợp lệ', 400);
      }

      const data = await TraHangService.getPaymentSlipByReturnSlip(parseInt(maPhieuTra));

      if (!data) {
        return response.notFound(res, 'Không tìm thấy phiếu chi cho phiếu trả hàng này');
      }

      return response.success(res, data, 'Lấy chi tiết phiếu chi thành công');
    } catch (err) {
      console.error('Error in getPaymentSlipByReturnSlip:', err);
      return response.error(res, err.message || 'Lỗi khi lấy chi tiết phiếu chi');
    }
  },

  // Lấy danh sách phiếu chi
  getPaymentSlips: async (req, res) => {
    try {
      const { page = 1, limit = 10, fromDate, toDate } = req.query;

      const parsedPage = Math.max(1, parseInt(page) || 1);
      const parsedLimit = Math.max(1, Math.min(100, parseInt(limit) || 10));

      const data = await TraHangService.getPaymentSlips(parsedPage, parsedLimit, fromDate, toDate);
      return response.success(res, data, 'Lấy danh sách phiếu chi thành công');
    } catch (err) {
      console.error('Error in getPaymentSlips:', err);
      return response.error(res, err.message || 'Lỗi khi lấy danh sách phiếu chi');
    }
  },

  // Lấy chi tiết phiếu trả hàng
  getReturnSlipDetail: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return response.error(res, null, 'ID phiếu trả hàng không hợp lệ', 400);
      }

      const data = await TraHangService.getReturnSlipDetail(parseInt(id));

      if (!data) {
        return response.notFound(res, 'Không tìm thấy phiếu trả hàng');
      }

      return response.success(res, data, 'Lấy chi tiết phiếu trả hàng thành công');
    } catch (err) {
      console.error('Error in getReturnSlipDetail:', err);
      return response.error(res, err.message || 'Lỗi khi lấy chi tiết phiếu trả hàng');
    }
  },

  // Lấy danh sách phiếu trả hàng
  getReturnSlips: async (req, res) => {
    try {
      const { page = 1, limit = 10, fromDate, toDate } = req.query;

      const parsedPage = Math.max(1, parseInt(page) || 1);
      const parsedLimit = Math.max(1, Math.min(100, parseInt(limit) || 10));

      const data = await TraHangService.getReturnSlips(parsedPage, parsedLimit, fromDate, toDate);
      return response.success(res, data, 'Lấy danh sách phiếu trả hàng thành công');
    } catch (err) {
      console.error('Error in getReturnSlips:', err);
      return response.error(res, err.message || 'Lỗi khi lấy danh sách phiếu trả hàng');
    }
  },

  // Lấy lịch sử trả hàng của khách hàng
  getCustomerReturnHistory: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const maKH = req.user.id || req.user.MaKH; // Lấy từ JWT token

      if (!maKH) {
        return response.error(res, null, 'Không xác định được khách hàng', 401);
      }

      const parsedPage = Math.max(1, parseInt(page) || 1);
      const parsedLimit = Math.max(1, Math.min(100, parseInt(limit) || 10));

      const data = await TraHangService.getCustomerReturnHistory(maKH, parsedPage, parsedLimit);
      return response.success(res, data, 'Lấy lịch sử trả hàng thành công');
    } catch (err) {
      console.error('Error in getCustomerReturnHistory:', err);
      return response.error(res, err.message || 'Lỗi khi lấy lịch sử trả hàng');
    }
  }
};

module.exports = TraHangController;
