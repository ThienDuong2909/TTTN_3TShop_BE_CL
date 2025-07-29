const { DonDatHang, HoaDon, KhachHang, NhanVien, TrangThaiDH, CT_DonDatHang, ChiTietSanPham, SanPham, KichThuoc, Mau } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../models/sequelize');

const HoaDonService = {
  // Tạo hóa đơn mới
  createInvoice: async (maDDH, maNVLap = null) => {
    const transaction = await sequelize.transaction();
    
    try {
      // Kiểm tra đơn hàng có tồn tại và đã được duyệt chưa
      const order = await DonDatHang.findByPk(maDDH, {
        include: [
          {
            model: TrangThaiDH,
            attributes: ['MaTTDH', 'TrangThai']
          }
        ],
        transaction
      });

      if (!order) {
        throw new Error('Không tìm thấy đơn hàng');
      }

      // Chỉ cho phép tạo hóa đơn cho đơn hàng đã duyệt (trạng thái >= 2)
      if (order.MaTTDH < 2) {
        throw new Error('Chỉ có thể tạo hóa đơn cho đơn hàng đã được duyệt');
      }

      // Kiểm tra xem đã có hóa đơn cho đơn hàng này chưa
      const existingHoaDon = await HoaDon.findOne({
        where: { MaDDH: maDDH },
        transaction
      });

      if (existingHoaDon) {
        throw new Error('Đơn hàng này đã có hóa đơn');
      }

      // Tạo số hóa đơn tự động (format: HD + timestamp + random)
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const soHD = `HD${timestamp}${randomNum}`;

      // Tạo hóa đơn
      const hoaDon = await HoaDon.create({
        SoHD: soHD,
        MaDDH: maDDH,
        NgayLap: new Date(),
        MaNVLap: maNVLap
      }, { transaction });

      await transaction.commit();

      // Trả về thông tin hóa đơn vừa tạo
      return await HoaDonService.getHoaDonDetail(soHD);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Lấy thông tin chi tiết hóa đơn
  getHoaDonDetail: async (soHD) => {
    try {
      const hoaDon = await HoaDon.findByPk(soHD, {
        include: [
          {
            model: DonDatHang,
            include: [
              // Thông tin khách hàng
              {
                model: KhachHang,
                attributes: ['MaKH', 'TenKH', 'SDT', 'DiaChi', 'CCCD']
              },
              // Trạng thái đơn hàng
              {
                model: TrangThaiDH,
                attributes: ['MaTTDH', 'TrangThai']
              },
              // Nhân viên giao hàng
              {
                model: NhanVien,
                as: 'NguoiGiao',
                attributes: ['MaNV', 'TenNV'],
                required: false
              },
              // Chi tiết sản phẩm
              {
                model: CT_DonDatHang,
                include: [
                  {
                    model: ChiTietSanPham,
                    include: [
                      {
                        model: SanPham,
                        attributes: ['MaSP', 'TenSP', 'MoTa']
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
          },
          // Nhân viên lập hóa đơn
          {
            model: NhanVien,
            as: 'NguoiLap',
            attributes: ['MaNV', 'TenNV'],
            required: false
          }
        ]
      });

      if (!hoaDon) {
        return null;
      }

      const hoaDonData = hoaDon.toJSON();
      const donHang = hoaDonData.DonDatHang;

      // Tính tổng tiền và format dữ liệu sản phẩm
      let tongTien = 0;
      const danhSachSanPham = donHang.CT_DonDatHangs.map(item => {
        const thanhTien = parseFloat(item.DonGia) * item.SoLuong;
        tongTien += thanhTien;

        return {
          MaCTDDH: item.MaCTDDH,
          TenSanPham: item.ChiTietSanPham.SanPham.TenSP,
          MauSac: {
            TenMau: item.ChiTietSanPham.Mau.TenMau,
            MaHex: item.ChiTietSanPham.Mau.MaHex
          },
          KichThuoc: item.ChiTietSanPham.KichThuoc.TenKichThuoc,
          SoLuong: item.SoLuong,
          DonGia: parseFloat(item.DonGia),
          ThanhTien: thanhTien
        };
      });

      // Format response data
      return {
        ThongTinHoaDon: {
          SoHD: hoaDonData.SoHD,
          NgayLap: hoaDonData.NgayLap,
          NhanVienLap: hoaDonData.NguoiLap ? {
            MaNV: hoaDonData.NguoiLap.MaNV,
            TenNV: hoaDonData.NguoiLap.TenNV,
            SDT: hoaDonData.NguoiLap.SDT
          } : null
        },
        ThongTinDonHang: {
          MaDDH: donHang.MaDDH,
          NgayDat: donHang.NgayTao,
          TrangThai: {
            Ma: donHang.TrangThaiDH.MaTTDH,
            Ten: donHang.TrangThaiDH.TrangThai
          },
          NhanVienGiao: donHang.NguoiGiao ? {
            MaNV: donHang.NguoiGiao.MaNV,
            TenNV: donHang.NguoiGiao.TenNV,
            SDT: donHang.NguoiGiao.SDT
          } : null
        },
        ThongTinKhachHang: {
          MaKH: donHang.KhachHang.MaKH,
          TenKH: donHang.KhachHang.TenKH,
          SDT: donHang.KhachHang.SDT,
          DiaChi: donHang.KhachHang.DiaChi,
          CCCD: donHang.KhachHang.CCCD
        },
        ThongTinNguoiNhan: {
          HoTen: donHang.NguoiNhan,
          SDT: donHang.SDT,
          DiaChi: donHang.DiaChiGiao
        },
        DanhSachSanPham: danhSachSanPham,
        TongGiaTri: {
          TongTien: tongTien,
          SoLuongSanPham: danhSachSanPham.length,
          TongSoLuong: danhSachSanPham.reduce((total, item) => total + item.SoLuong, 0)
        }
      };
    } catch (error) {
      console.error('Error in getHoaDonDetail:', error);
      throw error;
    }
  },

  // Lấy hóa đơn theo mã đơn hàng
  getHoaDonByOrderId: async (maDDH) => {
    try {
      const hoaDon = await HoaDon.findOne({
        where: { MaDDH: maDDH }
      });

      if (!hoaDon) {
        return null;
      }

      return await HoaDonService.getHoaDonDetail(hoaDon.SoHD);
    } catch (error) {
      console.error('Error in getHoaDonByOrderId:', error);
      throw error;
    }
  },

  // Lấy danh sách tất cả hóa đơn với phân trang và tìm kiếm
  getAllHoaDon: async (page = 1, limit = 10, search = '') => {
    try {
      const offset = (page - 1) * limit;
      
      // Build where clause for search
      let whereClause = {};
      if (search && search.trim()) {
        whereClause = {
          [Op.or]: [
            { SoHD: { [Op.like]: `%${search}%` } },
            { '$DonDatHang.NguoiNhan$': { [Op.like]: `%${search}%` } },
            { '$DonDatHang.KhachHang.TenKH$': { [Op.like]: `%${search}%` } }
          ]
        };
      }

      const { count, rows } = await HoaDon.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: DonDatHang,
            include: [
              {
                model: KhachHang,
                attributes: ['MaKH', 'TenKH', 'SDT']
              },
              {
                model: TrangThaiDH,
                attributes: ['MaTTDH', 'TrangThai']
              }
            ]
          },
          {
            model: NhanVien,
            as: 'NguoiLap',
            attributes: ['MaNV', 'TenNV'],
            required: false
          }
        ],
        order: [['NgayLap', 'DESC']],
        limit: parseInt(limit),
        offset: offset,
        distinct: true
      });

      // Format response data
      const hoaDonList = rows.map(hoaDon => {
        const hoaDonData = hoaDon.toJSON();
        return {
          SoHD: hoaDonData.SoHD,
          NgayLap: hoaDonData.NgayLap,
          MaDDH: hoaDonData.DonDatHang.MaDDH,
          KhachHang: {
            TenKH: hoaDonData.DonDatHang.KhachHang.TenKH,
            SDT: hoaDonData.DonDatHang.KhachHang.SDT
          },
          NguoiNhan: hoaDonData.DonDatHang.NguoiNhan,
          TrangThaiDonHang: {
            Ma: hoaDonData.DonDatHang.TrangThaiDH.MaTTDH,
            Ten: hoaDonData.DonDatHang.TrangThaiDH.TrangThai
          },
          NhanVienLap: hoaDonData.NguoiLap ? {
            MaNV: hoaDonData.NguoiLap.MaNV,
            TenNV: hoaDonData.NguoiLap.TenNV
          } : null
        };
      });

      return {
        hoaDonList,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      };
    } catch (error) {
      console.error('Error in getAllHoaDon:', error);
      throw error;
    }
  }
};

module.exports = HoaDonService;
