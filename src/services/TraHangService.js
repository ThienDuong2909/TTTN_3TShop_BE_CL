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

  // Tạo phiếu trả hàng với trạng thái
  createReturnSlip: async (maDDH, danhSachSanPham, lyDo, trangThaiPhieu = 1) => {
    const transaction = await sequelize.transaction();

    try {
      // Validate trạng thái phiếu (1: Chờ duyệt, 2: Đã duyệt, 3: Từ chối)
      if (![1, 2, 3].includes(trangThaiPhieu)) {
        throw new Error('Trạng thái phiếu trả không hợp lệ. Chỉ chấp nhận 1, 2, hoặc 3');
      }

      // Kiểm tra đơn hàng có trạng thái trả hàng và có hóa đơn
      const donHang = await DonDatHang.findOne({
        where: {
          MaDDH: maDDH,
          // MaTTDH: 7 // Trạng thái yêu cầu trả hàng
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
        throw new Error('Không tìm thấy đơn hàng có yêu cầu trả hàng');
      }

      if (!donHang.HoaDon) {
        throw new Error('Đơn hàng chưa có hóa đơn');
      }

      // Validate danh sách sản phẩm trả và tính tổng tiền
      let tongTienTra = 0;
      const chiTietTraHang = [];
      
      for (const item of danhSachSanPham) {
        const { maCTDDH, soLuongTra } = item;
        const chiTietDonHang = donHang.CT_DonDatHangs.find(ct => ct.MaCTDDH === maCTDDH);

        if (!chiTietDonHang) {
          throw new Error(`Không tìm thấy sản phẩm với mã chi tiết ${maCTDDH}`);
        }

        // Kiểm tra số lượng trả hợp lệ
        if (soLuongTra <= 0) {
          throw new Error('Số lượng trả phải lớn hơn 0');
        }

        if (soLuongTra > chiTietDonHang.SoLuong) {
          const tenSP = chiTietDonHang.ChiTietSanPham?.SanPham?.TenSP || 'Sản phẩm';
          throw new Error(`Số lượng trả (${soLuongTra}) không được vượt quá số lượng đã mua (${chiTietDonHang.SoLuong}) cho ${tenSP}`);
        }

        // Kiểm tra nếu đã có phiếu trả hàng cho chi tiết này
        if (chiTietDonHang.MaPhieuTra) {
          const tenSP = chiTietDonHang.ChiTietSanPham?.SanPham?.TenSP || 'Sản phẩm';
          throw new Error(`${tenSP} đã được trả hàng trước đó`);
        }

        const tienTraSanPham = chiTietDonHang.DonGia * soLuongTra;
        tongTienTra += tienTraSanPham;

        chiTietTraHang.push({
          maCTDDH: maCTDDH,
          soLuongTra: soLuongTra,
          donGia: chiTietDonHang.DonGia,
          thanhTien: tienTraSanPham,
          tenSanPham: chiTietDonHang.ChiTietSanPham?.SanPham?.TenSP,
          kichThuoc: chiTietDonHang.ChiTietSanPham?.KichThuoc?.TenKichThuoc,
          mauSac: chiTietDonHang.ChiTietSanPham?.Mau?.TenMau
        });
      }

      // Tạo phiếu trả hàng
      const phieuTraHang = await PhieuTraHang.create({
        SoHD: donHang.HoaDon.SoHD,
        NgayTra: new Date(),
        LyDo: lyDo,
        TrangThai: trangThaiPhieu // Thêm trạng thái phiếu
      }, { transaction });

      // Cập nhật thông tin trả hàng vào bảng CT_DonDatHang
      for (const item of danhSachSanPham) {
        await CT_DonDatHang.update({
          MaPhieuTra: phieuTraHang.MaPhieuTra,
          SoLuongTra: item.soLuongTra
        }, {
          where: { MaCTDDH: item.maCTDDH },
          transaction
        });
      }

      // Cập nhật trạng thái đơn hàng thành "Trả hàng" (mã 7)
      await DonDatHang.update({
        MaTTDH: 7
      }, {
        where: { MaDDH: maDDH },
        transaction
      });

      await transaction.commit();

      return {
        MaPhieuTra: phieuTraHang.MaPhieuTra,
        SoHD: phieuTraHang.SoHD,
        NgayTra: phieuTraHang.NgayTra,
        LyDo: phieuTraHang.LyDo,
        TrangThai: phieuTraHang.TrangThai,
        TongTienTra: tongTienTra,
        DanhSachSanPhamTra: chiTietTraHang
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Tạo phiếu chi cho phiếu trả hàng
  createReturnPayment: async (maPhieuTra, soTien, maNVLap) => {
    const transaction = await sequelize.transaction();

    try {
      // Kiểm tra phiếu trả hàng tồn tại và đã được duyệt
      const phieuTraHang = await PhieuTraHang.findOne({
        where: {
          MaPhieuTra: maPhieuTra,
          TrangThai: 2 // Chỉ tạo phiếu chi cho phiếu trả đã được duyệt
        },
        include: [
          {
            model: HoaDon,
            attributes: ['SoHD', 'MaDDH'],
            include: [
              {
                model: DonDatHang,
                attributes: ['MaDDH'],
                include: [
                  {
                    model: CT_DonDatHang,
                    attributes: ['MaCTDDH', 'MaCTSP', 'SoLuongTra'],
                    where: {
                      MaPhieuTra: maPhieuTra
                    },
                    include: [
                      {
                        model: ChiTietSanPham,
                        attributes: ['MaCTSP', 'SoLuongTon']
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        transaction
      });

      if (!phieuTraHang) {
        throw new Error('Không tìm thấy phiếu trả hàng hoặc phiếu chưa được duyệt');
      }

      // Kiểm tra xem đã có phiếu chi cho phiếu trả này chưa
      const existingPhieuChi = await PhieuChi.findOne({
        where: { MaPhieuTra: maPhieuTra },
        transaction
      });

      if (existingPhieuChi) {
        throw new Error('Phiếu trả hàng này đã có phiếu chi');
      }

      // Validate số tiền
      if (!soTien || soTien <= 0) {
        throw new Error('Số tiền phải lớn hơn 0');
      }

      // Tạo phiếu chi
      const phieuChi = await PhieuChi.create({
        NgayChi: new Date(),
        SoTien: soTien,
        MaPhieuTra: maPhieuTra,
        MaNVLap: maNVLap,
        TrangThai: 1 // Mặc định trạng thái hoạt động
      }, { transaction });

      // Cập nhật tồn kho cho các chi tiết sản phẩm bị trả
      const chiTietDonHang = phieuTraHang.HoaDon?.DonDatHang?.CT_DonDatHangs || [];
      
      for (const ctddh of chiTietDonHang) {
        if (ctddh.SoLuongTra > 0) {
          // Tăng tồn kho bằng số lượng trả
          await ChiTietSanPham.update({
            SoLuongTon: sequelize.literal(`SoLuongTon + ${ctddh.SoLuongTra}`)
          }, {
            where: { MaCTSP: ctddh.MaCTSP },
            transaction
          });

          console.log(`Đã cập nhật tồn kho cho MaCTSP: ${ctddh.MaCTSP}, tăng thêm: ${ctddh.SoLuongTra}`);
        }
      }

      await transaction.commit();

      return {
        MaPhieuChi: phieuChi.MaPhieuChi,
        NgayChi: phieuChi.NgayChi,
        SoTien: phieuChi.SoTien,
        MaPhieuTra: phieuChi.MaPhieuTra,
        MaNVLap: phieuChi.MaNVLap,
        TrangThai: 'Đã tạo phiếu chi và cập nhật tồn kho',
        ThongTinCapNhatTonKho: chiTietDonHang.map(ctddh => ({
          MaCTSP: ctddh.MaCTSP,
          SoLuongTra: ctddh.SoLuongTra,
          SoLuongTonCu: ctddh.ChiTietSanPham?.SoLuongTon,
          SoLuongTonMoi: (ctddh.ChiTietSanPham?.SoLuongTon || 0) + ctddh.SoLuongTra
        }))
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Lấy chi tiết phiếu chi theo mã phiếu trả hàng
  getPaymentSlipByReturnSlip: async (maPhieuTra) => {
    try {
      const phieuChi = await PhieuChi.findOne({
        where: { MaPhieuTra: maPhieuTra },
        include: [
          {
            model: PhieuTraHang,
            attributes: ['MaPhieuTra', 'NgayTra', 'LyDo', 'TrangThai'],
            include: [
              {
                model: HoaDon,
                attributes: ['SoHD', 'MaDDH', 'NgayLap']
              }
            ]
          },
          {
            model: NhanVien,
            attributes: ['MaNV', 'TenNV', 'SDT', 'Email'],
            required: false
          }
        ]
      });

      if (!phieuChi) {
        throw new Error('Không tìm thấy phiếu chi cho phiếu trả hàng này');
      }

      return phieuChi;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách phiếu chi
  getPaymentSlips: async (page = 1, limit = 10, fromDate = null, toDate = null) => {
    try {
      const offset = (page - 1) * limit;
      const whereCondition = {};

      // Filter theo ngày nếu có
      if (fromDate || toDate) {
        whereCondition.NgayChi = {};
        if (fromDate) {
          whereCondition.NgayChi[Op.gte] = fromDate;
        }
        if (toDate) {
          whereCondition.NgayChi[Op.lte] = toDate;
        }
      }

      const { count, rows } = await PhieuChi.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: PhieuTraHang,
            attributes: ['MaPhieuTra', 'NgayTra', 'LyDo', 'TrangThai'],
            include: [
              {
                model: HoaDon,
                attributes: ['SoHD', 'MaDDH', 'NgayLap'],
                include: [
                  {
                    model: DonDatHang,
                    attributes: ['MaDDH', 'NgayTao'],
                    include: [
                      {
                        model: KhachHang,
                        attributes: ['MaKH', 'TenKH', 'SDT']
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            model: NhanVien,
            attributes: ['MaNV', 'TenNV', 'SDT', 'Email'],
            required: false
          }
        ],
        order: [['NgayChi', 'DESC']],
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

  // Lấy danh sách phiếu trả hàng có trạng thái 1 (Chờ duyệt)
  getReturnRequests: async (page = 1, limit = 10, status = null) => {
    try {
      const offset = (page - 1) * limit;
      const whereCondition = {};

      // Nếu có trạng thái thì filter theo trạng thái, ngược lại lấy trạng thái 1 (Chờ duyệt)
      if (status) {
        whereCondition.TrangThai = status;
      } else {
        whereCondition.TrangThai = 1; // Mặc định lấy phiếu trả hàng chờ duyệt
      }

      const { count, rows } = await PhieuTraHang.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: HoaDon,
            attributes: ['SoHD', 'MaDDH', 'NgayLap'],
            include: [
              {
                model: DonDatHang,
                attributes: ['MaDDH', 'NgayTao', 'DiaChiGiao', 'NguoiNhan', 'SDT'],
                include: [
                  {
                    model: KhachHang,
                    attributes: ['MaKH', 'TenKH', 'SDT']
                  },
                  {
                    model: CT_DonDatHang,
                    attributes: ['MaCTDDH', 'SoLuong', 'DonGia', 'SoLuongTra'],
                    where: {
                      MaPhieuTra: {
                        [Op.ne]: null // Chỉ lấy chi tiết có liên quan đến phiếu trả
                      }
                    },
                    required: false,
                    include: [
                      {
                        model: ChiTietSanPham,
                        attributes: ['MaCTSP'],
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
              }
            ]
          },
          {
            model: NhanVien,
            attributes: ['MaNV', 'TenNV'],
            required: false
          },
          {
            model: PhieuChi,
            attributes: ['MaPhieuChi', 'NgayChi', 'SoTien', 'MaNVLap'],
            required: false,
            include: [
              {
                model: NhanVien,
                attributes: ['MaNV', 'TenNV'],
                required: false
              }
            ]
          }
        ],
        order: [['NgayTra', 'DESC']],
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
  },

  // Nhân viên duyệt phiếu trả hàng
  approveReturnSlip: async (maPhieuTra, maNV, trangThaiPhieu) => {
    const transaction = await sequelize.transaction();

    try {
      // Validate trạng thái phiếu (2: Đã duyệt, 3: Từ chối)
      if (![2, 3].includes(trangThaiPhieu)) {
        throw new Error('Trạng thái duyệt không hợp lệ. Chỉ chấp nhận 2 (Đã duyệt) hoặc 3 (Từ chối)');
      }

      // Kiểm tra phiếu trả hàng tồn tại và đang ở trạng thái chờ duyệt
      const phieuTraHang = await PhieuTraHang.findOne({
        where: {
          MaPhieuTra: maPhieuTra,
          TrangThai: 1 // Chỉ cho phép duyệt phiếu đang chờ duyệt
        },
        include: [
          {
            model: HoaDon,
            attributes: ['SoHD', 'MaDDH']
          }
        ],
        transaction
      });

      if (!phieuTraHang) {
        throw new Error('Không tìm thấy phiếu trả hàng hoặc phiếu đã được duyệt/từ chối trước đó');
      }

      if (trangThaiPhieu === 2) {
        // Trạng thái 2: Đã duyệt - cập nhật phiếu trả hàng
        await phieuTraHang.update({
          TrangThai: trangThaiPhieu,
          NVLap: maNV // Cập nhật nhân viên duyệt
        }, { transaction });

      } else if (trangThaiPhieu === 3) {
        // Trạng thái 3: Từ chối - cập nhật phiếu chi (nếu có), đơn hàng và CT đơn đặt hàng
        
        // 1. Kiểm tra và cập nhật phiếu chi (nếu có) về trạng thái 3
        const phieuChi = await PhieuChi.findOne({
          where: { MaPhieuTra: maPhieuTra },
          transaction
        });

        if (phieuChi) {
          // Cập nhật trạng thái phiếu chi thành 3 (từ chối)
          await phieuChi.update({
            TrangThai: 3
          }, { transaction });
        }

        // 2. Cập nhật phiếu trả hàng
        await phieuTraHang.update({
          TrangThai: trangThaiPhieu,
          NVLap: maNV
        }, { transaction });

        // 3. Cập nhật trạng thái đơn hàng về hoàn tất (trạng thái 4)
        await DonDatHang.update({
          MaTTDH: 4
        }, {
          where: { MaDDH: phieuTraHang.HoaDon.MaDDH },
          transaction
        });
      }

      await transaction.commit();

      return {
        MaPhieuTra: phieuTraHang.MaPhieuTra,
        SoHD: phieuTraHang.SoHD,
        TrangThai: trangThaiPhieu,
        TrangThaiText: trangThaiPhieu === 2 ? 'Đã duyệt' : 'Từ chối',
        NgayDuyet: new Date(),
        NhanVienDuyet: maNV,
        ThongBao: trangThaiPhieu === 3 ? 'Đã từ chối phiếu trả và khôi phục trạng thái đơn hàng' : 'Đã duyệt phiếu trả hàng'
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Lấy danh sách phiếu trả hàng
  getReturnSlips: async (page = 1, limit = 10, trangThai = null) => {
    try {
      const offset = (page - 1) * limit;
      const whereCondition = {};

      if (trangThai) {
        whereCondition.TrangThai = trangThai;
      }

      const { count, rows } = await PhieuTraHang.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: HoaDon,
            attributes: ['SoHD', 'MaDDH', 'NgayLap'],
            include: [
              {
                model: DonDatHang,
                attributes: ['MaDDH', 'NgayTao'],
                include: [
                  {
                    model: KhachHang,
                    attributes: ['MaKH', 'TenKH', 'SDT']
                  }
                ]
              }
            ]
          },
          {
            model: NhanVien,
            attributes: ['MaNV', 'TenNV'],
            required: false
          }
        ],
        order: [['NgayTra', 'DESC']],
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
  }
};

module.exports = TraHangService;
