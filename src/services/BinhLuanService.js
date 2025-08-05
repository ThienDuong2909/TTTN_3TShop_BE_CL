const { 
  BinhLuan, 
  KhachHang, 
  CT_DonDatHang, 
  DonDatHang, 
  ChiTietSanPham, 
  SanPham,
  KichThuoc,
  Mau,
  AnhSanPham,
  TrangThaiDH,
  sequelize
} = require('../models');

const BinhLuanService = {
  // Tạo bình luận mới
  create: async (maTK, maCTDonDatHang, moTa, soSao) => {
    const transaction = await sequelize.transaction();
    
    try {
      // Kiểm tra khách hàng tồn tại
      const khachHang = await KhachHang.findOne({
        where: {MaTK: maTK}
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
          where: { MaKH: khachHang.MaKH }
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
          MaKH: khachHang.MaKH,
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
        MaKH: khachHang.MaKH,
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

  // Tạo nhiều bình luận cùng lúc
  createMultiple: async (maTK, binhLuanList) => {
    const transaction = await sequelize.transaction();

    try {
      // Kiểm tra khách hàng tồn tại
      const khachHang = await KhachHang.findOne({
        where: {MaTK: maTK}
      }, { transaction });

      if (!khachHang) {
        throw new Error('Khách hàng không tồn tại');
      }

      // Validate danh sách bình luận
      if (!Array.isArray(binhLuanList) || binhLuanList.length === 0) {
        throw new Error('Danh sách bình luận không hợp lệ');
      }

      const createdComments = [];
      const errors = [];

      // Xử lý từng bình luận
      for (let i = 0; i < binhLuanList.length; i++) {
        const { maCTDonDatHang, moTa, soSao } = binhLuanList[i];

        try {
          // Validate dữ liệu bình luận
          if (!maCTDonDatHang || !moTa || soSao === undefined || soSao === null) {
            throw new Error(`Bình luận ${i + 1}: Thiếu thông tin bắt buộc`);
          }

          if (soSao < 1 || soSao > 5) {
            throw new Error(`Bình luận ${i + 1}: Số sao phải từ 1 đến 5`);
          }

          // Kiểm tra chi tiết đơn hàng tồn tại và thuộc về khách hàng này
          const chiTietDonHang = await CT_DonDatHang.findOne({
            where: { MaCTDDH: maCTDonDatHang },
            include: [{
              model: DonDatHang,
              where: { MaKH: khachHang.MaKH }
            }],
            transaction
          });

          if (!chiTietDonHang) {
            throw new Error(`Bình luận ${i + 1}: Chi tiết đơn hàng không tồn tại hoặc không thuộc về bạn`);
          }

          // Kiểm tra đơn hàng đã được giao chưa
          if (chiTietDonHang.DonDatHang.MaTTDH !== 4) {
            throw new Error(`Bình luận ${i + 1}: Chỉ có thể bình luận sản phẩm sau khi đơn hàng đã được giao`);
          }

          // Kiểm tra đã bình luận chưa
          const existingComment = await BinhLuan.findOne({
            where: {
              MaKH: khachHang.MaKH,
              MaCTDonDatHang: maCTDonDatHang
            },
            transaction
          });

          if (existingComment) {
            throw new Error(`Bình luận ${i + 1}: Bạn đã bình luận sản phẩm này rồi`);
          }

          // Tạo bình luận
          const binhLuan = await BinhLuan.create({
            MaKH: khachHang.MaKH,
            MaCTDonDatHang: maCTDonDatHang,
            MoTa: moTa,
            SoSao: soSao,
            NgayBinhLuan: new Date()
          }, { transaction });

          createdComments.push({
            index: i + 1,
            maBL: binhLuan.MaBL,
            success: true
          });

        } catch (error) {
          errors.push({
            index: i + 1,
            error: error.message,
            data: binhLuanList[i]
          });
        }
      }

      // Nếu có lỗi, rollback transaction
      if (errors.length > 0) {
        await transaction.rollback();
        return {
          success: false,
          createdCount: 0,
          totalCount: binhLuanList.length,
          errors: errors,
          message: `Có ${errors.length} bình luận bị lỗi trong tổng số ${binhLuanList.length} bình luận`
        };
      }

      await transaction.commit();

      // Lấy thông tin chi tiết các bình luận đã tạo
      const detailedComments = await Promise.all(
        createdComments.map(async (comment) => {
          return await BinhLuanService.getById(comment.maBL);
        })
      );

      return {
        success: true,
        createdCount: createdComments.length,
        totalCount: binhLuanList.length,
        comments: detailedComments,
        message: `Tạo thành công ${createdComments.length} bình luận`
      };

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
          attributes: ['MaKH', 'TenKH'],
          required: true
        },
        {
          model: CT_DonDatHang,
          required: true,
          include: [
            {
              model: ChiTietSanPham,
              required: true,
              where: { MaSP: parseInt(maSP) },
              include: [
                {
                  model: SanPham,
                  required: true,
                  attributes: ['MaSP', 'TenSP', 'MoTa'],
                  include: [
                    {
                      model: AnhSanPham,
                      attributes: ['MaAnh', 'TenFile', 'DuongDan', 'AnhChinh', 'ThuTu'],
                      where: { AnhChinh: true },
                      required: false
                    }
                  ]
                },
                {
                  model: KichThuoc,
                  required: true,
                  attributes: ['MaKichThuoc', 'TenKichThuoc']
                },
                {
                  model: Mau,
                  required: true,
                  attributes: ['MaMau', 'TenMau', 'MaHex']
                }
              ]
            },
            {
              model: DonDatHang,
              required: true,
              attributes: ['MaDDH', 'NgayTao', 'MaTTDH']
            }
          ]
        }
      ],
      order: [['NgayBinhLuan', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });

    // Lọc thêm một lần nữa để đảm bảo chỉ lấy bình luận của sản phẩm đúng
    const filteredRows = rows.filter(comment => {
      return comment.CT_DonDatHang?.ChiTietSanPham?.SanPham?.MaSP === parseInt(maSP);
    });

    // Xử lý dữ liệu để trả về thông tin đầy đủ
    const commentsWithDetails = filteredRows.map(comment => {
      const commentData = comment.toJSON();

      return {
        // Thông tin bình luận cơ bản
        MaBL: commentData.MaBL,
        MoTa: commentData.MoTa,
        SoSao: commentData.SoSao,
        NgayBinhLuan: commentData.NgayBinhLuan,

        // Thông tin khách hàng
        KhachHang: {
          MaKH: commentData.KhachHang?.MaKH || 0,
          TenKH: commentData.KhachHang?.TenKH || ''
        },

        // Thông tin sản phẩm chi tiết
        SanPham: {
          MaSP: commentData.CT_DonDatHang?.ChiTietSanPham?.SanPham?.MaSP || 0,
          TenSP: commentData.CT_DonDatHang?.ChiTietSanPham?.SanPham?.TenSP || '',
          MoTa: commentData.CT_DonDatHang?.ChiTietSanPham?.SanPham?.MoTa || '',

          // Thông tin biến thể
          ChiTiet: {
            MaCTSP: commentData.CT_DonDatHang?.ChiTietSanPham?.MaCTSP || 0,
            KichThuoc: {
              MaKichThuoc: commentData.CT_DonDatHang?.ChiTietSanPham?.KichThuoc?.MaKichThuoc || 0,
              TenKichThuoc: commentData.CT_DonDatHang?.ChiTietSanPham?.KichThuoc?.TenKichThuoc || ''
            },
            MauSac: {
              MaMau: commentData.CT_DonDatHang?.ChiTietSanPham?.Mau?.MaMau || 0,
              TenMau: commentData.CT_DonDatHang?.ChiTietSanPham?.Mau?.TenMau || '',
              MaHex: commentData.CT_DonDatHang?.ChiTietSanPham?.Mau?.MaHex || ''
            }
          },

          // Hình ảnh sản phẩm
          HinhAnh: commentData.CT_DonDatHang?.ChiTietSanPham?.SanPham?.AnhSanPhams?.[0] ? {
            MaAnh: commentData.CT_DonDatHang.ChiTietSanPham.SanPham.AnhSanPhams[0].MaAnh,
            TenFile: commentData.CT_DonDatHang.ChiTietSanPham.SanPham.AnhSanPhams[0].TenFile,
            DuongDan: commentData.CT_DonDatHang.ChiTietSanPham.SanPham.AnhSanPhams[0].DuongDan,
            AnhChinh: commentData.CT_DonDatHang.ChiTietSanPham.SanPham.AnhSanPhams[0].AnhChinh,
            ThuTu: commentData.CT_DonDatHang.ChiTietSanPham.SanPham.AnhSanPhams[0].ThuTu
          } : null
        },

        // Thông tin đơn hàng (đơn giản hóa)
        DonHang: {
          MaDDH: commentData.CT_DonDatHang?.DonDatHang?.MaDDH || 0,
          NgayTao: commentData.CT_DonDatHang?.DonDatHang?.NgayTao || '',
          MaTTDH: commentData.CT_DonDatHang?.DonDatHang?.MaTTDH || 0
        },

        // Thông tin chi tiết đơn hàng
        ChiTietDonHang: {
          MaCTDDH: commentData.MaCTDonDatHang || 0,
          SoLuong: commentData.CT_DonDatHang?.SoLuong || 0,
          DonGia: parseFloat(commentData.CT_DonDatHang?.DonGia) || 0,
          ThanhTien: (parseFloat(commentData.CT_DonDatHang?.DonGia) || 0) * (commentData.CT_DonDatHang?.SoLuong || 0)
        }
      };
    });

    // Tính lại count cho filteredRows
    const filteredCount = filteredRows.length;

    return {
      comments: commentsWithDetails,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredCount / limit),
        totalItems: filteredCount,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < Math.ceil(filteredCount / limit),
        hasPrevPage: parseInt(page) > 1
      },
      summary: {
        totalComments: filteredCount,
        averageRating: filteredCount > 0 ? (commentsWithDetails.reduce((sum, comment) => sum + comment.SoSao, 0) / filteredCount).toFixed(1) : 0,
        ratingDistribution: this.calculateRatingDistribution(commentsWithDetails)
      }
    };
  },

  // Helper function để tính phân bổ đánh giá
  calculateRatingDistribution: (comments) => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    comments.forEach(comment => {
      if (comment.SoSao >= 1 && comment.SoSao <= 5) {
        distribution[comment.SoSao]++;
      }
    });
    return distribution;
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
