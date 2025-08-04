const { 
  BinhLuan, 
  KhachHang, 
  CT_DonDatHang, 
  DonDatHang, 
  ChiTietSanPham, 
  SanPham,
  KichThuoc,
  Mau,
  sequelize 
} = require('../models');

const BinhLuanService = {
  // Tạo bình luận mới
  create: async (maKH, maCTDonDatHang, moTa, soSao) => {
    const transaction = await sequelize.transaction();
    
    try {
      // Kiểm tra khách hàng tồn tại
      const khachHang = await KhachHang.findOne({
        where: {MaTK: maKH}
      }, { transaction });
      if (!khachHang) {
        throw new Error('Khách hàng không tồn tại');
      }

      // const maKH = khachHang[0].get('MaTK');

      // Kiểm tra chi tiết đơn hàng tồn tại và thuộc về khách hàng này
      const chiTietDonHang = await CT_DonDatHang.findOne({
        where: { MaCTDDH: maCTDonDatHang },
        include: [{
          model: DonDatHang,
          where: { MaKH: khachHang[0].get('MaTK') }
        }],
        transaction
      });

      if (!chiTietDonHang) {
        throw new Error('Chi tiết đơn hàng không tồn tại hoặc không thuộc về bạn');
      }

      // Kiểm tra đơn hàng đã được giao chưa (trạng thái = 4 - Đã giao hàng)
      if (chiTietDonHang.DonDatHang.MaTTDH !== 4) {
        throw new Error('Chỉ có thể bình luận sản phẩm sau khi đơn hàng đã được giao');
      }

      // Kiểm tra đã bình luận chưa
      const existingComment = await BinhLuan.findOne({
        where: { 
          MaKH: maKH, 
          MaCTDonDatHang: maCTDonDatHang 
        },
        transaction
      });

      if (existingComment) {
        throw new Error('Bạn đã bình luận sản phẩm này rồi');
      }

      // Validate số sao
      if (soSao < 1 || soSao > 5) {
        throw new Error('Số sao phải từ 1 đến 5');
      }

      // Tạo bình luận
      const binhLuan = await BinhLuan.create({
        MaKH: maKH,
        MaCTDonDatHang: maCTDonDatHang,
        MoTa: moTa,
        SoSao: soSao,
        NgayBinhLuan: new Date()
      }, { transaction });

      await transaction.commit();

      // Trả về bình luận với thông tin chi tiết
      return await BinhLuanService.getById(binhLuan.MaBL);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Lấy bình luận theo ID
  getById: async (maBL) => {
    return await BinhLuan.findByPk(maBL, {
      include: [
        {
          model: KhachHang,
          attributes: ['MaKH', 'TenKH']
        },
        {
          model: CT_DonDatHang,
          include: [
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
            }
          ]
        }
      ]
    });
  },

  // Lấy bình luận theo sản phẩm
  getByProduct: async (maSP, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    
    const { count, rows } = await BinhLuan.findAndCountAll({
      include: [
        {
          model: KhachHang,
          attributes: ['MaKH', 'TenKH']
        },
        {
          model: CT_DonDatHang,
          include: [
            {
              model: ChiTietSanPham,
              where: { MaSP: maSP },
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
            }
          ]
        }
      ],
      order: [['NgayBinhLuan', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });

    return {
      comments: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    };
  },

  // Lấy bình luận của khách hàng
  getByCustomer: async (maKH, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    
    const { count, rows } = await BinhLuan.findAndCountAll({
      where: { MaKH: maKH },
      include: [
        {
          model: KhachHang,
          attributes: ['MaKH', 'TenKH']
        },
        {
          model: CT_DonDatHang,
          include: [
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
            }
          ]
        }
      ],
      order: [['NgayBinhLuan', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });

    return {
      comments: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    };
  },

  // Cập nhật bình luận
  update: async (maBL, maKH, moTa, soSao) => {
    const transaction = await sequelize.transaction();
    
    try {
      // Kiểm tra bình luận tồn tại và thuộc về khách hàng
      const binhLuan = await BinhLuan.findOne({
        where: { 
          MaBL: maBL, 
          MaKH: maKH 
        },
        transaction
      });

      if (!binhLuan) {
        throw new Error('Bình luận không tồn tại hoặc không thuộc về bạn');
      }

      // Validate số sao
      if (soSao < 1 || soSao > 5) {
        throw new Error('Số sao phải từ 1 đến 5');
      }

      // Cập nhật bình luận
      await binhLuan.update({
        MoTa: moTa,
        SoSao: soSao
      }, { transaction });

      await transaction.commit();

      // Trả về bình luận đã cập nhật
      return await BinhLuanService.getById(maBL);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Xóa bình luận
  delete: async (maBL, maKH) => {
    const transaction = await sequelize.transaction();
    
    try {
      // Kiểm tra bình luận tồn tại và thuộc về khách hàng
      const binhLuan = await BinhLuan.findOne({
        where: { 
          MaBL: maBL, 
          MaKH: maKH 
        },
        transaction
      });

      if (!binhLuan) {
        throw new Error('Bình luận không tồn tại hoặc không thuộc về bạn');
      }

      // Xóa bình luận
      await binhLuan.destroy({ transaction });

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Lấy thống kê bình luận theo sản phẩm
  getProductStats: async (maSP) => {
    const stats = await BinhLuan.findAll({
      attributes: [
        'SoSao',
        [sequelize.fn('COUNT', sequelize.col('MaBL')), 'count']
      ],
      include: [
        {
          model: CT_DonDatHang,
          include: [
            {
              model: ChiTietSanPham,
              where: { MaSP: maSP },
              attributes: []
            }
          ],
          attributes: []
        }
      ],
      group: ['SoSao'],
      raw: true
    });

    // Tính toán thống kê
    let totalComments = 0;
    let totalStars = 0;
    const starDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    stats.forEach(stat => {
      const count = parseInt(stat.count);
      const stars = parseInt(stat.SoSao);
      totalComments += count;
      totalStars += count * stars;
      starDistribution[stars] = count;
    });

    const averageRating = totalComments > 0 ? (totalStars / totalComments).toFixed(1) : 0;

    return {
      totalComments,
      averageRating: parseFloat(averageRating),
      starDistribution
    };
  },

  // Lấy tất cả bình luận (cho admin)
  getAll: async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    
    const { count, rows } = await BinhLuan.findAndCountAll({
      include: [
        {
          model: KhachHang,
          attributes: ['MaKH', 'TenKH']
        },
        {
          model: CT_DonDatHang,
          include: [
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
            }
          ]
        }
      ],
      order: [['NgayBinhLuan', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });

    return {
      comments: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    };
  }
};

module.exports = BinhLuanService; 