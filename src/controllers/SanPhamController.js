const SanPhamService = require("../services/SanPhamService");
const response = require("../utils/response");

const SanPham = {
  getAll: async (req, res) => {
    try {
      const data = await SanPhamService.getAll();
      console.log(data);
      return response.success(
        res,
        data,
        "Lấy danh sách sản phẩm và chi tiết thành công"
      );
    } catch (err) {
      return response.error(res, err);
    }
  },
};

module.exports = SanPham;
