const SanPhamService = require("../services/SanPhamService");
const response = require("../utils/response");

const SanPhamController = {
  getAll: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 8;
      const { rows, count } = await SanPhamService.getAll({ page, pageSize });
      return response.success(res, {
        data: rows,
        total: count,
        page,
        pageSize
      }, "Lấy danh sách sản phẩm thành công");
    } catch (err) {
      return response.error(res, err);
    }
  },

  getById: async (req, res) => {
    try {
      const data = await SanPhamService.getById(req.params.id);
      if (!data) return response.notFound(res, "Không tìm thấy sản phẩm");
      return response.success(res, data, "Lấy sản phẩm thành công");
    } catch (err) {
      return response.error(res, err);
    }
  },

  getBySupplier: async (req, res) => {
    try {
      const data = await SanPhamService.getBySupplier(req.params.supplierId);
      return response.success(
        res,
        data,
        "Lấy sản phẩm theo nhà cung cấp thành công"
      );
    } catch (err) {
      return response.error(res, err);
    }
  },

  getProductDetails: async (req, res) => {
    try {
      const data = await SanPhamService.getProductDetails();
      return response.success(res, data, "Lấy chi tiết sản phẩm thành công");
    } catch (err) {
      return response.error(res, err);
    }
  },

  getProductDetailById: async (req, res) => {
    try {
      const data = await SanPhamService.getProductDetailById(req.params.id);
      if (!data)
        return response.notFound(res, "Không tìm thấy chi tiết sản phẩm");
      return response.success(res, data, "Lấy chi tiết sản phẩm thành công");
    } catch (err) {
      return response.error(res, err);
    }
  },

  create: async (req, res) => {
    try {
      const data = await SanPhamService.create(req.body);
      return response.success(res, data, "Tạo sản phẩm thành công", 201);
    } catch (err) {
      return response.error(res, err);
    }
  },

  update: async (req, res) => {
    try {
      const data = await SanPhamService.update(req.params.id, req.body);
      if (!data) return response.notFound(res, "Không tìm thấy sản phẩm");
      return response.success(res, data, "Cập nhật sản phẩm thành công");
    } catch (err) {
      return response.error(res, err);
    }
  },

  delete: async (req, res) => {
    try {
      const data = await SanPhamService.delete(req.params.id);
      if (!data) return response.notFound(res, "Không tìm thấy sản phẩm");
      return response.success(res, data, "Xóa sản phẩm thành công");
    } catch (err) {
      return response.error(res, err);
    }
  },

  getColorsSizesByProductId: async (req, res) => {
    try {
      const data = await SanPhamService.getColorsSizesByProductId(
        req.params.productId
      );
      return response.success(
        res,
        data,
        "Lấy danh sách màu và size của sản phẩm thành công"
      );
    } catch (err) {
      return response.error(res, err);
    }
  },

  getAvailableSizesAndColors: async (req, res) => {
    try {
      const data = await SanPhamService.getAvailableSizesAndColors(req.params.productId);
      return response.success(res, data, 'Lấy danh sách size và màu có sẵn của sản phẩm thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
  checkStockAvailability: async (req, res) => {
    try {
      const { maCTSP } = req.body;
      if (!maCTSP) {
        return response.error(res, null, "Thiếu mã chi tiết sản phẩm (maCTSP)");
      }
      const tonKho = await SanPhamService.getStockByMaCTSP(maCTSP);
      return response.success(
        res,
        { soLuongTon: tonKho },
        "Lấy tồn kho thành công"
      );
    } catch (err) {
      console.error("Lỗi kiểm tra tồn kho:", err);
      return response.error(res, err.message || "Lỗi server");
    }
  },
  createProduct: async (req, res) => {
    try {
      const { TenSP, MaLoaiSP, MaNCC, MoTa, details, images, Gia, NgayApDung } = req.body;
      const product = await SanPhamService.createProduct({
        TenSP,
        MaLoaiSP,
        MaNCC,
        MoTa,
        details: typeof details === 'string' ? JSON.parse(details) : details,
        images: typeof images === 'string' ? JSON.parse(images) : images,
        Gia,
        NgayApDung
      });
      return response.success(res, product, 'Product created successfully');
    } catch (err) {
      return response.error(res, err.message);
    }
  },
  updateProductDetailStock: async (req, res) => {
    try {
      const { maCTSP } = req.params;
      const { SoLuongTon } = req.body;
      if (SoLuongTon === undefined) {
        return response.validationError(res, null, 'Thiếu trường SoLuongTon');
      }
      const result = await SanPhamService.updateStock(maCTSP, SoLuongTon);
      return response.success(res, result, 'Cập nhật tồn kho thành công');
    } catch (err) {
      return response.error(res, err.message);
    }
  },
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { TenSP, MaLoaiSP, MaNCC, MoTa, Gia, NgayApDung, images } = req.body;
      const result = await SanPhamService.updateProductInfo({
        id,
        TenSP,
        MaLoaiSP,
        MaNCC,
        MoTa,
        Gia,
        NgayApDung,
        images: typeof images === 'string' ? JSON.parse(images) : images
      });
      return response.success(res, result, 'Cập nhật thông tin sản phẩm thành công');
    } catch (err) {
      return response.error(res, err.message);
    }
  },
  updateMultipleProductDetailStocks: async (req, res) => {
    try {
      const items = req.body;
      if (!Array.isArray(items)) {
        return response.validationError(res, null, 'Dữ liệu phải là mảng');
      }
      const result = await SanPhamService.updateMultipleStocks(items);
      return response.success(res, result, 'Cập nhật tồn kho nhiều chi tiết sản phẩm thành công');
    } catch (err) {
      return response.error(res, err.message);
    }
  },
};

module.exports = SanPhamController;
