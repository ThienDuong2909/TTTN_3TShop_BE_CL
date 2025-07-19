
const SanPhamService = require('../services/SanPhamService');
const response = require('../utils/response');

const SanPhamController = {
  getAll: async (req, res) => {
    try {
      const data = await SanPhamService.getAll();
      return response.success(res, data, 'Lấy danh sách sản phẩm thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  getById: async (req, res) => {
    try {
      const data = await SanPhamService.getById(req.params.id);
      if (!data) return response.notFound(res, 'Không tìm thấy sản phẩm');
      return response.success(res, data, 'Lấy sản phẩm thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  getBySupplier: async (req, res) => {
    try {
      const data = await SanPhamService.getBySupplier(req.params.supplierId);
      return response.success(res, data, 'Lấy sản phẩm theo nhà cung cấp thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  getProductDetails: async (req, res) => {
    try {
      const data = await SanPhamService.getProductDetails();
      return response.success(res, data, 'Lấy chi tiết sản phẩm thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  getProductDetailById: async (req, res) => {
    try {
      const data = await SanPhamService.getProductDetailById(req.params.id);
      if (!data) return response.notFound(res, 'Không tìm thấy chi tiết sản phẩm');
      return response.success(res, data, 'Lấy chi tiết sản phẩm thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  create: async (req, res) => {
    try {
      const data = await SanPhamService.create(req.body);
      return response.success(res, data, 'Tạo sản phẩm thành công', 201);
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  update: async (req, res) => {
    try {
      const data = await SanPhamService.update(req.params.id, req.body);
      if (!data) return response.notFound(res, 'Không tìm thấy sản phẩm');
      return response.success(res, data, 'Cập nhật sản phẩm thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  delete: async (req, res) => {
    try {
      const data = await SanPhamService.delete(req.params.id);
      if (!data) return response.notFound(res, 'Không tìm thấy sản phẩm');
      return response.success(res, data, 'Xóa sản phẩm thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  getColorsSizesByProductId: async (req, res) => {
    try {
      const data = await SanPhamService.getColorsSizesByProductId(req.params.productId);
      return response.success(res, data, 'Lấy danh sách màu và size của sản phẩm thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
};


module.exports = SanPhamController; 

