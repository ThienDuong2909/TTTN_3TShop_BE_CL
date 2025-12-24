const DotGiamGiaService = require('../services/DotGiamGiaService');
const response = require('../utils/response');

const DotGiamGiaController = {
  // Tạo đợt giảm giá mới
  createDotGiamGia: async (req, res) => {
    try {
      const { ngayBatDau, ngayKetThuc, moTa, danhSachSanPham } = req.body;

      if (!ngayBatDau || !ngayKetThuc || !moTa) {
        return response.error(res, null, 'Thiếu thông tin ngày bắt đầu, ngày kết thúc hoặc mô tả', 400);
      }

      // Validate danhSachSanPham nếu có
      if (danhSachSanPham && Array.isArray(danhSachSanPham)) {
        for (const item of danhSachSanPham) {
          if (!item.maSP || !item.phanTramGiam) {
            return response.error(res, null, 'Danh sách sản phẩm phải có maSP và phanTramGiam', 400);
          }
          if (typeof item.phanTramGiam !== 'number' || item.phanTramGiam <= 0 || item.phanTramGiam > 100) {
            return response.error(res, null, 'Phần trăm giảm phải là số từ 0.01 đến 100', 400);
          }
        }
      }

      const result = await DotGiamGiaService.createDotGiamGia(
        ngayBatDau, 
        ngayKetThuc, 
        moTa, 
        danhSachSanPham || []
      );

      return response.success(res, result, 'Tạo đợt giảm giá thành công', 201);
    } catch (err) {
      console.error('Error in createDotGiamGia:', err);
      return response.error(res, err.message || 'Lỗi khi tạo đợt giảm giá', 400);
    }
  },

  // Thêm sản phẩm vào đợt giảm giá
  addSanPhamToDot: async (req, res) => {
    try {
      const { maDot } = req.params;
      const { danhSachSanPham } = req.body;

      if (!maDot || isNaN(maDot)) {
        return response.error(res, null, 'Mã đợt giảm giá không hợp lệ', 400);
      }

      if (!danhSachSanPham || !Array.isArray(danhSachSanPham) || danhSachSanPham.length === 0) {
        return response.error(res, null, 'Danh sách sản phẩm không được để trống', 400);
      }

      // Validate danhSachSanPham
      for (const item of danhSachSanPham) {
        if (!item.maSP || !item.phanTramGiam) {
          return response.error(res, null, 'Mỗi sản phẩm phải có maSP và phanTramGiam', 400);
        }
        if (typeof item.phanTramGiam !== 'number' || item.phanTramGiam <= 0 || item.phanTramGiam > 100) {
          return response.error(res, null, 'Phần trăm giảm phải là số từ 0.01 đến 100', 400);
        }
      }

      const result = await DotGiamGiaService.addSanPhamToDot(parseInt(maDot), danhSachSanPham);
      return response.success(res, result, 'Thêm sản phẩm vào đợt giảm giá thành công', 200);
    } catch (err) {
      console.error('Error in addSanPhamToDot:', err);
      return response.error(res, err.message || 'Lỗi khi thêm sản phẩm vào đợt giảm giá', 400);
    }
  },

  // Lấy danh sách đợt giảm giá
  getDotGiamGiaList: async (req, res) => {
    try {
      const { page = 1, limit = 10, trangThai } = req.query;

      const parsedPage = Math.max(1, parseInt(page) || 1);
      const parsedLimit = Math.max(1, Math.min(100, parseInt(limit) || 10));

      // Validate trạng thái
      const validStates = ['active', 'upcoming', 'expired'];
      const parsedTrangThai = validStates.includes(trangThai) ? trangThai : null;

      const data = await DotGiamGiaService.getDotGiamGiaList(parsedPage, parsedLimit, parsedTrangThai);
      return response.success(res, data, 'Lấy danh sách đợt giảm giá thành công');
    } catch (err) {
      console.error('Error in getDotGiamGiaList:', err);
      return response.error(res, err.message || 'Lỗi khi lấy danh sách đợt giảm giá');
    }
  },

  // Lấy chi tiết đợt giảm giá
  getDotGiamGiaDetail: async (req, res) => {
    try {
      const { maDot } = req.params;

      if (!maDot || isNaN(maDot)) {
        return response.error(res, null, 'Mã đợt giảm giá không hợp lệ', 400);
      }

      const data = await DotGiamGiaService.getDotGiamGiaDetail(parseInt(maDot));
      return response.success(res, data, 'Lấy chi tiết đợt giảm giá thành công');
    } catch (err) {
      console.error('Error in getDotGiamGiaDetail:', err);
      return response.error(res, err.message || 'Lỗi khi lấy chi tiết đợt giảm giá', 404);
    }
  },

  // Xóa sản phẩm khỏi đợt giảm giá
  removeSanPhamFromDot: async (req, res) => {
    try {
      const { maDot, maSP } = req.params;

      if (!maDot || isNaN(maDot)) {
        return response.error(res, null, 'Mã đợt giảm giá không hợp lệ', 400);
      }

      if (!maSP || isNaN(maSP)) {
        return response.error(res, null, 'Mã sản phẩm không hợp lệ', 400);
      }

      const result = await DotGiamGiaService.removeSanPhamFromDot(parseInt(maDot), parseInt(maSP));
      return response.success(res, result, 'Xóa sản phẩm khỏi đợt giảm giá thành công', 200);
    } catch (err) {
      console.error('Error in removeSanPhamFromDot:', err);
      return response.error(res, err.message || 'Lỗi khi xóa sản phẩm khỏi đợt giảm giá', 400);
    }
  },

  // Cập nhật phần trăm giảm giá
  updatePhanTramGiam: async (req, res) => {
    try {
      const { maDot, maSP } = req.params;
      const { phanTramGiam } = req.body;

      if (!maDot || isNaN(maDot)) {
        return response.error(res, null, 'Mã đợt giảm giá không hợp lệ', 400);
      }

      if (!maSP || isNaN(maSP)) {
        return response.error(res, null, 'Mã sản phẩm không hợp lệ', 400);
      }

      if (!phanTramGiam || typeof phanTramGiam !== 'number' || phanTramGiam <= 0 || phanTramGiam > 100) {
        return response.error(res, null, 'Phần trăm giảm phải là số từ 0.01 đến 100', 400);
      }

      const result = await DotGiamGiaService.updatePhanTramGiam(
        parseInt(maDot), 
        parseInt(maSP), 
        phanTramGiam
      );

      return response.success(res, result, 'Cập nhật phần trăm giảm giá thành công', 200);
    } catch (err) {
      console.error('Error in updatePhanTramGiam:', err);
      return response.error(res, err.message || 'Lỗi khi cập nhật phần trăm giảm giá', 400);
    }
  },

  // Delete discount period
  deleteDotGiamGia: async (req, res) => {
    try {
      const { maDot } = req.params;

      if (!maDot || isNaN(maDot)) {
        return response.error(res, null, 'Mã đợt giảm giá không hợp lệ', 400);
      }

      const result = await DotGiamGiaService.deleteDotGiamGia(parseInt(maDot));

      return response.success(res, result, 'Xóa đợt giảm giá thành công', 200);
    } catch (err) {
      console.error('Error in deleteDotGiamGia:', err);
      return response.error(res, err.message || 'Lỗi khi xóa đợt giảm giá', 400);
    }
  },

  // Validate discount period dates
  validateDiscountPeriod: async (req, res) => {
    try {
      const { ngayBatDau, ngayKetThuc } = req.body;

      // Support both camelCase and PascalCase field names
      const startDate = ngayBatDau;
      const endDate = ngayKetThuc;

      if (!startDate || !endDate) {
        return response.error(res, null, 'Thiếu thông tin ngày bắt đầu hoặc ngày kết thúc', 400);
      }

      const result = await DotGiamGiaService.validateDiscountPeriod(startDate, endDate);

      // if (!result.valid) {
      //   return response.error(res, result, result.message, 400);
      // }

      return response.success(res, result, result.message, 200);
    } catch (err) {
      console.error('Error in validateDiscountPeriod:', err);
      return response.error(res, err.message || 'Lỗi khi kiểm tra khoảng thời gian đợt giảm giá', 400);
    }
  },

  // Lấy danh sách sản phẩm có thể thêm vào đợt giảm giá
  getAvailableProductsForDiscount: async (req, res) => {
    try {
      const { maDot } = req.params;
      const { keyword } = req.query;

      if (!maDot || isNaN(maDot)) {
        return response.error(res, null, 'Mã đợt giảm giá không hợp lệ', 400);
      }

      const result = await DotGiamGiaService.getAvailableProductsForDiscount(
        parseInt(maDot),
        keyword || ''
      );

      return response.success(res, result, 'Lấy danh sách sản phẩm có thể thêm thành công', 200);
    } catch (err) {
      console.error('Error in getAvailableProductsForDiscount:', err);
      return response.error(res, err.message || 'Lỗi khi lấy danh sách sản phẩm có thể thêm', 400);
    }
  },

  // Cập nhật thông tin đợt giảm giá
  updateDotGiamGia: async (req, res) => {
    try {
      const { maDot } = req.params;
      const { ngayBatDau, ngayKetThuc, moTa } = req.body;

      if (!maDot || isNaN(maDot)) {
        return response.error(res, null, 'Mã đợt giảm giá không hợp lệ', 400);
      }

      // Validate at least one field is provided
      if (!ngayBatDau && !ngayKetThuc && moTa === undefined) {
        return response.error(res, null, 'Phải cung cấp ít nhất một trường để cập nhật (ngayBatDau, ngayKetThuc, hoặc moTa)', 400);
      }

      const updateData = {};
      if (ngayBatDau) updateData.ngayBatDau = ngayBatDau;
      if (ngayKetThuc) updateData.ngayKetThuc = ngayKetThuc;
      if (moTa !== undefined) updateData.moTa = moTa;

      const result = await DotGiamGiaService.updateDotGiamGia(
        parseInt(maDot),
        updateData
      );

      return response.success(res, result, 'Cập nhật đợt giảm giá thành công', 200);
    } catch (err) {
      console.error('Error in updateDotGiamGia:', err);
      return response.error(res, err.message || 'Lỗi khi cập nhật đợt giảm giá', 400);
    }
  }
};

module.exports = DotGiamGiaController;
