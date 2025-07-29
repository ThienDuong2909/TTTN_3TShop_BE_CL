const HoaDonService = require('../services/HoaDonService');
const response = require('../utils/response');

const HoaDonController = {
  // Tạo hóa đơn mới
  createInvoice: async (req, res) => {
    try {
      const { maDDH, maNVLap } = req.body;
      
      if (!maDDH) {
        return response.error(res, null, 'Vui lòng cung cấp mã đơn hàng', 400);
      }

      const data = await HoaDonService.createInvoice(maDDH, maNVLap);
      return response.success(res, data, 'Tạo hóa đơn thành công');
    } catch (err) {
      console.error('Error in createHoaDon:', err);
      return response.error(res, err.message || 'Lỗi khi tạo hóa đơn');
    }
  },

  // Lấy thông tin chi tiết hóa đơn
  getHoaDonDetail: async (req, res) => {
    try {
      const { soHD } = req.params;
      
      if (!soHD) {
        return response.error(res, null, 'Vui lòng cung cấp số hóa đơn', 400);
      }

      const data = await HoaDonService.getHoaDonDetail(soHD);
      
      if (!data) {
        return response.notFound(res, 'Không tìm thấy hóa đơn');
      }
      
      return response.success(res, data, 'Lấy thông tin hóa đơn thành công');
    } catch (err) {
      console.error('Error in getHoaDonDetail:', err);
      return response.error(res, err.message || 'Lỗi khi lấy thông tin hóa đơn');
    }
  },

  // Lấy hóa đơn theo mã đơn hàng
  getHoaDonByOrderId: async (req, res) => {
    try {
      const { maDDH } = req.params;
      
      if (!maDDH) {
        return response.error(res, null, 'Vui lòng cung cấp mã đơn hàng', 400);
      }

      const data = await HoaDonService.getHoaDonByOrderId(maDDH);
      
      if (!data) {
        return response.notFound(res, 'Không tìm thấy hóa đơn cho đơn hàng này');
      }
      
      return response.success(res, data, 'Lấy thông tin hóa đơn thành công');
    } catch (err) {
      console.error('Error in getHoaDonByOrderId:', err);
      return response.error(res, err.message || 'Lỗi khi lấy thông tin hóa đơn');
    }
  },

  // Lấy danh sách tất cả hóa đơn
  getAllHoaDon: async (req, res) => {
    try {
      const { page = 1, limit = 10, search } = req.query;
      
      const parsedPage = Math.max(1, parseInt(page) || 1);
      const parsedLimit = Math.max(1, Math.min(100, parseInt(limit) || 10));

      const data = await HoaDonService.getAllHoaDon(parsedPage, parsedLimit, search);
      return response.success(res, data, 'Lấy danh sách hóa đơn thành công');
    } catch (err) {
      console.error('Error in getAllHoaDon:', err);
      return response.error(res, err.message || 'Lỗi khi lấy danh sách hóa đơn');
    }
  }
};

module.exports = HoaDonController;
