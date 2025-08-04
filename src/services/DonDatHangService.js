const {
  DonDatHang,
  CT_DonDatHang,
  KhachHang,
  NhanVien,
  TrangThaiDH,
  ChiTietSanPham,
  SanPham,
  AnhSanPham,
  KichThuoc,
  Mau,
  HoaDon,
  NhanVien_BoPhan,
  LoaiSP,
} = require("../models");
const sequelize = require("../models/sequelize");
const { Op } = require("sequelize");

const DonDatHangService = {
  // Lấy danh sách đơn hàng theo trạng thái
  getByStatus: async (status, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    const whereCondition = {};
    // Chỉ thêm điều kiện MaTTDH nếu không phải 'all' và có giá trị
    if (status && status !== "all") {
      whereCondition.MaTTDH = status;
    }

    const { count, rows } = await DonDatHang.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: KhachHang,
          attributes: ["MaKH", "TenKH", "SDT", "DiaChi", "CCCD"],
        },
        {
          model: NhanVien,
          as: "NguoiDuyet",
          attributes: ["MaNV", "TenNV"],
          required: false,
        },
        {
          model: NhanVien,
          as: "NguoiGiao",
          attributes: ["MaNV", "TenNV"],
          required: false,
        },
        {
          model: TrangThaiDH,
          attributes: ["MaTTDH", "TrangThai"],
        },
        {
          model: CT_DonDatHang,
          include: [
            {
              model: ChiTietSanPham,
              include: [
                {
                  model: SanPham,
                  attributes: ["MaSP", "TenSP"],
                },
                {
                  model: KichThuoc,
                  attributes: ["MaKichThuoc", "TenKichThuoc"],
                },
                {
                  model: Mau,
                  attributes: ["MaMau", "TenMau", "MaHex"],
                },
              ],
            },
          ],
        },
        {
          model: HoaDon,
          attributes: ["SoHD", "NgayLap"],
          required: false,
        },
      ],
      order: [["NgayTao", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
      distinct: true,
    });

    // Tính tổng tiền cho mỗi đơn hàng
    const ordersWithTotal = rows.map((order) => {
      const orderData = order.toJSON();
      let tongTien = 0;

      if (orderData.CT_DonDatHangs && orderData.CT_DonDatHangs.length > 0) {
        tongTien = orderData.CT_DonDatHangs.reduce((sum, item) => {
          const donGia = parseFloat(item.DonGia) || 0;
          const soLuong = parseInt(item.SoLuong) || 0;
          return sum + donGia * soLuong;
        }, 0);
      }

      return {
        ...orderData,
        TongTien: Math.round(tongTien * 100) / 100, // Làm tròn 2 chữ số thập phân
      };
    });

    return {
      orders: ordersWithTotal,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < Math.ceil(count / limit),
        hasPrevPage: page > 1,
      },
    };
  },

  // Lấy chi tiết đơn hàng theo ID (với thông tin đầy đủ)
  getById: async (maDDH) => {
    const order = await DonDatHang.findByPk(maDDH, {
      include: [
        {
          model: KhachHang,
          attributes: ["MaKH", "TenKH", "SDT", "DiaChi", "CCCD"],
        },
        {
          model: NhanVien,
          as: "NguoiDuyet",
          attributes: ["MaNV", "TenNV"],
          required: false,
        },
        {
          model: NhanVien,
          as: "NguoiGiao",
          attributes: ["MaNV", "TenNV"],
          required: false,
        },
        {
          model: TrangThaiDH,
          attributes: ["MaTTDH", "TrangThai"],
        },
        {
          model: CT_DonDatHang,
          include: [
            {
              model: ChiTietSanPham,
              include: [
                {
                  model: SanPham,
                  attributes: ["MaSP", "TenSP", "MoTa"],
                  include: [
                    {
                      model: AnhSanPham,
                      attributes: [
                        "MaAnh",
                        "TenFile",
                        "DuongDan",
                        "AnhChinh",
                        "ThuTu",
                      ],
                      where: { AnhChinh: true },
                      required: false,
                    },
                  ],
                },
                {
                  model: KichThuoc,
                  attributes: ["MaKichThuoc", "TenKichThuoc"],
                },
                {
                  model: Mau,
                  attributes: ["MaMau", "TenMau", "MaHex"],
                },
              ],
            },
          ],
        },
        {
          model: HoaDon,
          attributes: ["SoHD", "NgayLap"],
          required: false,
        },
      ],
    });

    if (!order) return null;

    const orderData = order.toJSON();

    // Tính tổng tiền và xử lý dữ liệu chi tiết
    let tongTien = 0;
    let tongSoLuong = 0;

    if (orderData.CT_DonDatHangs && orderData.CT_DonDatHangs.length > 0) {
      orderData.CT_DonDatHangs = orderData.CT_DonDatHangs.map((item) => {
        const donGia = parseFloat(item.DonGia) || 0;
        const soLuong = item.SoLuong || 0;
        const thanhTien = donGia * soLuong;

        tongTien += thanhTien;
        tongSoLuong += soLuong;

        return {
          ...item,
          DonGia: donGia,
          ThanhTien: thanhTien,
          TenSanPham: item.ChiTietSanPham?.SanPham?.TenSP || "",
          KichThuoc: item.ChiTietSanPham?.KichThuoc?.TenKichThuoc || "",
          MauSac: item.ChiTietSanPham?.Mau?.TenMau || "",
          MaHexMau: item.ChiTietSanPham?.Mau?.MaHex || "",
          HinhAnh: item.ChiTietSanPham?.SanPham?.AnhSanPhams?.[0]
            ? {
                MaAnh: item.ChiTietSanPham.SanPham.AnhSanPhams[0].MaAnh,
                TenFile: item.ChiTietSanPham.SanPham.AnhSanPhams[0].TenFile,
                DuongDan: item.ChiTietSanPham.SanPham.AnhSanPhams[0].DuongDan,
              }
            : null,
        };
      });
    }

    return {
      ...orderData,
      TongTien: tongTien,
      TongSoLuong: tongSoLuong,
      // Thông tin giao hàng
      ThongTinGiaoHang: {
        NguoiNhan: orderData.NguoiNhan,
        SDT: orderData.SDT,
        DiaChi: orderData.DiaChiGiao,
        ThoiGianGiao: orderData.ThoiGianGiao,
      },
      // Thông tin khách hàng
      ThongTinKhachHang: {
        TenKH: orderData.KhachHang?.TenKH || "",
        SDT: orderData.KhachHang?.SDT || "",
        DiaChi: orderData.KhachHang?.DiaChi || "",
        CCCD: orderData.KhachHang?.CCCD || "",
      },
      // Thông tin xử lý đơn hàng
      ThongTinXuLy: {
        NguoiDuyet: orderData.NguoiDuyet?.TenNV || "",
        NguoiGiao: orderData.NguoiGiao?.TenNV || "",
        TrangThai: orderData.TrangThaiDH?.TrangThai || "",
      },
    };
  },

  // Lấy tất cả đơn hàng
  getAll: async (page = 1, limit = 10) => {
    return await this.getByStatus("all", page, limit);
  },

  // Cập nhật trạng thái đơn hàng
  updateStatus: async (maDDH, maTTDH, maNVDuyet = null, maNVGiao = null) => {
    const order = await DonDatHang.findByPk(maDDH);
    if (!order) return null;

    const updateData = { MaTTDH: maTTDH };
    if (maNVDuyet) updateData.MaNV_Duyet = maNVDuyet;
    if (maNVGiao) updateData.MaNV_Giao = maNVGiao;

    await order.update(updateData);
    return await DonDatHangService.getById(maDDH);
  },

  // Cập nhật trạng thái nhiều đơn hàng cùng lúc
  updateBatchStatus: async (orders) => {
    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    const transaction = await sequelize.transaction();

    try {
      for (const orderUpdate of orders) {
        try {
          const { id, maTTDH, maNVDuyet, maNVGiao } = orderUpdate;

          const order = await DonDatHang.findByPk(id, { transaction });
          if (!order) {
            results.failed++;
            results.errors.push(`Không tìm thấy đơn hàng với ID: ${id}`);
            continue;
          }

          const updateData = { MaTTDH: maTTDH };
          if (maNVDuyet) updateData.MaNV_Duyet = maNVDuyet;
          if (maNVGiao) updateData.MaNV_Giao = maNVGiao;

          await order.update(updateData, { transaction });
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(
            `Lỗi cập nhật đơn hàng ID ${orderUpdate.id}: ${error.message}`
          );
        }
      }

      await transaction.commit();
      return results;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Lấy thống kê số lượng đơn hàng theo trạng thái
  getOrderStatistics: async () => {
    try {
      // Sử dụng SQL thô để tối ưu hiệu suất
      const { QueryTypes } = require("sequelize");
      const sequelize = require("../models/sequelize");

      // Đếm đơn hàng theo từng trạng thái và tổng đơn hàng
      const statistics = await sequelize.query(
        `
        SELECT 
          MaTTDH as status,
          COUNT(*) as count
        FROM DonDatHang 
        WHERE MaTTDH IS NOT NULL
        GROUP BY MaTTDH
        
        UNION ALL
        
        SELECT 
          'total' as status,
          COUNT(*) as count
        FROM DonDatHang
      `,
        {
          type: QueryTypes.SELECT,
        }
      );

      // Chuyển đổi kết quả thành object dễ sử dụng
      const result = {
        total: 0,
        1: 0, // Đã đặt
        2: 0, // Đã duyệt
        3: 0, // Đang giao hàng
        4: 0, // Hoàn tất
        5: 0, // Hủy
      };

      statistics.forEach((stat) => {
        if (stat.status === "total") {
          result.total = parseInt(stat.count);
        } else {
          const statusId = parseInt(stat.status);
          if (statusId >= 1 && statusId <= 5) {
            result[statusId] = parseInt(stat.count);
          }
        }
      });

      return result;
    } catch (error) {
      console.error("Error in getOrderStatistics:", error);
      throw new Error("Không thể lấy thống kê đơn hàng");
    }
  },

  // Method cũ để tương thích
  getByCustomer: async (customerId, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    const { count, rows } = await DonDatHang.findAndCountAll({
      where: { MaKH: customerId },
      include: [
        {
          model: TrangThaiDH,
          attributes: ["MaTTDH", "TrangThai"],
        },
        {
          model: CT_DonDatHang,
          include: [
            {
              model: ChiTietSanPham,
              include: [
                {
                  model: SanPham,
                  attributes: ["MaSP", "TenSP", "MoTa"],
                },
                {
                  model: KichThuoc,
                  attributes: ["MaKichThuoc", "TenKichThuoc"],
                },
                {
                  model: Mau,
                  attributes: ["MaMau", "TenMau", "MaHex"],
                },
              ],
            },
          ],
        },
        {
          model: HoaDon,
          attributes: ["SoHD", "NgayLap"],
          required: false,
        },
      ],
      order: [["NgayTao", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
      distinct: true,
    });

    // Tính tổng tiền cho mỗi đơn hàng
    const ordersWithTotal = rows.map((order) => {
      const orderData = order.toJSON();
      let tongTien = 0;

      if (orderData.CT_DonDatHangs && orderData.CT_DonDatHangs.length > 0) {
        tongTien = orderData.CT_DonDatHangs.reduce((sum, item) => {
          return sum + parseFloat(item.DonGia) * item.SoLuong;
        }, 0);
      }

      return {
        ...orderData,
        TongTien: tongTien,
      };
    });

    return {
      orders: ordersWithTotal,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    };
  },

  // Lấy thông tin chi tiết đầy đủ của đơn hàng (cho trang xem chi tiết)
  getDetailById: async (maDDH) => {
    try {
      const order = await DonDatHang.findByPk(maDDH, {
        include: [
          {
            model: KhachHang,
            attributes: ["MaKH", "TenKH", "SDT", "DiaChi", "CCCD"],
          },
          {
            model: NhanVien,
            as: "NguoiDuyet",
            attributes: ["MaNV", "TenNV"],
            required: false,
          },
          {
            model: NhanVien,
            as: "NguoiGiao",
            attributes: ["MaNV", "TenNV"],
            required: false,
          },
          {
            model: TrangThaiDH,
            attributes: ["MaTTDH", "TrangThai"],
          },
          {
            model: CT_DonDatHang,
            include: [
              {
                model: ChiTietSanPham,
                include: [
                  {
                    model: SanPham,
                    attributes: ["MaSP", "TenSP"],
                    include: [
                      {
                        model: AnhSanPham,
                        attributes: [
                          "MaAnh",
                          "TenFile",
                          "DuongDan",
                          "AnhChinh",
                          "ThuTu",
                        ],
                        where: { AnhChinh: true },
                        required: false,
                      },
                    ],
                  },
                  {
                    model: KichThuoc,
                    attributes: ["MaKichThuoc", "TenKichThuoc"],
                  },
                  {
                    model: Mau,
                    attributes: ["MaMau", "TenMau", "MaHex"],
                  },
                ],
              },
            ],
          },
          {
            model: HoaDon,
            attributes: ["SoHD", "NgayLap"],
            required: false,
          },
        ],
      });

      if (!order) return null;

      const orderData = order.toJSON();

      // Xử lý thông tin chi tiết sản phẩm
      let tongTien = 0;
      let tongSoLuong = 0;
      let danhSachSanPham = [];

      if (orderData.CT_DonDatHangs && orderData.CT_DonDatHangs.length > 0) {
        danhSachSanPham = orderData.CT_DonDatHangs.map((item) => {
          const donGia = parseFloat(item.DonGia) || 0;
          const soLuong = item.SoLuong || 0;
          const thanhTien = donGia * soLuong;

          tongTien += thanhTien;
          tongSoLuong += soLuong;

          return {
            MaCTDDH: item.MaCTDDH,
            MaCTSP: item.MaCTSP,
            SoLuong: soLuong,
            DonGia: donGia,
            ThanhTien: thanhTien,
            SoLuongTra: item.SoLuongTra || 0,
            SanPham: {
              MaSP: item.ChiTietSanPham?.SanPham?.MaSP || 0,
              TenSP: item.ChiTietSanPham?.SanPham?.TenSP || "",
              MoTa: item.ChiTietSanPham?.SanPham?.MoTa || "",
              KichThuoc: item.ChiTietSanPham?.KichThuoc?.TenKichThuoc || "",
              MauSac: {
                TenMau: item.ChiTietSanPham?.Mau?.TenMau || "",
                MaHex: item.ChiTietSanPham?.Mau?.MaHex || "",
              },
              HinhAnh: item.ChiTietSanPham?.SanPham?.AnhSanPhams?.[0]
                ? {
                    MaAnh: item.ChiTietSanPham.SanPham.AnhSanPhams[0].MaAnh,
                    TenFile: item.ChiTietSanPham.SanPham.AnhSanPhams[0].TenFile,
                    DuongDan:
                      item.ChiTietSanPham.SanPham.AnhSanPhams[0].DuongDan,
                  }
                : null,
            },
          };
        });
      }

      // Trả về dữ liệu được cấu trúc tốt
      return {
        ThongTinDonHang: {
          MaDDH: orderData.MaDDH,
          NgayTao: orderData.NgayTao,
          TrangThai: {
            Ma: orderData.TrangThaiDH?.MaTTDH || 0,
            Ten: orderData.TrangThaiDH?.TrangThai || "",
          },
          TongSoLuong: tongSoLuong,
          TongTien: tongTien,
        },
        ThongTinNguoiNhan: {
          HoTen: orderData.NguoiNhan || "",
          SDT: orderData.SDT || "",
          DiaChi: orderData.DiaChiGiao || "",
          ThoiGianGiao: orderData.ThoiGianGiao || "",
        },
        ThongTinKhachHang: {
          MaKH: orderData.KhachHang?.MaKH || 0,
          TenKH: orderData.KhachHang?.TenKH || "",
          SDT: orderData.KhachHang?.SDT || "",
          DiaChi: orderData.KhachHang?.DiaChi || "",
          CCCD: orderData.KhachHang?.CCCD || "",
        },
        ThongTinXuLy: {
          NguoiDuyet: {
            MaNV: orderData.NguoiDuyet?.MaNV || 0,
            TenNV: orderData.NguoiDuyet?.TenNV || "",
          },
          NguoiGiao: {
            MaNV: orderData.NguoiGiao?.MaNV || 0,
            TenNV: orderData.NguoiGiao?.TenNV || "",
          },
        },
        DanhSachSanPham: danhSachSanPham,
        ThongTinHoaDon: orderData.HoaDon
          ? {
              SoHD: orderData.HoaDon.SoHD,
              NgayLap: orderData.HoaDon.NgayLap,
            }
          : null,
      };
    } catch (error) {
      console.error("Error in getDetailById:", error);
      throw new Error(
        "Không thể lấy thông tin chi tiết đơn hàng: " + error.message
      );
    }
  },

  // Method cũ để tương thích
  getByCustomer: async (customerId, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    const { count, rows } = await DonDatHang.findAndCountAll({
      where: { MaKH: customerId },
      include: [
        {
          model: TrangThaiDH,
          attributes: ["MaTTDH", "TrangThai"],
        },
        {
          model: CT_DonDatHang,
          include: [
            {
              model: ChiTietSanPham,
              include: [
                {
                  model: SanPham,
                  attributes: ["MaSP", "TenSP", "MoTa"],
                },
                {
                  model: KichThuoc,
                  attributes: ["MaKichThuoc", "TenKichThuoc"],
                },
                {
                  model: Mau,
                  attributes: ["MaMau", "TenMau", "MaHex"],
                },
              ],
            },
          ],
        },
        {
          model: HoaDon,
          attributes: ["SoHD", "NgayLap"],
          required: false,
        },
      ],
      order: [["NgayTao", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
      distinct: true,
    });

    // Tính tổng tiền cho mỗi đơn hàng
    const ordersWithTotal = rows.map((order) => {
      const orderData = order.toJSON();
      let tongTien = 0;

      if (orderData.CT_DonDatHangs && orderData.CT_DonDatHangs.length > 0) {
        tongTien = orderData.CT_DonDatHangs.reduce((sum, item) => {
          return sum + parseFloat(item.DonGia) * item.SoLuong;
        }, 0);
      }

      return {
        ...orderData,
        TongTien: tongTien,
      };
    });

    return {
      orders: ordersWithTotal,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    };
  },

  // Cập nhật nhân viên giao hàng cho đơn hàng
  updateDeliveryStaff: async (maDDH, maNVGiao) => {
    const transaction = await sequelize.transaction();

    try {
      // Kiểm tra đơn hàng tồn tại
      const order = await DonDatHang.findByPk(maDDH, { transaction });
      if (!order) {
        throw new Error("Không tìm thấy đơn hàng");
      }

      // Kiểm tra trạng thái đơn hàng (chỉ cho phép cập nhật khi đã duyệt)
      if (order.MaTTDH !== 2) {
        throw new Error(
          "Chỉ có thể phân công nhân viên cho đơn hàng đã được duyệt"
        );
      }

      // Kiểm tra nhân viên tồn tại
      const employee = await NhanVien.findByPk(maNVGiao, { transaction });
      if (!employee) {
        throw new Error("Không tìm thấy nhân viên");
      }

      // Kiểm tra nhân viên có thuộc bộ phận giao hàng và đang làm việc không
      const employeeDepartment = await NhanVien_BoPhan.findOne({
        where: {
          MaNV: maNVGiao,
          MaBoPhan: 11, // Mã bộ phận giao hàng
          TrangThai: "DANGLAMVIEC",
        },
        transaction,
      });

      if (!employeeDepartment) {
        throw new Error(
          "Nhân viên không thuộc bộ phận giao hàng hoặc không đang làm việc"
        );
      }

      // Cập nhật nhân viên giao hàng và chuyển trạng thái sang "Đang giao hàng"
      await order.update(
        {
          MaNV_Giao: maNVGiao,
          MaTTDH: 3, // Trạng thái "Đang giao hàng"
          ThoiGianGiao: new Date(),
        },
        { transaction }
      );

      await transaction.commit();

      // Trả về thông tin đơn hàng đã cập nhật
      return await DonDatHangService.getById(maDDH);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // === METHODS CHO NHÂN VIÊN GIAO HÀNG ===

  // Lấy đơn hàng được phân công cho nhân viên giao hàng
  getAssignedOrders: async (maNVGiao, page = 1, limit = 10, status = null) => {
    const offset = (page - 1) * limit;

    const whereCondition = {
      MaNV_Giao: maNVGiao,
    };

    // Thêm điều kiện trạng thái nếu có
    if (status !== null) {
      whereCondition.MaTTDH = status;
    }

    const { count, rows } = await DonDatHang.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: KhachHang,
          attributes: ["MaKH", "TenKH", "SDT", "DiaChi", "CCCD"],
        },
        {
          model: NhanVien,
          as: "NguoiDuyet",
          attributes: ["MaNV", "TenNV"],
          required: false,
        },
        {
          model: NhanVien,
          as: "NguoiGiao",
          attributes: ["MaNV", "TenNV"],
          required: false,
        },
        {
          model: TrangThaiDH,
          attributes: ["MaTTDH", "TrangThai"],
        },
        {
          model: CT_DonDatHang,
          include: [
            {
              model: ChiTietSanPham,
              include: [
                {
                  model: SanPham,
                  attributes: ["MaSP", "TenSP"],
                },
                {
                  model: KichThuoc,
                  attributes: ["MaKichThuoc", "TenKichThuoc"],
                },
                {
                  model: Mau,
                  attributes: ["MaMau", "TenMau", "MaHex"],
                },
              ],
            },
          ],
        },
      ],
      order: [["NgayTao", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
      distinct: true,
    });

    // Tính tổng tiền cho mỗi đơn hàng
    const ordersWithTotal = rows.map((order) => {
      const orderData = order.toJSON();
      let tongTien = 0;

      if (orderData.CT_DonDatHangs && orderData.CT_DonDatHangs.length > 0) {
        tongTien = orderData.CT_DonDatHangs.reduce((sum, item) => {
          const donGia = parseFloat(item.DonGia) || 0;
          const soLuong = parseInt(item.SoLuong) || 0;
          return sum + donGia * soLuong;
        }, 0);
      }

      return {
        ...orderData,
        TongTien: Math.round(tongTien * 100) / 100,
      };
    });

    return {
      orders: ordersWithTotal,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    };
  },

  // Xác nhận đã giao hàng xong
  confirmDelivery: async (maDDH, maNVGiao) => {
    const transaction = await sequelize.transaction();

    try {
      // Kiểm tra đơn hàng tồn tại và được phân công cho nhân viên này
      const order = await DonDatHang.findOne({
        where: {
          MaDDH: maDDH,
          MaNV_Giao: maNVGiao,
        },
        transaction,
      });

      if (!order) {
        throw new Error(
          "Không tìm thấy đơn hàng hoặc đơn hàng không được phân công cho bạn"
        );
      }

      // Kiểm tra trạng thái đơn hàng (chỉ cho phép xác nhận khi đang giao hàng)
      if (order.MaTTDH !== 3) {
        throw new Error(
          "Chỉ có thể xác nhận giao hàng cho đơn hàng đang trong quá trình giao"
        );
      }

      // Cập nhật trạng thái sang "Đã giao hàng"
      await order.update(
        {
          MaTTDH: 4, // Trạng thái "Đã giao hàng"
          ThoiGianHoanThanh: new Date(),
        },
        { transaction }
      );

      await transaction.commit();

      // Trả về thông tin đơn hàng đã cập nhật
      return await DonDatHangService.getById(maDDH);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  getRevenueReport: async (ngayBatDau, ngayKetThuc) => {
    // 1. Lấy các đơn đặt hàng đã hoàn thành (MaTTDH = 4) trong khoảng thời gian
    const donDatHangs = await DonDatHang.findAll({
      where: {
        MaTTDH: 4,
        NgayTao: {
          [Op.gte]: ngayBatDau,
          [Op.lte]: ngayKetThuc,
        },
      },
      attributes: ["MaDDH"],
      raw: true,
    });
    const maDDHs = donDatHangs.map((d) => d.MaDDH);
    if (maDDHs.length === 0) return [];

    // 2. Lấy tất cả chi tiết đơn đặt hàng tương ứng
    const chiTietDonHangs = await CT_DonDatHang.findAll({
      where: { MaDDH: { [Op.in]: maDDHs } },
      attributes: [
        "MaCTSP",
        "DonGia",
        [
          require("sequelize").fn("SUM", require("sequelize").col("SoLuong")),
          "TongSoLuong",
        ],
      ],
      group: ["MaCTSP", "DonGia"],
      raw: true,
    });

    if (chiTietDonHangs.length === 0) return [];

    // 3. Lấy thông tin sản phẩm và loại sản phẩm cho các MaCTSP
    const maCTSPs = chiTietDonHangs.map((c) => c.MaCTSP);
    const chiTietSPs = await ChiTietSanPham.findAll({
      where: { MaCTSP: { [Op.in]: maCTSPs } },
      include: [
        {
          model: SanPham,
          include: [{ model: LoaiSP }],
        },
      ],
      raw: true,
      nest: true,
    });

    // 4. Map MaCTSP -> ChiTietSanPham, SanPham, LoaiSP
    const mapCTSP = {};
    chiTietSPs.forEach((ct) => {
      mapCTSP[ct.MaCTSP] = ct;
    });

    // 5. Gom nhóm dữ liệu theo LoaiSP -> SanPham -> DonGia
    // const result = {};
    // chiTietDonHangs.forEach((item) => {
    //   const ctsp = mapCTSP[item.MaCTSP];
    //   if (!ctsp) return;
    //   const sanPham = ctsp.SanPham;
    //   const loaiSP = sanPham.LoaiSP;

    //   if (!result[loaiSP.MaLoaiSP]) {
    //     result[loaiSP.MaLoaiSP] = {
    //       MaLoaiSP: loaiSP.MaLoaiSP,
    //       TenLoai: loaiSP.TenLoai,
    //       SanPhams: {},
    //     };
    //   }

    //   if (!result[loaiSP.MaLoaiSP].SanPhams[sanPham.MaSP]) {
    //     result[loaiSP.MaLoaiSP].SanPhams[sanPham.MaSP] = {
    //       MaSP: sanPham.MaSP,
    //       TenSP: sanPham.TenSP,
    //       DonGiaList: [],
    //     };
    //   }

    //   result[loaiSP.MaLoaiSP].SanPhams[sanPham.MaSP].DonGiaList.push({
    //     MaCTSP: item.MaCTSP,
    //     DonGia: Number(item.DonGia),
    //     SoLuong: Number(item.TongSoLuong),
    //   });
    // });

    // // 6. Chuyển object sang array, format dữ liệu trả về
    // return Object.values(result).map((loai) => ({
    //   MaLoaiSP: loai.MaLoaiSP,
    //   TenLoai: loai.TenLoai,
    //   SanPhams: Object.values(loai.SanPhams).map((sp) => ({
    //     MaSP: sp.MaSP,
    //     TenSP: sp.TenSP,
    //     DonGiaList: sp.DonGiaList,
    //   })),
    // }));
    const result = {};
    chiTietDonHangs.forEach((item) => {
      const ctsp = mapCTSP[item.MaCTSP];
      if (!ctsp) return;
      const sanPham = ctsp.SanPham;
      const loaiSP = sanPham.LoaiSP;

      if (!result[loaiSP.MaLoaiSP]) {
        result[loaiSP.MaLoaiSP] = {
          MaLoaiSP: loaiSP.MaLoaiSP,
          TenLoai: loaiSP.TenLoai,
          SanPhams: {},
        };
      }

      if (!result[loaiSP.MaLoaiSP].SanPhams[sanPham.MaSP]) {
        result[loaiSP.MaLoaiSP].SanPhams[sanPham.MaSP] = {
          MaSP: sanPham.MaSP,
          TenSP: sanPham.TenSP,
          DonGiaList: [],
        };
      }

      result[loaiSP.MaLoaiSP].SanPhams[sanPham.MaSP].DonGiaList.push({
        DonGia: Number(item.DonGia),
        SoLuong: Number(item.TongSoLuong),
      });
    });

    // 6. Gom nhóm DonGiaList theo DonGia (cộng dồn SoLuong), bỏ MaCTSP
    function groupByDonGia(donGiaList) {
      const map = {};
      donGiaList.forEach((item) => {
        if (!map[item.DonGia]) {
          map[item.DonGia] = 0;
        }
        map[item.DonGia] += item.SoLuong;
      });
      return Object.entries(map).map(([DonGia, SoLuong]) => ({
        DonGia: Number(DonGia),
        SoLuong: Number(SoLuong),
      }));
    }

    // 7. Chuyển object sang array, format dữ liệu trả về
    return Object.values(result).map((loai) => ({
      MaLoaiSP: loai.MaLoaiSP,
      TenLoai: loai.TenLoai,
      SanPhams: Object.values(loai.SanPhams).map((sp) => ({
        MaSP: sp.MaSP,
        TenSP: sp.TenSP,
        DonGiaList: groupByDonGia(sp.DonGiaList),
      })),
    }));
  },
  cancelOrder: async (maKH, maDDH) => {
    // Tìm đơn hàng theo MaDDH và MaKH
    const order = await DonDatHang.findOne({
      where: {
        MaDDH: maDDH,
        MaKH: maKH,
      },
    });
    if (!order) return null;

    // Chuyển trạng thái về 5 (đã hủy)
    order.MaTTDH = 5;
    await order.save();

    return order;
  },
};

module.exports = DonDatHangService;
