const GioHangService = require("../services/GioHangService");
const response = require("../utils/response");

const GioHangController = {
  addToCart: async (req, res) => {
    try {
      const { maKH, maSP, maHex, tenKichThuoc, soLuong } = req.body;

      if (!maKH || !maSP || !maHex || !tenKichThuoc) {
        return response.error(res, null, "Thiếu thông tin sản phẩm");
      }

      const data = await GioHangService.addToCart(
        maKH,
        maSP,
        maHex,
        tenKichThuoc,
        soLuong
      );

      return response.success(
        res,
        data,
        "Thêm sản phẩm vào giỏ hàng thành công"
      );
    } catch (err) {
      return response.error(res, err.message);
    }
  },
  removeFromCart: async (req, res) => {
    try {
      const { maKH, maSP, maHex, tenKichThuoc } = req.body;
      if (!maKH || !maSP || !maHex || !tenKichThuoc) {
        return response.error(res, null, "Thiếu thông tin cần thiết");
      }

      const data = await GioHangService.removeFromCart(
        maKH,
        maSP,
        maHex,
        tenKichThuoc
      );
      return response.success(
        res,
        data,
        "Xoá sản phẩm khỏi giỏ hàng thành công"
      );
    } catch (err) {
      return response.error(res, err.message || "Lỗi xoá giỏ hàng");
    }
  },

  placeOrder: async (req, res) => {
    try {
      const { maKH, dsSanPham, diaChiGiao, nguoiNhan } = req.body;

      if (!maKH || !Array.isArray(dsSanPham) || dsSanPham.length === 0) {
        return response.error(res, null, "Thiếu thông tin đặt hàng");
      }

      const data = await GioHangService.placeOrder(
        maKH,
        dsSanPham,
        diaChiGiao,
        nguoiNhan
      );
      return response.success(res, data, "Đặt hàng thành công");
    } catch (err) {
      return response.error(res, err.message || "Lỗi đặt hàng");
    }
  },
  getCartByCustomer: async (req, res) => {
    try {
      const { maKH } = req.params;
      if (!maKH) {
        return response.error(res, null, "Thiếu mã khách hàng");
      }

      const cartData = await GioHangService.getCartByCustomer(maKH);
      return response.success(res, cartData, "Lấy giỏ hàng thành công");
    } catch (err) {
      return response.error(res, err.message || "Lỗi lấy giỏ hàng");
    }
  },
  clearCart: async (req, res) => {
    try {
      const { maKH } = req.body;

      if (!maKH) {
        return response.error(res, null, "Thiếu mã khách hàng");
      }

      const result = await GioHangService.clearCart(maKH);
      return response.success(res, result, "Đã xoá toàn bộ giỏ hàng");
    } catch (err) {
      return response.error(res, err.message || "Lỗi xoá toàn bộ giỏ hàng");
    }
  },
};

module.exports = GioHangController;
