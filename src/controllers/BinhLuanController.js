const BinhLuanService = require('../services/BinhLuanService');
const response = require('../utils/response');

const BinhLuanController = {
  // Tạo bình luận mới (chỉ khách hàng) - hỗ trợ cả đơn lẻ và danh sách
  create: async (req, res) => {
    try {
      const { maCTDonDatHang, moTa, soSao, binhLuanList } = req.body;
      const maTK = req.user.id || req.user.MaKH; // Lấy từ JWT token
      
      if (!maTK) {
        return response.error(res, null, 'Không xác định được khách hàng', 401);
      }

      // Kiểm tra xem là tạo đơn lẻ hay nhiều bình luận
      if (binhLuanList && Array.isArray(binhLuanList)) {
        // Tạo nhiều bình luận
        const result = await BinhLuanService.createMultiple(maTK, binhLuanList);

        if (result.success) {
          return response.success(res, result, result.message, 201);
        } else {
          return response.error(res, result, result.message, 400);
        }
      } else {
        // Tạo bình luận đơn lẻ (logic cũ)
        if (!maCTDonDatHang || !moTa || !soSao) {
          return response.error(res, null, 'Thiếu thông tin bình luận', 400);
        }

        if (soSao < 0 || soSao > 5) {
          return response.error(res, null, 'Số sao phải từ 0 đến 5', 400);
        }

        const data = await BinhLuanService.create(maTK, maCTDonDatHang, moTa, soSao);
        return response.success(res, data, 'Tạo bình luận thành công', 201);
      }
    } catch (err) {
      console.error('Error in create comment:', err);
      return response.error(res, err.message || 'Lỗi khi tạo bình luận', 400);
    }
  },

  // Tạo nhiều bình luận cùng lúc (endpoint riêng)
  createMultiple: async (req, res) => {
    try {
      const { binhLuanList } = req.body;
      const maTK = req.user.id || req.user.MaKH; // Lấy từ JWT token

      if (!maTK) {
        return response.error(res, null, 'Không xác định được khách hàng', 401);
      }

      if (!binhLuanList || !Array.isArray(binhLuanList) || binhLuanList.length === 0) {
        return response.error(res, null, 'Danh sách bình luận không hợp lệ', 400);
      }

      const result = await BinhLuanService.createMultiple(maTK, binhLuanList);

      if (result.success) {
        return response.success(res, result, result.message, 201);
      } else {
        return response.error(res, result, result.message, 400);
      }
    } catch (err) {
      console.error('Error in create multiple comments:', err);
      return response.error(res, err.message || 'Lỗi khi tạo nhiều bình luận', 400);
    }
  },

  // Lấy bình luận theo ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return response.error(res, null, 'ID bình luận không hợp lệ', 400);
      }

      const data = await BinhLuanService.getById(parseInt(id));
      
      if (!data) {
        return response.notFound(res, 'Không tìm thấy bình luận');
      }
      
      return response.success(res, data, 'Lấy bình luận thành công');
    } catch (err) {
      console.error('Error in getById:', err);
      return response.error(res, err.message || 'Lỗi khi lấy bình luận');
    }
  },

  // Lấy bình luận theo sản phẩm (public)
  getByProduct: async (req, res) => {
    try {
      const { maSP } = req.params;
      const { page = 1, limit = 10 } = req.query;
      
      if (!maSP || isNaN(maSP)) {
        return response.error(res, null, 'Mã sản phẩm không hợp lệ', 400);
      }

      const parsedPage = Math.max(1, parseInt(page) || 1);
      const parsedLimit = Math.max(1, Math.min(100, parseInt(limit) || 10));

      const data = await BinhLuanService.getByProduct(parseInt(maSP), parsedPage, parsedLimit);
      return response.success(res, data, 'Lấy bình luận sản phẩm thành công');
    } catch (err) {
      console.error('Error in getByProduct:', err);
      return response.error(res, err.message || 'Lỗi khi lấy bình luận sản phẩm');
    }
  },

  // Lấy bình luận của khách hàng (chỉ khách hàng đó)
  getByCustomer: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const maKH = req.user.id || req.user.MaKH; // Lấy từ JWT token
      
      if (!maKH) {
        return response.error(res, null, 'Không xác định được khách hàng', 401);
      }

      const parsedPage = Math.max(1, parseInt(page) || 1);
      const parsedLimit = Math.max(1, Math.min(100, parseInt(limit) || 10));

      const data = await BinhLuanService.getByCustomer(maKH, parsedPage, parsedLimit);
      return response.success(res, data, 'Lấy bình luận của khách hàng thành công');
    } catch (err) {
      console.error('Error in getByCustomer:', err);
      return response.error(res, err.message || 'Lỗi khi lấy bình luận khách hàng');
    }
  },

  // Cập nhật bình luận (chỉ khách hàng sở hữu)
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { moTa, soSao } = req.body;
      const maKH = req.user.id || req.user.MaKH; // Lấy từ JWT token
      
      if (!maKH) {
        return response.error(res, null, 'Không xác định được khách hàng', 401);
      }

      if (!id || isNaN(id)) {
        return response.error(res, null, 'ID bình luận không hợp lệ', 400);
      }

      if (!moTa || !soSao) {
        return response.error(res, null, 'Thiếu thông tin cập nhật', 400);
      }

      if (soSao < 1 || soSao > 5) {
        return response.error(res, null, 'Số sao phải từ 1 đến 5', 400);
      }

      const data = await BinhLuanService.update(parseInt(id), maKH, moTa, soSao);
      return response.success(res, data, 'Cập nhật bình luận thành công');
    } catch (err) {
      console.error('Error in update comment:', err);
      return response.error(res, err.message || 'Lỗi khi cập nhật bình luận', 400);
    }
  },

  // Xóa bình luận (chỉ khách hàng sở hữu)
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const maKH = req.user.id || req.user.MaKH; // Lấy từ JWT token
      
      if (!maKH) {
        return response.error(res, null, 'Không xác định được khách hàng', 401);
      }

      if (!id || isNaN(id)) {
        return response.error(res, null, 'ID bình luận không hợp lệ', 400);
      }

      await BinhLuanService.delete(parseInt(id), maKH);
      return response.success(res, null, 'Xóa bình luận thành công');
    } catch (err) {
      console.error('Error in delete comment:', err);
      return response.error(res, err.message || 'Lỗi khi xóa bình luận', 400);
    }
  },

  // Lấy thống kê bình luận theo sản phẩm (public)
  getProductStats: async (req, res) => {
    try {
      const { maSP } = req.params;
      
      if (!maSP || isNaN(maSP)) {
        return response.error(res, null, 'Mã sản phẩm không hợp lệ', 400);
      }

      const data = await BinhLuanService.getProductStats(parseInt(maSP));
      return response.success(res, data, 'Lấy thống kê bình luận thành công');
    } catch (err) {
      console.error('Error in getProductStats:', err);
      return response.error(res, err.message || 'Lỗi khi lấy thống kê bình luận');
    }
  },

  // Lấy tất cả bình luận (chỉ admin)
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      
      const parsedPage = Math.max(1, parseInt(page) || 1);
      const parsedLimit = Math.max(1, Math.min(100, parseInt(limit) || 10));

      const data = await BinhLuanService.getAll(parsedPage, parsedLimit);
      return response.success(res, data, 'Lấy danh sách bình luận thành công');
    } catch (err) {
      console.error('Error in getAll:', err);
      return response.error(res, err.message || 'Lỗi khi lấy danh sách bình luận');
    }
  },

  // Lấy sản phẩm có thể bình luận (chỉ khách hàng)
  getCommentableProducts: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const maKH = req.user.id || req.user.MaKH; // Lấy từ JWT token
      
      if (!maKH) {
        return response.error(res, null, 'Không xác định được khách hàng', 401);
      }

      const parsedPage = Math.max(1, parseInt(page) || 1);
      const parsedLimit = Math.max(1, Math.min(100, parseInt(limit) || 10));

      // Lấy các sản phẩm đã mua và đã giao hàng nhưng chưa bình luận
      const { CT_DonDatHang, DonDatHang, ChiTietSanPham, SanPham, KichThuoc, Mau, BinhLuan } = require('../models');
      
      const offset = (parsedPage - 1) * parsedLimit;
      
      const { count, rows } = await CT_DonDatHang.findAndCountAll({
        include: [
          {
            model: DonDatHang,
            where: { 
              MaKH: maKH,
              MaTTDH: 4 // Đã giao hàng
            },
            attributes: ['MaDDH', 'NgayTao']
          },
          {
            model: ChiTietSanPham,
            include: [
              {
                model: SanPham,
                attributes: ['MaSP', 'TenSP']
              },
              {
                model: KichThuoc,
                attributes: ['MaKichThuoc', 'TenKichThuoc']
              },
              {
                model: Mau,
                attributes: ['MaMau', 'TenMau', 'MaHex']
              }
            ]
          },
          {
            model: BinhLuan,
            where: { MaKH: maKH },
            required: false, // LEFT JOIN để lấy cả những sản phẩm chưa bình luận
            attributes: ['MaBL']
          }
        ],
        where: {
          '$BinhLuan.MaBL$': null // Chỉ lấy những sản phẩm chưa bình luận
        },
        order: [['DonDatHang.NgayTao', 'DESC']],
        limit: parsedLimit,
        offset: offset,
        distinct: true
      });

      const products = rows.map(item => ({
        maCTDDH: item.MaCTDDH,
        maSP: item.ChiTietSanPham.SanPham.MaSP,
        tenSP: item.ChiTietSanPham.SanPham.TenSP,
        kichThuoc: item.ChiTietSanPham.KichThuoc.TenKichThuoc,
        mau: item.ChiTietSanPham.Mau.TenMau,
        maHex: item.ChiTietSanPham.Mau.MaHex,
        soLuong: item.SoLuong,
        donGia: item.DonGia,
        ngayMua: item.DonDatHang.NgayTao
      }));

      return response.success(res, {
        products,
        pagination: {
          currentPage: parsedPage,
          totalPages: Math.ceil(count / parsedLimit),
          totalItems: count,
          itemsPerPage: parsedLimit
        }
      }, 'Lấy danh sách sản phẩm có thể bình luận thành công');
    } catch (err) {
      console.error('Error in getCommentableProducts:', err);
      return response.error(res, err.message || 'Lỗi khi lấy danh sách sản phẩm có thể bình luận');
    }
  }
};

module.exports = BinhLuanController;
