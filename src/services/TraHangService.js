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
          }
        ],
        transaction
      });

      if (!donHang) {
        throw new Error('Không tìm thấy đơn hàng hoặc đơn hàng chưa được yêu cầu trả hàng');
      }

      if (!donHang.HoaDon) {
        throw new Error('Đơn hàng chưa có hóa đơn');
      }

      // Kiểm tra xem đã có phiếu trả hàng cho hóa đơn này chưa
      const existingReturn = await PhieuTraHang.findOne({
        where: { SoHD: donHang.HoaDon.SoHD },
        transaction
      });

      if (existingReturn) {
        throw new Error('Đã có phiếu trả hàng cho hóa đơn này');
      }

      // Tạo phiếu trả hàng
      const phieuTraHang = await PhieuTraHang.create({
        SoHD: donHang.HoaDon.SoHD,
        NVLap: maNV,
        NgayTra: new Date(),
        LyDo: lyDo
      }, { transaction });

      // Xử lý từng sản phẩm trả hàng
      let tongTienTra = 0;
      const chiTietTraHang = [];

      for (const item of danhSachSanPham) {
        const { maCTDDH, soLuongTra } = item;

        // Kiểm tra chi tiết đơn hàng
        const chiTietDonHang = await CT_DonDatHang.findOne({
          where: {
            MaCTDDH: maCTDDH,
            MaDDH: maDDH
          },
          transaction
        });

        if (!chiTietDonHang) {
          throw new Error(`Không tìm thấy chi tiết đơn hàng ${maCTDDH}`);
        }

        if (soLuongTra > chiTietDonHang.SoLuong) {
          throw new Error(`Số lượng trả không được vượt quá số lượng đã mua`);
        }

        // Cập nhật số lượng trả trong chi tiết đơn hàng
        await chiTietDonHang.update({
          SoLuongTra: (chiTietDonHang.SoLuongTra || 0) + soLuongTra
        }, { transaction });

        // Cập nhật lại tồn kho
        const chiTietSanPham = await ChiTietSanPham.findByPk(chiTietDonHang.MaCTSP, { transaction });
        if (chiTietSanPham) {
          await chiTietSanPham.update({
            SoLuongTon: chiTietSanPham.SoLuongTon + soLuongTra
          }, { transaction });
        }

        const thanhTienTra = parseFloat(chiTietDonHang.DonGia) * soLuongTra;
        tongTienTra += thanhTienTra;

        chiTietTraHang.push({
          MaCTDDH: maCTDDH,
          SoLuongTra: soLuongTra,
          DonGia: chiTietDonHang.DonGia,
          ThanhTien: thanhTienTra
        });
      }

      await transaction.commit();

      // Trả về thông tin phiếu trả hàng
      return {
        MaPhieuTra: phieuTraHang.MaPhieuTra,
        SoHD: phieuTraHang.SoHD,
        NgayTra: phieuTraHang.NgayTra,
        LyDo: phieuTraHang.LyDo,
        NVLap: phieuTraHang.NVLap,
        TongTienTra: tongTienTra,
        ChiTietTraHang: chiTietTraHang
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Lấy chi tiết phiếu trả hàng
  getReturnSlipDetail: async (maPhieuTra) => {
    const phieuTraHang = await PhieuTraHang.findByPk(maPhieuTra, {
      include: [
        {
          model: NhanVien,
          attributes: ['MaNV', 'TenNV']
        },
        {
          model: HoaDon,
          include: [
            {
              model: DonDatHang,
              include: [
                {
                  model: KhachHang,
                  attributes: ['MaKH', 'TenKH', 'SDT', 'DiaChi']
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
                              attributes: ['TenFile', 'DuongDan'],
                              where: { AnhChinh: true },
                              required: false
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
            }
          ]
        }
      ]
    });

    if (!phieuTraHang) return null;

    const phieuData = phieuTraHang.toJSON();

    // Tính tổng tiền trả
    let tongTienTra = 0;
    const danhSachSanPhamTra = [];

    if (phieuData.HoaDon?.DonDatHang?.CT_DonDatHangs) {
      phieuData.HoaDon.DonDatHang.CT_DonDatHangs.forEach(item => {
        if (item.SoLuongTra && item.SoLuongTra > 0) {
          const thanhTienTra = parseFloat(item.DonGia) * item.SoLuongTra;
          tongTienTra += thanhTienTra;

          danhSachSanPhamTra.push({
            MaCTDDH: item.MaCTDDH,
            TenSP: item.ChiTietSanPham?.SanPham?.TenSP || '',
            KichThuoc: item.ChiTietSanPham?.KichThuoc?.TenKichThuoc || '',
            MauSac: item.ChiTietSanPham?.Mau?.TenMau || '',
            SoLuongMua: item.SoLuong,
            SoLuongTra: item.SoLuongTra,
            DonGia: parseFloat(item.DonGia),
            ThanhTienTra: thanhTienTra,
            HinhAnh: item.ChiTietSanPham?.SanPham?.AnhSanPhams?.[0]?.DuongDan || null
          });
        }
      });
    }

    return {
      MaPhieuTra: phieuData.MaPhieuTra,
      SoHD: phieuData.SoHD,
      NgayTra: phieuData.NgayTra,
      LyDo: phieuData.LyDo,
      NhanVien: phieuData.NhanVien,
      KhachHang: phieuData.HoaDon?.DonDatHang?.KhachHang,
      TongTienTra: tongTienTra,
      DanhSachSanPhamTra: danhSachSanPhamTra
    };
  },

  // Lấy danh sách phiếu trả hàng
  getReturnSlips: async (page = 1, limit = 10, fromDate = null, toDate = null) => {
    const offset = (page - 1) * limit;

    const whereCondition = {};
    if (fromDate && toDate) {
      whereCondition.NgayTra = {
        [Op.between]: [fromDate, toDate]
      };
    }

    const { count, rows } = await PhieuTraHang.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: NhanVien,
          attributes: ['MaNV', 'TenNV']
        },
        {
          model: HoaDon,
          include: [
            {
              model: DonDatHang,
              include: [
                {
                  model: KhachHang,
                  attributes: ['TenKH', 'SDT']
                }
              ]
            }
          ]
        }
      ],
      order: [['NgayTra', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });

    // Tính tổng tiền trả cho mỗi phiếu
    const returnSlipsWithTotal = await Promise.all(
      rows.map(async (phieu) => {
        const phieuData = phieu.toJSON();
        let tongTienTra = 0;

        if (phieuData.HoaDon?.DonDatHang?.CT_DonDatHangs) {
          tongTienTra = phieuData.HoaDon.DonDatHang.CT_DonDatHangs.reduce((sum, item) => {
            if (item.SoLuongTra && item.SoLuongTra > 0) {
              return sum + (parseFloat(item.DonGia) * item.SoLuongTra);
            }
            return sum;
          }, 0);
        }

        return {
          ...phieuData,
          TongTienTra: tongTienTra
        };
      })
    );

    return {
      returnSlips: returnSlipsWithTotal,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    };
  },

  // Lấy lịch sử trả hàng của khách hàng
  getCustomerReturnHistory: async (maKH, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    const { count, rows } = await DonDatHang.findAndCountAll({
      where: {
        MaKH: maKH,
        MaTTDH: 7 // Trạng thái trả hàng
      },
      include: [
        {
          model: TrangThaiDH,
          attributes: ['TrangThai']
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
      order: [['NgayYeuCauTraHang', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });

    return {
      orders: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    };
  },

  // Helper method để lấy chi tiết đơn hàng
  getOrderDetail: async (maDDH) => {
    return await DonDatHang.findByPk(maDDH, {
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
    });
  },

  // Tạo phiếu chi cho phiếu trả hàng
  createPaymentSlip: async (maPhieuTra, soTien) => {
    const transaction = await sequelize.transaction();

    try {
      // Kiểm tra phiếu trả hàng tồn tại
      const phieuTraHang = await PhieuTraHang.findByPk(maPhieuTra, {
        include: [
          {
            model: HoaDon,
            include: [
              {
                model: DonDatHang,
                include: [
                  {
                    model: KhachHang,
                    attributes: ['MaKH', 'TenKH', 'SDT']
                  }
                ]
              }
            ]
          }
        ],
        transaction
      });

      if (!phieuTraHang) {
        throw new Error('Không tìm thấy phiếu trả hàng');
      }

      // Kiểm tra xem đã có phiếu chi cho phiếu trả hàng này chưa
      const existingPayment = await PhieuChi.findOne({
        where: { MaPhieuTra: maPhieuTra },
        transaction
      });

      if (existingPayment) {
        throw new Error('Đã có phiếu chi cho phiếu trả hàng này');
      }

      // Validate số tiền
      if (!soTien || soTien <= 0) {
        throw new Error('Số tiền phải lớn hơn 0');
      }

      // Tạo phiếu chi trong database
      const phieuChi = await PhieuChi.create({
        NgayChi: new Date(),
        SoTien: parseFloat(soTien),
        MaPhieuTra: maPhieuTra
      }, { transaction });

      await transaction.commit();

      return {
        MaPhieuChi: phieuChi.MaPhieuChi,
        NgayChi: phieuChi.NgayChi,
        SoTien: parseFloat(phieuChi.SoTien),
        MaPhieuTra: phieuChi.MaPhieuTra,
        PhieuTraHang: {
          MaPhieuTra: phieuTraHang.MaPhieuTra,
          SoHD: phieuTraHang.SoHD,
          NgayTra: phieuTraHang.NgayTra,
          LyDo: phieuTraHang.LyDo
        },
        KhachHang: phieuTraHang.HoaDon?.DonDatHang?.KhachHang || null
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Lấy chi tiết phiếu chi theo mã phiếu trả hàng
  getPaymentSlipByReturnSlip: async (maPhieuTra) => {
    const phieuChi = await PhieuChi.findOne({
      where: { MaPhieuTra: maPhieuTra },
      include: [
        {
          model: PhieuTraHang,
          include: [
            {
              model: HoaDon,
              include: [
                {
                  model: DonDatHang,
                  include: [
                    {
                      model: KhachHang,
                      attributes: ['MaKH', 'TenKH', 'SDT', 'DiaChi']
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });

    return phieuChi;
  },

  // Lấy danh sách phiếu chi
  getPaymentSlips: async (page = 1, limit = 10, fromDate = null, toDate = null) => {
    const offset = (page - 1) * limit;

    const whereCondition = {};
    if (fromDate && toDate) {
      whereCondition.NgayChi = {
        [Op.between]: [fromDate, toDate]
      };
    }

    const { count, rows } = await PhieuChi.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: PhieuTraHang,
          include: [
            {
              model: HoaDon,
              include: [
                {
                  model: DonDatHang,
                  include: [
                    {
                      model: KhachHang,
                      attributes: ['TenKH', 'SDT']
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      order: [['NgayChi', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });

    return {
      paymentSlips: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    };
  },

  // Lấy danh sách đơn hàng yêu cầu trả hàng (cho nhân viên)
  getReturnRequests: async (page = 1, limit = 10, status = null) => {
    const offset = (page - 1) * limit;

    const whereCondition = {
      MaTTDH: 7 // Trạng thái yêu cầu trả hàng
    };

    // Nếu có filter theo status khác
    if (status && status !== 'all') {
      if (status === 'pending') {
        whereCondition.MaTTDH = 7; // Chờ xử lý
      } else if (status === 'processed') {
        // Có thể thêm logic cho trạng thái đã xử lý
      }
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
                      attributes: ['TenFile', 'DuongDan'],
                      where: { AnhChinh: true },
                      required: false
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
        },
        {
          model: HoaDon,
          attributes: ['SoHD'],
          required: false
        }
      ],
      order: [['NgayTao', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });

    // Tính tổng tiền cho mỗi đơn hàng yêu cầu trả
    const ordersWithTotal = rows.map(order => {
      const orderData = order.toJSON();
      let tongTien = 0;

      if (orderData.CT_DonDatHangs) {
        tongTien = orderData.CT_DonDatHangs.reduce((sum, item) => {
          return sum + (parseFloat(item.DonGia) * item.SoLuong);
        }, 0);
      }

      return {
        ...orderData,
        TongTien: tongTien
      };
    });

    return {
      returnRequests: ordersWithTotal,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < Math.ceil(count / limit),
        hasPrevPage: page > 1
      }
    };
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
          }
        ],
        transaction
      });

      if (!donHang) {
        throw new Error('Không tìm thấy đơn hàng hoặc đơn hàng chưa được yêu cầu trả hàng');
      }

      if (!donHang.HoaDon) {
        throw new Error('Đơn hàng chưa có hóa đơn');
      }

      // Kiểm tra xem đã có phiếu trả hàng cho hóa đơn này chưa
      const existingReturn = await PhieuTraHang.findOne({
        where: { SoHD: donHang.HoaDon.SoHD },
        transaction
      });

      if (existingReturn) {
        throw new Error('Đã có phiếu trả hàng cho hóa đơn này');
      }

      // Tạo phiếu trả hàng
      const phieuTraHang = await PhieuTraHang.create({
        SoHD: donHang.HoaDon.SoHD,
        NVLap: maNV,
        NgayTra: new Date(),
        LyDo: lyDo
      }, { transaction });

      // Xử lý từng sản phẩm trả hàng
      let tongTienTra = 0;
      const chiTietTraHang = [];

      for (const item of danhSachSanPham) {
        const { maCTDDH, soLuongTra } = item;

        // Kiểm tra chi tiết đơn hàng
        const chiTietDonHang = await CT_DonDatHang.findOne({
          where: {
            MaCTDDH: maCTDDH,
            MaDDH: maDDH
          },
          transaction
        });

        if (!chiTietDonHang) {
          throw new Error(`Không tìm thấy chi tiết đơn hàng ${maCTDDH}`);
        }

        if (soLuongTra > chiTietDonHang.SoLuong) {
          throw new Error(`Số lượng trả không được vượt quá số lượng đã mua`);
        }

        // Cập nhật số lượng trả trong chi tiết đơn hàng
        await chiTietDonHang.update({
          SoLuongTra: (chiTietDonHang.SoLuongTra || 0) + soLuongTra
        }, { transaction });

        // Cập nhật lại tồn kho
        const chiTietSanPham = await ChiTietSanPham.findByPk(chiTietDonHang.MaCTSP, { transaction });
        if (chiTietSanPham) {
          await chiTietSanPham.update({
            SoLuongTon: chiTietSanPham.SoLuongTon + soLuongTra
          }, { transaction });
        }

        const thanhTienTra = parseFloat(chiTietDonHang.DonGia) * soLuongTra;
        tongTienTra += thanhTienTra;

        chiTietTraHang.push({
          MaCTDDH: maCTDDH,
          SoLuongTra: soLuongTra,
          DonGia: chiTietDonHang.DonGia,
          ThanhTien: thanhTienTra
        });
      }

      await transaction.commit();

      // Trả về thông tin phiếu trả hàng
      return {
        MaPhieuTra: phieuTraHang.MaPhieuTra,
        SoHD: phieuTraHang.SoHD,
        NgayTra: phieuTraHang.NgayTra,
        LyDo: phieuTraHang.LyDo,
        NVLap: phieuTraHang.NVLap,
        TongTienTra: tongTienTra,
        ChiTietTraHang: chiTietTraHang
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Lấy chi tiết phiếu trả hàng
  getReturnSlipDetail: async (maPhieuTra) => {
    const phieuTraHang = await PhieuTraHang.findByPk(maPhieuTra, {
      include: [
        {
          model: NhanVien,
          attributes: ['MaNV', 'TenNV']
        },
        {
          model: HoaDon,
          include: [
            {
              model: DonDatHang,
              include: [
                {
                  model: KhachHang,
                  attributes: ['MaKH', 'TenKH', 'SDT', 'DiaChi']
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
                              attributes: ['TenFile', 'DuongDan'],
                              where: { AnhChinh: true },
                              required: false
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
            }
          ]
        }
      ]
    });

    if (!phieuTraHang) return null;

    const phieuData = phieuTraHang.toJSON();

    // Tính tổng tiền trả
    let tongTienTra = 0;
    const danhSachSanPhamTra = [];

    if (phieuData.HoaDon?.DonDatHang?.CT_DonDatHangs) {
      phieuData.HoaDon.DonDatHang.CT_DonDatHangs.forEach(item => {
        if (item.SoLuongTra && item.SoLuongTra > 0) {
          const thanhTienTra = parseFloat(item.DonGia) * item.SoLuongTra;
          tongTienTra += thanhTienTra;

          danhSachSanPhamTra.push({
            MaCTDDH: item.MaCTDDH,
            TenSP: item.ChiTietSanPham?.SanPham?.TenSP || '',
            KichThuoc: item.ChiTietSanPham?.KichThuoc?.TenKichThuoc || '',
            MauSac: item.ChiTietSanPham?.Mau?.TenMau || '',
            SoLuongMua: item.SoLuong,
            SoLuongTra: item.SoLuongTra,
            DonGia: parseFloat(item.DonGia),
            ThanhTienTra: thanhTienTra,
            HinhAnh: item.ChiTietSanPham?.SanPham?.AnhSanPhams?.[0]?.DuongDan || null
          });
        }
      });
    }

    return {
      MaPhieuTra: phieuData.MaPhieuTra,
      SoHD: phieuData.SoHD,
      NgayTra: phieuData.NgayTra,
      LyDo: phieuData.LyDo,
      NhanVien: phieuData.NhanVien,
      KhachHang: phieuData.HoaDon?.DonDatHang?.KhachHang,
      TongTienTra: tongTienTra,
      DanhSachSanPhamTra: danhSachSanPhamTra
    };
  },

  // Lấy danh sách phiếu trả hàng
  getReturnSlips: async (page = 1, limit = 10, fromDate = null, toDate = null) => {
    const offset = (page - 1) * limit;

    const whereCondition = {};
    if (fromDate && toDate) {
      whereCondition.NgayTra = {
        [Op.between]: [fromDate, toDate]
      };
    }

    const { count, rows } = await PhieuTraHang.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: NhanVien,
          attributes: ['MaNV', 'TenNV']
        },
        {
          model: HoaDon,
          include: [
            {
              model: DonDatHang,
              include: [
                {
                  model: KhachHang,
                  attributes: ['TenKH', 'SDT']
                }
              ]
            }
          ]
        }
      ],
      order: [['NgayTra', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });

    // Tính tổng tiền trả cho mỗi phiếu
    const returnSlipsWithTotal = await Promise.all(
      rows.map(async (phieu) => {
        const phieuData = phieu.toJSON();
        let tongTienTra = 0;

        if (phieuData.HoaDon?.DonDatHang?.CT_DonDatHangs) {
          tongTienTra = phieuData.HoaDon.DonDatHang.CT_DonDatHangs.reduce((sum, item) => {
            if (item.SoLuongTra && item.SoLuongTra > 0) {
              return sum + (parseFloat(item.DonGia) * item.SoLuongTra);
            }
            return sum;
          }, 0);
        }

        return {
          ...phieuData,
          TongTienTra: tongTienTra
        };
      })
    );

    return {
      returnSlips: returnSlipsWithTotal,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    };
  },

  // Lấy lịch sử trả hàng của khách hàng
  getCustomerReturnHistory: async (maKH, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    const { count, rows } = await DonDatHang.findAndCountAll({
      where: {
        MaKH: maKH,
        MaTTDH: 7 // Trạng thái trả hàng
      },
      include: [
        {
          model: TrangThaiDH,
          attributes: ['TrangThai']
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
      order: [['NgayYeuCauTraHang', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });

    return {
      orders: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    };
  },

  // Helper method để lấy chi tiết đơn hàng
  getOrderDetail: async (maDDH) => {
    return await DonDatHang.findByPk(maDDH, {
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
    });
  },

  // Tạo phiếu chi cho phiếu trả hàng
  createPaymentSlip: async (maPhieuTra, soTien) => {
    const transaction = await sequelize.transaction();

    try {
      // Kiểm tra phiếu trả hàng tồn tại
      const phieuTraHang = await PhieuTraHang.findByPk(maPhieuTra, {
        include: [
          {
            model: HoaDon,
            include: [
              {
                model: DonDatHang,
                include: [
                  {
                    model: KhachHang,
                    attributes: ['MaKH', 'TenKH', 'SDT']
                  }
                ]
              }
            ]
          }
        ],
        transaction
      });

      if (!phieuTraHang) {
        throw new Error('Không tìm thấy phiếu trả hàng');
      }

      // Kiểm tra xem đã có phiếu chi cho phiếu trả hàng này chưa
      const existingPayment = await PhieuChi.findOne({
        where: { MaPhieuTra: maPhieuTra },
        transaction
      });

      if (existingPayment) {
        throw new Error('Đã có phiếu chi cho phiếu trả hàng này');
      }

      // Validate số tiền
      if (!soTien || soTien <= 0) {
        throw new Error('Số tiền phải lớn hơn 0');
      }

      // Tạo phiếu chi trong database
      const phieuChi = await PhieuChi.create({
        NgayChi: new Date(),
        SoTien: parseFloat(soTien),
        MaPhieuTra: maPhieuTra
      }, { transaction });

      await transaction.commit();

      return {
        MaPhieuChi: phieuChi.MaPhieuChi,
        NgayChi: phieuChi.NgayChi,
        SoTien: parseFloat(phieuChi.SoTien),
        MaPhieuTra: phieuChi.MaPhieuTra,
        PhieuTraHang: {
          MaPhieuTra: phieuTraHang.MaPhieuTra,
          SoHD: phieuTraHang.SoHD,
          NgayTra: phieuTraHang.NgayTra,
          LyDo: phieuTraHang.LyDo
        },
        KhachHang: phieuTraHang.HoaDon?.DonDatHang?.KhachHang || null
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Lấy chi tiết phiếu chi theo mã phiếu trả hàng
  getPaymentSlipByReturnSlip: async (maPhieuTra) => {
    const phieuChi = await PhieuChi.findOne({
      where: { MaPhieuTra: maPhieuTra },
      include: [
        {
          model: PhieuTraHang,
          include: [
            {
              model: HoaDon,
              include: [
                {
                  model: DonDatHang,
                  include: [
                    {
                      model: KhachHang,
                      attributes: ['MaKH', 'TenKH', 'SDT', 'DiaChi']
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });

    return phieuChi;
  },

  // Lấy danh sách phiếu chi
  getPaymentSlips: async (page = 1, limit = 10, fromDate = null, toDate = null) => {
    const offset = (page - 1) * limit;

    const whereCondition = {};
    if (fromDate && toDate) {
      whereCondition.NgayChi = {
        [Op.between]: [fromDate, toDate]
      };
    }

    const { count, rows } = await PhieuChi.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: PhieuTraHang,
          include: [
            {
              model: HoaDon,
              include: [
                {
                  model: DonDatHang,
                  include: [
                    {
                      model: KhachHang,
                      attributes: ['TenKH', 'SDT']
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      order: [['NgayChi', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });

    return {
      paymentSlips: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    };
  },
};

module.exports = TraHangService;
