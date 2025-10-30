const SanPhamService = require("../services/SanPhamService");
const response = require("../utils/response");

const SanPhamController = {
  getAll: async (req, res) => {
    try {
      const data = await SanPhamService.getAll();
      return response.success(res, data, "Lấy danh sách sản phẩm thành công");
    } catch (err) {
      return response.error(res, err);
    }
  },

  getNewProducts: async (req, res) => {
    console.log("Fetching new products...");
    try {
      const data = await SanPhamService.getNewProducts();
      return response.success(
        res,
        data,
        "Lấy danh sách sản phẩm mới thành công"
      );
    } catch (err) {
      return response.error(res, err);
    }
  },

  getAllProducts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 8;
      const result = await SanPhamService.getAllProducts({
        page,
        pageSize,
      });
      if (!result) {
        return response.error(res, "No product was found");
      }
      return response.success(
        res,
        {
          data: result.rows,
          total: result.count,
          page,
          pageSize,
        },
        "Lấy danh sách sản phẩm thành công"
      );
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
      const data = await SanPhamService.getAvailableSizesAndColors(
        req.params.productId
      );
      return response.success(
        res,
        data,
        "Lấy danh sách size và màu có sẵn của sản phẩm thành công"
      );
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
      const { TenSP, MaLoaiSP, MaNCC, MoTa, details, images, Gia, NgayApDung } =
        req.body;
      const product = await SanPhamService.createProduct({
        TenSP,
        MaLoaiSP,
        MaNCC,
        MoTa,
        details: typeof details === "string" ? JSON.parse(details) : details,
        images: typeof images === "string" ? JSON.parse(images) : images,
        Gia,
        NgayApDung,
      });
      return response.success(res, product, "Product created successfully");
    } catch (err) {
      return response.error(res, err.message);
    }
  },
  updateProductDetailStock: async (req, res) => {
    try {
      const { maCTSP } = req.params;
      const { SoLuongTon } = req.body;
      if (SoLuongTon === undefined) {
        return response.validationError(res, null, "Thiếu trường SoLuongTon");
      }
      const result = await SanPhamService.updateStock(maCTSP, SoLuongTon);
      return response.success(res, result, "Cập nhật tồn kho thành công");
    } catch (err) {
      return response.error(res, err.message);
    }
  },
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { TenSP, MaLoaiSP, MaNCC, MoTa, Gia, NgayApDung, images } =
        req.body;
      const result = await SanPhamService.updateProductInfo({
        id,
        TenSP,
        MaLoaiSP,
        MaNCC,
        MoTa,
        Gia,
        NgayApDung,
        images: typeof images === "string" ? JSON.parse(images) : images,
      });
      return response.success(
        res,
        result,
        "Cập nhật thông tin sản phẩm thành công"
      );
    } catch (err) {
      return response.error(res, err.message);
    }
  },
  updateMultipleProductDetailStocks: async (req, res) => {
    try {
      const items = req.body;
      if (!Array.isArray(items)) {
        return response.validationError(res, null, "Dữ liệu phải là mảng");
      }
      const result = await SanPhamService.updateMultipleStocks(items);
      return response.success(
        res,
        result,
        "Cập nhật tồn kho nhiều chi tiết sản phẩm thành công"
      );
    } catch (err) {
      return response.error(res, err.message);
    }
  },
  getBestSellers: async (req, res) => {
    try {
      const data = await SanPhamService.getBestSellers();
      return response.success(
        res,
        data,
        "Lấy danh sách sản phẩm bán chạy thành công"
      );
    } catch (err) {
      return response.error(res, err);
    }
  },
  searchProducts: async (req, res) => {
    try {
      const { keyword } = req.query;
      const data = await SanPhamService.searchProducts(keyword);
      return response.success(res, data, "Tìm kiếm sản phẩm thành công");
    } catch (err) {
      return response.error(res, err);
    }
  },
  getAllDiscountProducts: async (req, res) => {
    try {
      const data = await SanPhamService.getAllDiscountProducts();
      return response.success(
        res,
        data,
        "Lấy danh sách sản phẩm giảm giá thành công"
      );
    } catch (err) {
      return response.error(res, err.message);
    }
  },

  addProductDetail: async (req, res) => {
    try {
      const { MaSP, MaKichThuoc, MaMau, SoLuongTon } = req.body;
      if (!MaSP || !MaKichThuoc || !MaMau || SoLuongTon === undefined) {
        return response.validationError(
          res,
          null,
          "Thiếu thông tin để tạo chi tiết sản phẩm"
        );
      }
      const result = await SanPhamService.addProductDetail({
        MaSP,
        MaKichThuoc,
        MaMau,
        SoLuongTon,
      });
      return response.success(res, result, "Thêm chi tiết sản phẩm thành công");
    } catch (err) {
      return response.error(res, err.message);
    }
  },
  // API: Thống kê số lượng đã đặt và đã nhập cho từng sản phẩm (theo từng biến thể)
  getOrderedVsReceived: async (req, res) => {
    try {
      const data = await SanPhamService.getOrderedVsReceived();
      return response.success(
        res,
        data,
        "Thống kê số lượng đã đặt và đã nhập cho từng sản phẩm"
      );
    } catch (err) {
      return response.error(res, err);
    }
  },
  getRecommendations: async (req, res) => {
    try {
      const {
        items,
        k = 8,
        exclude_incart = true,
        require_instock = false,
      } = req.body;

      // Validate input
      if (!items || !Array.isArray(items) || items.length === 0) {
        return response.error(
          res,
          null,
          "Danh sách sản phẩm không hợp lệ. Vui lòng cung cấp mảng 'items' với các MaCTSP",
          400
        );
      }

      // Validate items are numbers
      const invalidItems = items.filter((item) => isNaN(Number(item)));
      if (invalidItems.length > 0) {
        return response.error(
          res,
          null,
          "Danh sách chứa MaCTSP không hợp lệ",
          400
        );
      }

      const recommendations = await SanPhamService.getRecommendations(
        items,
        k,
        exclude_incart,
        require_instock
      );

      return response.success(
        res,
        {
          recommendations,
          total: recommendations.length,
          params: {
            k: Number(k),
            exclude_incart: Boolean(exclude_incart),
            require_instock: Boolean(require_instock),
          },
        },
        `Lấy ${recommendations.length} sản phẩm gợi ý thành công`
      );
    } catch (err) {
      console.error("Error in getRecommendations:", err);
      return response.error(
        res,
        null,
        err.message || "Lỗi khi lấy gợi ý sản phẩm",
        500
      );
    }
  },
};

module.exports = SanPhamController;
