const {
  DonDatHang,
  CT_DonDatHang,
  PhieuTraHang,
  PhieuChi,
  KhachHang,
  NhanVien,
  TrangThaiDH,
  ChiTietSanPham,
  SanPham,
  AnhSanPham,
  KichThuoc,
  Mau,
  HoaDon,
  sequelize
} = require('../models');
const { Op } = require('sequelize');

const TraHangService = {
  // Khách hàng yêu cầu trả hàng - chỉ cập nhật trạng thái đơn hàng
  requestReturn: async (maKH, maDDH, danhSachSanPham, lyDo) => {
    const transaction = await sequelize.transaction();

    try {
      // Kiểm tra đơn hàng tồn tại và thuộc về khách hàng
      const donHang = await DonDatHang.findOne({
        where: {
          MaDDH: maDDH,
          MaKH: maKH
        },
        include: [
          {
            model: TrangThaiDH,
            attributes: ['MaTTDH', 'TrangThai']
          },
          {
            model: CT_DonDatHang,
            include: [
              {
                model: ChiTietSanPham,
                include: [
                  {
                    model: SanPham,
                    attributes: ['TenSP']
                  },
                  {
                    model: KichThuoc,
                    attributes: ['TenKichThuoc']
                  },
                  {
                    model: Mau,
                    attributes: ['TenMau']
                  }
                ]
              }
            ]
          }
        ],
        transaction
      });

      if (!donHang) {
        throw new Error('Không tìm thấy đơn hàng hoặc đơn hàng không thuộc về bạn');
      }

      // Kiểm tra trạng thái đơn hàng (chỉ cho phép trả hàng khi đã hoàn tất)
      if (donHang.MaTTDH !== 4) {
        throw new Error('Chỉ có thể yêu cầu trả hàng cho đơn hàng đã hoàn tất');
      }

      // Kiểm tra thời hạn trả hàng (ví dụ: trong vòng 7 ngày)
      const ngayTao = new Date(donHang.NgayTao);
      const ngayHienTai = new Date();
      const soNgayKeCu = Math.floor((ngayHienTai - ngayTao) / (1000 * 60 * 60 * 24));

      if (soNgayKeCu > 7) {
        throw new Error('Đã quá thời hạn trả hàng (7 ngày kể từ ngày đặt hàng)');
      }

      // Validate danh sách sản phẩm trả
      const chiTietSanPhamTra = [];
      let tongTienTra = 0;

      for (const item of danhSachSanPham) {
        const { maCTDDH, soLuongTra } = item;

        // Tìm chi tiết đơn hàng tương ứng
        const chiTietDonHang = donHang.CT_DonDatHangs.find(ct => ct.MaCTDDH === maCTDDH);

        if (!chiTietDonHang) {
          throw new Error(`Không tìm thấy sản phẩm với mã chi tiết ${maCTDDH} trong đơn hàng`);
        }

        // Kiểm tra số lượng trả không vượt quá số lượng đã mua
        if (soLuongTra > chiTietDonHang.SoLuong) {
          const tenSP = chiTietDonHang.ChiTietSanPham?.SanPham?.TenSP || 'Sản phẩm';
          throw new Error(`Số lượng trả (${soLuongTra}) không được vượt quá số lượng đã mua (${chiTietDonHang.SoLuong}) cho sản phẩm ${tenSP}`);
        }

        // Kiểm tra số lượng trả phải > 0
        if (soLuongTra <= 0) {
          throw new Error('Số lượng trả phải lớn hơn 0');
        }

        // Tính toán tiền trả
        const tienTraSanPham = chiTietDonHang.DonGia * soLuongTra;
        tongTienTra += tienTraSanPham;

        chiTietSanPhamTra.push({
          maCTDDH: maCTDDH,
          soLuongTra: soLuongTra,
          donGia: chiTietDonHang.DonGia,
          thanhTien: tienTraSanPham,
          tenSanPham: chiTietDonHang.ChiTietSanPham?.SanPham?.TenSP,
          kichThuoc: chiTietDonHang.ChiTietSanPham?.KichThuoc?.TenKichThuoc,
          mauSac: chiTietDonHang.ChiTietSanPham?.Mau?.TenMau
        });
      }

      // Cập nhật trạng thái đơn hàng thành "Trả hàng" (mã 7)
      await donHang.update({
        MaTTDH: 7
      }, { transaction });

      await transaction.commit();

      return {
        MaDDH: donHang.MaDDH,
        MaTTDH: 7,
        LyDoYeuCau: lyDo,
        NgayYeuCau: new Date(),
        TrangThai: 'Đã yêu cầu trả hàng',
        danhSachSanPhamTra: chiTietSanPhamTra,
        tongTienTra: tongTienTra
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Nhân viên tạo phiếu trả hàng chính thức
  createReturnSlip: async (maNV, maDDH, danhSachSanPham, lyDo) => {
    const transaction = await sequelize.transaction();

    try {
      // Kiểm tra đơn hàng có trạng thái trả hàng và có hóa đơn
      const donHang = await DonDatHang.findOne({
        where: {
          MaDDH: maDDH,
          MaTTDH: 7 // Trạng thái yêu cầu trả hàng
        },
        include: [
          {
            model: HoaDon,
            attributes: ['SoHD']
          },
          {
            model: CT_DonDatHang,
            include: [
              {
                model: ChiTietSanPham,
                include: [
                  {
                    model: SanPham,
                    attributes: ['TenSP']
                  }
                ]
              }
            ]
          }
        ],
        transaction
      });

      if (!donHang) {
        throw new Error('Không tìm thấy đơn hàng có yêu cầu trả hàng');
      }

      if (!donHang.HoaDon) {
        throw new Error('Đơn hàng chưa có hóa đơn');
      }

      // Validate danh sách sản phẩm trả
      let tongTienTra = 0;
      for (const item of danhSachSanPham) {
        const { maCTDDH, soLuongTra } = item;
        const chiTietDonHang = donHang.CT_DonDatHangs.find(ct => ct.MaCTDDH === maCTDDH);

        if (!chiTietDonHang) {
          throw new Error(`Không tìm thấy sản phẩm với mã chi tiết ${maCTDDH}`);
        }

        if (soLuongTra > chiTietDonHang.SoLuong || soLuongTra <= 0) {
          throw new Error('Số lượng trả không hợp lệ');
        }

        tongTienTra += chiTietDonHang.DonGia * soLuongTra;
      }

      // Tạo phiếu trả hàng
      const phieuTraHang = await PhieuTraHang.create({
        SoHD: donHang.HoaDon.SoHD,
        NVLap: maNV,
        NgayTra: new Date(),
        LyDo: lyDo
      }, { transaction });

      await transaction.commit();

      return {
        MaPhieuTra: phieuTraHang.MaPhieuTra,
        SoHD: phieuTraHang.SoHD,
        NgayTra: phieuTraHang.NgayTra,
        LyDo: phieuTraHang.LyDo,
        TongTienTra: tongTienTra,
        DanhSachSanPham: danhSachSanPham
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Tạo phiếu chi cho phiếu trả hàng
  createReturnPayment: async (maPhieuTra, soTien, lyDo, nhanVienLap) => {
    const transaction = await sequelize.transaction();

    try {
      // Kiểm tra phiếu trả hàng tồn tại
      const phieuTraHang = await PhieuTraHang.findByPk(maPhieuTra, { transaction });

      if (!phieuTraHang) {
        throw new Error('Không tìm thấy phiếu trả hàng');
      }

      // Tạo phiếu chi
      const phieuChi = await PhieuChi.create({
        MaPhieuTra: maPhieuTra,
        SoTien: soTien,
        LyDo: lyDo,
        NgayLap: new Date(),
        NVLap: nhanVienLap,
        TrangThai: 'CHO_DUYET'
      }, { transaction });

      await transaction.commit();

      return phieuChi;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Lấy danh sách yêu cầu trả hàng
  getReturnRequests: async (page = 1, limit = 10, trangThai = null) => {
    try {
      const offset = (page - 1) * limit;
      const whereCondition = {};

      if (trangThai) {
        whereCondition.MaTTDH = trangThai;
      } else {
        whereCondition.MaTTDH = 7; // Mặc định lấy đơn hàng có yêu cầu trả hàng
      }

      const { count, rows } = await DonDatHang.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: KhachHang,
            attributes: ['MaKH', 'TenKH', 'SDT']
          },
          {
            model: TrangThaiDH,
            attributes: ['MaTTDH', 'TrangThai']
          },
          {
            model: CT_DonDatHang,
            include: [
              {
                model: ChiTietSanPham,
                include: [
                  {
                    model: SanPham,
                    attributes: ['MaSP', 'TenSP'],
                    include: [
                      {
                        model: AnhSanPham,
                        where: { AnhChinh: true },
                        required: false,
                        attributes: ['DuongDan']
                      }
                    ]
                  },
                  {
                    model: KichThuoc,
                    attributes: ['TenKichThuoc']
                  },
                  {
                    model: Mau,
                    attributes: ['TenMau', 'MaHex']
                  }
                ]
              }
            ]
          }
        ],
        order: [['NgayTao', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      return {
        data: rows,
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

  // Lấy chi tiết yêu cầu trả hàng
  getReturnRequestDetail: async (maDDH) => {
    try {
      const donHang = await DonDatHang.findOne({
        where: { MaDDH: maDDH, MaTTDH: 7 },
        include: [
          {
            model: KhachHang,
            attributes: ['MaKH', 'TenKH', 'SDT']
          },
          {
            model: TrangThaiDH,
            attributes: ['MaTTDH', 'TrangThai']
          },
          {
            model: CT_DonDatHang,
            include: [
              {
                model: ChiTietSanPham,
                include: [
                  {
                    model: SanPham,
                    attributes: ['MaSP', 'TenSP', 'MoTa'],
                    include: [
                      {
                        model: AnhSanPham,
                        where: { AnhChinh: true },
                        required: false,
                        attributes: ['DuongDan']
                      }
                    ]
                  },
                  {
                    model: KichThuoc,
                    attributes: ['TenKichThuoc']
                  },
                  {
                    model: Mau,
                    attributes: ['TenMau', 'MaHex']
                  }
                ]
              }
            ]
          }
        ]
      });

      return donHang;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = TraHangService;
