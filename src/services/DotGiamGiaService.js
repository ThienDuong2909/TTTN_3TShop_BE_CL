const {
  DotGiamGia,
  CT_DotGiamGia,
  SanPham,
  AnhSanPham,
  LoaiSP,
  ThayDoiGia,
  sequelize
} = require('../models');
const { Op } = require('sequelize');

const DotGiamGiaService = {
  // Tạo đợt giảm giá mới
  createDotGiamGia: async (ngayBatDau, ngayKetThuc, moTa, danhSachSanPham = []) => {
    const transaction = await sequelize.transaction();

    try {
      // Validate ngày
      const startDate = new Date(ngayBatDau);
      const endDate = new Date(ngayKetThuc);
      const currentDate = new Date();

      if (startDate >= endDate) {
        throw new Error('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
      }

      if (endDate <= currentDate) {
        throw new Error('Ngày kết thúc phải lớn hơn ngày hiện tại');
      }

      // Tạo đợt giảm giá
      const dotGiamGia = await DotGiamGia.create({
        NgayBatDau: ngayBatDau,
        NgayKetThuc: ngayKetThuc,
        MoTa: moTa
      }, { transaction });

      // Thêm sản phẩm vào đợt giảm giá nếu có
      const chiTietDotGiamGia = [];
      if (danhSachSanPham && danhSachSanPham.length > 0) {
        for (const item of danhSachSanPham) {
          const { maSP, phanTramGiam } = item;

          // Validate sản phẩm tồn tại
          const sanPham = await SanPham.findByPk(maSP);
          if (!sanPham) {
            throw new Error(`Không tìm thấy sản phẩm với mã ${maSP}`);
          }

          // Validate phần trăm giảm
          if (phanTramGiam <= 0 || phanTramGiam > 100) {
            throw new Error('Phần trăm giảm phải từ 0.01% đến 100%');
          }

          // Tạo chi tiết đợt giảm giá
          const chiTiet = await CT_DotGiamGia.create({
            MaDot: dotGiamGia.MaDot,
            MaSP: maSP,
            PhanTramGiam: phanTramGiam
          }, { transaction });

          chiTietDotGiamGia.push({
            MaCTDGG: chiTiet.MaCTDGG,
            MaSP: maSP,
            TenSP: sanPham.TenSP,
            PhanTramGiam: phanTramGiam
          });
        }
      }

      await transaction.commit();

      return {
        MaDot: dotGiamGia.MaDot,
        NgayBatDau: dotGiamGia.NgayBatDau,
        NgayKetThuc: dotGiamGia.NgayKetThuc,
        MoTa: dotGiamGia.MoTa,
        SoLuongSanPham: chiTietDotGiamGia.length,
        DanhSachSanPham: chiTietDotGiamGia
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Thêm sản phẩm vào đợt giảm giá
  addSanPhamToDot: async (maDot, danhSachSanPham) => {
    const transaction = await sequelize.transaction();

    try {
      // Kiểm tra đợt giảm giá tồn tại
      const dotGiamGia = await DotGiamGia.findByPk(maDot, { transaction });
      if (!dotGiamGia) {
        throw new Error('Không tìm thấy đợt giảm giá');
      }

      // Kiểm tra đợt giảm giá còn hiệu lực
      const currentDate = new Date();
      if (new Date(dotGiamGia.NgayKetThuc) <= currentDate) {
        throw new Error('Đợt giảm giá đã kết thúc, không thể thêm sản phẩm');
      }

      const chiTietMoi = [];
      for (const item of danhSachSanPham) {
        const { maSP, phanTramGiam } = item;

        // Validate sản phẩm tồn tại
        const sanPham = await SanPham.findByPk(maSP);
        if (!sanPham) {
          throw new Error(`Không tìm thấy sản phẩm với mã ${maSP}`);
        }

        // Validate phần trăm giảm
        if (phanTramGiam <= 0 || phanTramGiam > 100) {
          throw new Error('Phần trăm giảm phải từ 0.01% đến 100%');
        }

        // Kiểm tra sản phẩm đã có trong đợt này chưa
        const existingInThisDot = await CT_DotGiamGia.findOne({
          where: { 
            MaDot: maDot, 
            MaSP: maSP 
          },
          transaction
        });

        if (existingInThisDot) {
          throw new Error(`Sản phẩm ${sanPham.TenSP} đã có trong đợt giảm giá này`);
        }

        // Kiểm tra sản phẩm có trong đợt giảm giá khác đang hoạt động
        const existingInOtherDot = await CT_DotGiamGia.findOne({
          where: { MaSP: maSP },
          include: [{
            model: DotGiamGia,
            where: {
              NgayKetThuc: { [Op.gte]: currentDate },
              MaDot: { [Op.ne]: maDot }
            }
          }],
          transaction
        });

        if (existingInOtherDot) {
          throw new Error(`Sản phẩm ${sanPham.TenSP} đã có trong đợt giảm giá khác đang hoạt động`);
        }

        // Tạo chi tiết đợt giảm giá
        const chiTiet = await CT_DotGiamGia.create({
          MaDot: maDot,
          MaSP: maSP,
          PhanTramGiam: phanTramGiam
        }, { transaction });

        chiTietMoi.push({
          MaCTDGG: chiTiet.MaCTDGG,
          MaSP: maSP,
          TenSP: sanPham.TenSP,
          PhanTramGiam: phanTramGiam
        });
      }

      await transaction.commit();

      return {
        MaDot: maDot,
        ThongBao: `Đã thêm ${chiTietMoi.length} sản phẩm vào đợt giảm giá`,
        DanhSachSanPhamMoi: chiTietMoi
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Lấy danh sách đợt giảm giá
  getDotGiamGiaList: async (page = 1, limit = 10, trangThai = null) => {
    try {
      const offset = (page - 1) * limit;
      const whereCondition = {};
      const currentDate = new Date();

      // Filter theo trạng thái
      if (trangThai === 'active') {
        whereCondition.NgayBatDau = { [Op.lte]: currentDate };
        whereCondition.NgayKetThuc = { [Op.gte]: currentDate };
      } else if (trangThai === 'upcoming') {
        whereCondition.NgayBatDau = { [Op.gt]: currentDate };
      } else if (trangThai === 'expired') {
        whereCondition.NgayKetThuc = { [Op.lt]: currentDate };
      }

      const { count, rows } = await DotGiamGia.findAndCountAll({
        where: whereCondition,
        include: [{
          model: CT_DotGiamGia,
          include: [{
            model: SanPham,
            attributes: ['MaSP', 'TenSP'],
            include: [
              {
                model: AnhSanPham,
                where: { AnhChinh: true },
                required: false,
                attributes: ['DuongDan']
              },
              {
                model: ThayDoiGia,
                attributes: ['Gia', 'NgayApDung'],
                where: {
                  NgayApDung: {
                    [Op.lte]: currentDate
                  }
                },
                order: [['NgayApDung', 'DESC']],
                limit: 1,
                required: false
              }
            ]
          }]
        }],
        order: [['MaDot', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      // Thêm thông tin trạng thái cho mỗi đợt giảm giá
      const processedRows = rows.map(dot => {
        const startDate = new Date(dot.NgayBatDau);
        const endDate = new Date(dot.NgayKetThuc);
        
        let trangThai = '';
        if (currentDate < startDate) {
          trangThai = 'Sắp diễn ra';
        } else if (currentDate >= startDate && currentDate <= endDate) {
          trangThai = 'Đang diễn ra';
        } else {
          trangThai = 'Đã kết thúc';
        }

        return {
          ...dot.toJSON(),
          TrangThai: trangThai,
          SoLuongSanPham: (dot.CT_DotGiamGias || dot.CT_DotGiamGia) ? (dot.CT_DotGiamGias || dot.CT_DotGiamGia).length : 0
        };
      });

      return {
        data: processedRows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < Math.ceil(count / limit),
          hasPrevPage: parseInt(page) > 1
        }
      };
    } catch (error) {
      throw error;
    }
  },

  // Get discount period details
  getDotGiamGiaDetail: async (maDot) => {
    try {
      const currentDate = new Date();
      
      const dotGiamGia = await DotGiamGia.findByPk(maDot, {
        include: [{
          model: CT_DotGiamGia,
          include: [{
            model: SanPham,
            attributes: ['MaSP', 'TenSP', 'MoTa'],
            include: [
              {
                model: AnhSanPham,
                where: { AnhChinh: true },
                required: false,
                attributes: ['DuongDan']
              },
              {
                model: LoaiSP,
                attributes: ['MaLoaiSP', 'TenLoai'],
                required: false
              },
              {
                model: ThayDoiGia,
                attributes: ['Gia', 'NgayApDung'],
                where: {
                  NgayApDung: {
                    [Op.lte]: currentDate
                  }
                },
                order: [['NgayApDung', 'DESC']],
                limit: 1,
                required: false
              }
            ]
          }]
        }]
      });

      if (!dotGiamGia) {
        throw new Error('Không tìm thấy đợt giảm giá');
      }

      // Calculate status
      const startDate = new Date(dotGiamGia.NgayBatDau);
      const endDate = new Date(dotGiamGia.NgayKetThuc);
      
      let trangThai = '';
      if (currentDate < startDate) {
        trangThai = 'Sắp diễn ra';
      } else if (currentDate >= startDate && currentDate <= endDate) {
        trangThai = 'Đang diễn ra';
      } else {
        trangThai = 'Đã kết thúc';
      }

      // Calculate statistics
      const ctDotGiamGia = dotGiamGia.CT_DotGiamGias || dotGiamGia.CT_DotGiamGia || [];
      const danhSachSanPham = ctDotGiamGia.map(ct => {
        // Get current price from ThayDoiGia
        const currentPrice = ct.SanPham.ThayDoiGias && ct.SanPham.ThayDoiGias.length > 0 
          ? parseFloat(ct.SanPham.ThayDoiGias[0].Gia)
          : 0;
        
        const phanTramGiam = parseFloat(ct.PhanTramGiam);
        const giaSauGiam = currentPrice * (1 - phanTramGiam / 100);

        return {
          MaCTDGG: ct.MaCTDGG,
          MaSP: ct.MaSP,
          TenSP: ct.SanPham.TenSP,
          MoTa: ct.SanPham.MoTa,
          GiaGoc: currentPrice,
          PhanTramGiam: phanTramGiam,
          GiaSauGiam: giaSauGiam,
          TietKiem: currentPrice - giaSauGiam,
          TenLoaiSP: ct.SanPham.LoaiSP?.TenLoai,
          AnhChinh: ct.SanPham.AnhSanPhams[0]?.DuongDan || null
        };
      });

      return {
        MaDot: dotGiamGia.MaDot,
        NgayBatDau: dotGiamGia.NgayBatDau,
        NgayKetThuc: dotGiamGia.NgayKetThuc,
        MoTa: dotGiamGia.MoTa,
        TrangThai: trangThai,
        SoLuongSanPham: danhSachSanPham.length,
        DanhSachSanPham: danhSachSanPham
      };
    } catch (error) {
      throw error;
    }
  },

  // Xóa sản phẩm khỏi đợt giảm giá
  removeSanPhamFromDot: async (maDot, maSP) => {
    const transaction = await sequelize.transaction();

    try {
      // Kiểm tra đợt giảm giá tồn tại
      const dotGiamGia = await DotGiamGia.findByPk(maDot, { transaction });
      if (!dotGiamGia) {
        throw new Error('Không tìm thấy đợt giảm giá');
      }

      // Kiểm tra chi tiết tồn tại
      const chiTiet = await CT_DotGiamGia.findOne({
        where: { MaDot: maDot, MaSP: maSP },
        include: [{ model: SanPham, attributes: ['TenSP'] }],
        transaction
      });

      if (!chiTiet) {
        throw new Error('Không tìm thấy sản phẩm trong đợt giảm giá này');
      }

      // Xóa chi tiết
      await chiTiet.destroy({ transaction });

      await transaction.commit();

      return {
        MaDot: maDot,
        MaSP: maSP,
        TenSP: chiTiet.SanPham.TenSP,
        ThongBao: 'Đã xóa sản phẩm khỏi đợt giảm giá'
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Cập nhật phần trăm giảm giá
  updatePhanTramGiam: async (maDot, maSP, phanTramGiamMoi) => {
    const transaction = await sequelize.transaction();

    try {
      // Validate phần trăm giảm
      if (phanTramGiamMoi <= 0 || phanTramGiamMoi > 100) {
        throw new Error('Phần trăm giảm phải từ 0.01% đến 100%');
      }

      // Tìm và cập nhật chi tiết
      const chiTiet = await CT_DotGiamGia.findOne({
        where: { MaDot: maDot, MaSP: maSP },
        include: [{ model: SanPham, attributes: ['TenSP'] }],
        transaction
      });

      if (!chiTiet) {
        throw new Error('Không tìm thấy sản phẩm trong đợt giảm giá này');
      }

      const phanTramGiamCu = chiTiet.PhanTramGiam;
      await chiTiet.update({ PhanTramGiam: phanTramGiamMoi }, { transaction });

      await transaction.commit();

      return {
        MaDot: maDot,
        MaSP: maSP,
        TenSP: chiTiet.SanPham.TenSP,
        PhanTramGiamCu: phanTramGiamCu,
        PhanTramGiamMoi: phanTramGiamMoi,
        ThongBao: 'Đã cập nhật phần trăm giảm giá'
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Delete discount period
  deleteDotGiamGia: async (maDot) => {
    const transaction = await sequelize.transaction();
    
    try {
      // Check if discount period exists
      const dotGiamGia = await DotGiamGia.findByPk(maDot);
      if (!dotGiamGia) {
        throw new Error('Không tìm thấy đợt giảm giá');
      }

      // Check if discount period is currently active
      const currentDate = new Date();
      const startDate = new Date(dotGiamGia.NgayBatDau);
      const endDate = new Date(dotGiamGia.NgayKetThuc);
      
      if (currentDate >= startDate && currentDate <= endDate) {
        throw new Error('Không thể xóa đợt giảm giá đang diễn ra');
      }

      // Delete all related discount details first
      await CT_DotGiamGia.destroy({
        where: { MaDot: maDot },
        transaction
      });

      // Delete the discount period
      await DotGiamGia.destroy({
        where: { MaDot: maDot },
        transaction
      });

      await transaction.commit();

      return {
        MaDot: maDot,
        ThongBao: 'Xóa đợt giảm giá thành công'
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Validate discount period dates for overlapping
  validateDiscountPeriod: async (ngayBatDau, ngayKetThuc) => {
    try {
      // Validate input dates
      const startDate = new Date(ngayBatDau);
      const endDate = new Date(ngayKetThuc);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Ngày bắt đầu và ngày kết thúc phải có định dạng hợp lệ');
      }

      if (startDate >= endDate) {
        throw new Error('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
      }

      // Check for overlapping discount periods
      const whereCondition = {
        [Op.or]: [
          // Case 1: Existing period starts within new period
          {
            NgayBatDau: {
              [Op.between]: [ngayBatDau, ngayKetThuc]
            }
          },
          // Case 2: Existing period ends within new period  
          {
            NgayKetThuc: {
              [Op.between]: [ngayBatDau, ngayKetThuc]
            }
          },
          // Case 3: New period is completely within existing period
          {
            [Op.and]: [
              { NgayBatDau: { [Op.lte]: ngayBatDau } },
              { NgayKetThuc: { [Op.gte]: ngayKetThuc } }
            ]
          },
          // Case 4: Existing period is completely within new period
          {
            [Op.and]: [
              { NgayBatDau: { [Op.gte]: ngayBatDau } },
              { NgayKetThuc: { [Op.lte]: ngayKetThuc } }
            ]
          }
        ]
      };

      const overlappingPeriods = await DotGiamGia.findAll({
        where: whereCondition,
        attributes: ['MaDot', 'NgayBatDau', 'NgayKetThuc', 'MoTa']
      });

      if (overlappingPeriods.length > 0) {
        const conflicts = overlappingPeriods.map(period => ({
          MaDot: period.MaDot,
          NgayBatDau: period.NgayBatDau,
          NgayKetThuc: period.NgayKetThuc,
          MoTa: period.MoTa
        }));

        return {
          valid: false,
          message: 'Khoảng thời gian này trùng với đợt giảm giá khác đang hoạt động',
          conflicts: conflicts
        };
      }

      return {
        valid: true,
        message: 'Khoảng thời gian hợp lệ, không có xung đột với đợt giảm giá khác'
      };
    } catch (error) {
      throw error;
    }
  }
};

module.exports = DotGiamGiaService;
