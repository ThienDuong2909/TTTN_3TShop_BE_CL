const GioHangService = require("../services/GioHangService");
const response = require("../utils/response");

const GioHangController = {
  addToCart: async (req, res) => {
    try {
      const { maKH, maSP, maMau, maKichThuoc, soLuong } = req.body;

      if (!maKH || !maSP || !maMau || !maKichThuoc) {
        return response.error(res, null, "Thiếu thông tin sản phẩm");
      }

      const data = await GioHangService.addToCart(
        maKH,
        maSP,
        maMau,
        maKichThuoc,
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
      const { maKH, maCTSP } = req.body;
      if (!maKH || !maCTSP) {
        return response.error(res, null, "Thiếu thông tin cần thiết");
      }

      const data = await GioHangService.removeFromCart(maKH, maCTSP);
      return response.success(
        res,
        data,
        "Xoá sản phẩm khỏi giỏ hàng thành công"
      );
    } catch (err) {
      return response.error(res, err, "Lỗi khi xoá sản phẩm khỏi giỏ hàng");
    }
  },
  placeOrder: async (req, res) => {
    try {
      const { maKH, dsSanPham } = req.body;

      if (!maKH || !Array.isArray(dsSanPham) || dsSanPham.length === 0) {
        return response.error(res, null, "Thiếu thông tin đặt hàng");
      }

      const data = await GioHangService.placeOrder(maKH, dsSanPham);
      return response.success(res, data, "Đặt hàng thành công");
    } catch (err) {
      return response.error(res, err.message || "Lỗi đặt hàng");
    }
  },
};

module.exports = GioHangController;
