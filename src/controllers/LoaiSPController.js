const LoaiSPService = require("../services/LoaiSPService");
const response = require("../utils/response");

const LoaiSPController = {
  // Lấy tất cả loại sản phẩm
  async getAll(req, res) {
    try {
      const data = await LoaiSPService.getAll();
      return response.success(
        res,
        data,
        "Lấy danh sách loại sản phẩm thành công"
      );
    } catch (err) {
      return response.error(res, err.message, "Lỗi server");
    }
  },

  // Lấy loại sản phẩm theo id
  async getById(req, res) {
    try {
      const data = await LoaiSPService.getById(req.params.id);
      if (!data) return response.notFound(res, "Không tìm thấy loại sản phẩm");
      return response.success(res, data, "Lấy loại sản phẩm thành công");
    } catch (err) {
      return response.error(res, err.message, "Lỗi server");
    }
  },

  // Thêm loại sản phẩm
  async create(req, res) {
    try {
      const data = await LoaiSPService.create(req.body);
      return response.success(res, data, "Thêm loại sản phẩm thành công", 201);
    } catch (err) {
      return response.error(
        res,
        err.message,
        "Thêm loại sản phẩm thất bại",
        400
      );
    }
  },

  // Cập nhật loại sản phẩm
  async update(req, res) {
    try {
      const data = await LoaiSPService.update(req.params.id, req.body);
      if (!data) return response.notFound(res, "Không tìm thấy loại sản phẩm");
      return response.success(res, data, "Cập nhật loại sản phẩm thành công");
    } catch (err) {
      return response.error(res, err.message, "Cập nhật thất bại", 400);
    }
  },

  // Xóa loại sản phẩm
  async delete(req, res) {
    try {
      const result = await LoaiSPService.delete(req.params.id);
      if (!result)
        return response.notFound(res, "Không tìm thấy loại sản phẩm");
      return response.success(res, null, "Đã xóa thành công");
    } catch (err) {
      return response.error(res, err.message, "Xóa thất bại", 400);
    }
  },
  async getProductsById(req, res) {
    try {
      console.log("Lấy sản phẩm theo mã loại:", req.body.maLoaiSP);
      const data = await LoaiSPService.getProductsById(req.body.maLoaiSP);
      if (!data) return response.notFound(res, "Không tìm thấy sản phẩm nào");
      return response.success(
        res,
        data,
        "Lấy sản phẩm theo mã loại thành công"
      );
    } catch (err) {
      return response.error(res, err.message, "Lấy thất bại", 400);
    }
  },
};

module.exports = LoaiSPController;
