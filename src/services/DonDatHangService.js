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
  BinhLuan,
} = require("../models");
const sequelize = require("../models/sequelize");
const { Op, or } = require("sequelize");
const NotificationService = require("./NotificationService");
const { formatDateTimeShort } = require("../utils/formatter");

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
    const transaction = await sequelize.transaction();
    try {
      const order = await DonDatHang.findByPk(maDDH, {
        include: [
          {
            model: CT_DonDatHang,
            attributes: ["MaCTDDH", "MaCTSP", "SoLuong"],
          },
        ],
        transaction,
      });
      if (!order) {
        await transaction.rollback();
        return null;
      }

      const previousStatus = order.MaTTDH; // lưu trạng thái cũ
      const updateData = { MaTTDH: maTTDH };
      if (maNVDuyet) updateData.MaNV_Duyet = maNVDuyet;
      if (maNVGiao) updateData.MaNV_Giao = maNVGiao;

      // Nếu chuyển sang HỦY (5) và trước đó chưa hoàn tất (4) & chưa hủy (5) => hoàn trả tồn kho
      if (maTTDH === 5 && previousStatus !== 5 && previousStatus !== 4) {
        if (order.CT_DonDatHangs && order.CT_DonDatHangs.length > 0) {
          for (const ct of order.CT_DonDatHangs) {
            if (ct.MaCTSP && ct.SoLuong) {
              await ChiTietSanPham.increment(
                { SoLuongTon: ct.SoLuong },
                { where: { MaCTSP: ct.MaCTSP }, transaction }
              );
            }
          }
        }
      }

      await order.update(updateData, { transaction });
      await transaction.commit();
      return await DonDatHangService.getById(maDDH);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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
        WHERE MaTTDH IS NOT NULL AND MaTTDH != 6
        GROUP BY MaTTDH
        
        UNION ALL
        
        SELECT 
          'total' as status,
          COUNT(*) as count
        FROM DonDatHang
        WHERE MaTTDH IS NOT NULL AND MaTTDH != 6
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
        7: 0, // Trả hàng
      };

      statistics.forEach((stat) => {
        if (stat.status === "total") {
          result.total = parseInt(stat.count);
        } else {
          const statusId = parseInt(stat.status);
          if ((statusId >= 1 && statusId <= 5) || statusId === 7) {
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

  // Method cũ để tương thích - FIXED VERSION
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
            {
              model: BinhLuan,
              attributes: ["MaBL", "MoTa", "SoSao", "NgayBinhLuan"],
              required: false,
              include: [
                {
                  model: KhachHang,
                  attributes: ["MaKH", "TenKH"],
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

    // Tính tổng tiền và xử lý bình luận cho mỗi đơn hàng
    const ordersWithTotal = rows.map((order) => {
      const orderData = order.toJSON();
      let tongTien = 0;
      let danhSachBinhLuan = [];

      if (orderData.CT_DonDatHangs && orderData.CT_DonDatHangs.length > 0) {
        // Tính tổng tiền
        tongTien = orderData.CT_DonDatHangs.reduce((sum, item) => {
          return sum + parseFloat(item.DonGia) * item.SoLuong;
        }, 0);

        // Thu thập bình luận từ tất cả chi tiết đơn hàng
        orderData.CT_DonDatHangs.forEach((item) => {
          if (item.BinhLuans && item.BinhLuans.length > 0) {
            item.BinhLuans.forEach((binhLuan) => {
              danhSachBinhLuan.push({
                MaBL: binhLuan.MaBL,
                MaCTDDH: item.MaCTDDH,
                MoTa: binhLuan.MoTa,
                SoSao: binhLuan.SoSao,
                NgayBinhLuan: binhLuan.NgayBinhLuan,
                KhachHang: {
                  MaKH: binhLuan.KhachHang?.MaKH || customerId,
                  TenKH: binhLuan.KhachHang?.TenKH || "",
                },
                SanPham: {
                  MaSP: item.ChiTietSanPham?.SanPham?.MaSP || 0,
                  TenSP: item.ChiTietSanPham?.SanPham?.TenSP || "",
                  KichThuoc: item.ChiTietSanPham?.KichThuoc?.TenKichThuoc || "",
                  MauSac: {
                    TenMau: item.ChiTietSanPham?.Mau?.TenMau || "",
                    MaHex: item.ChiTietSanPham?.Mau?.MaHex || "",
                  },
                },
              });
            });
          }
        });
      }

      return {
        ...orderData,
        TongTien: tongTien,
        DanhSachBinhLuan: danhSachBinhLuan,
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
          HinhMinhChung: orderData.HinhMinhChung || null,
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

  // Cập nhật nhân viên giao hàng cho đơn hàng
  updateDeliveryStaff: async (maDDH, maNVGiao) => {
    const transaction = await sequelize.transaction();

    try {
      // Kiểm tra đơn hàng tồn tại
      const order = await DonDatHang.findByPk(maDDH, {
        include: [
          {
            model: KhachHang,
            attributes: ["TenKH", "SDT", "DiaChi"],
          },
        ],
        transaction,
      });

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
          NgayCapNhat: new Date(),
        },
        { transaction }
      );

      
      // Gửi thông báo cho nhân viên giao hàng (không chặn luồng chính)
      NotificationService.sendNotificationToEmployee(maNVGiao, {
        title: "🚚 Đơn hàng mới vừa được phân công",
        body: `Bạn có đơn hàng mới 📦 #${maDDH} cần giao đến khách hàng ${order.NguoiNhan}. Thời gian giao hàng dự kiến là 🕛 ${formatDateTimeShort(order.ThoiGianGiao)}.`,
        data: {},
        maDDH: maDDH,
        loaiThongBao: "ORDER_ASSIGNED",
      })
      .then((result) => {
        console.log("✓ Kết quả gửi thông báo:", result);
      })
      .catch((notifError) => {
        console.error("✗ Lỗi khi gửi thông báo:", notifError.message);
        // Không throw error để không ảnh hưởng đến việc phân công đơn hàng
      });

      await transaction.commit();  
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
        hasNextPage: page < Math.ceil(count / limit),
        hasPrevPage: page > 1,
      },
    };
  },

  // Nhân viên xác nhận hoàn thành giao hàng
  confirmDelivery: async (maDDH, HinhAnh, maNVGiao) => {
    const transaction = await sequelize.transaction();

    try {
      // Kiểm tra đơn hàng và quyền của nhân viên
      const order = await DonDatHang.findOne({
        where: {
          MaDDH: maDDH,
          MaNV_Giao: maNVGiao,
          MaTTDH: 3, // Đang giao hàng
        },
        transaction,
      });

      if (!order) {
        throw new Error(
          "Không tìm thấy đơn hàng hoặc bạn không có quyền xác nhận đơn hàng này"
        );
      }

      // Cập nhật trạng thái thành hoàn tất
      await order.update(
        {
          MaTTDH: 4, // Hoàn tất
          HinhMinhChung: HinhAnh,
          NgayCapNhat: new Date(),
        },
        { transaction }
      );

      await transaction.commit();

      return await DonDatHangService.getById(maDDH);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  getRevenueReport: async (ngayBatDau, ngayKetThuc) => {
    try {
      const { QueryTypes } = require("sequelize");
      // Gọi Stored Procedure
      const results = await sequelize.query(
        "CALL SP_GetRevenueReport(:ngayBatDau, :ngayKetThuc)",
        {
          replacements: {
            ngayBatDau: ngayBatDau,
            ngayKetThuc: ngayKetThuc,
          },
          type: QueryTypes.SELECT,
        }
      );

      // Stored Procedure trả về array với một phần tử là kết quả
      const data = results[0] || [];
      console.log("data", data);

      // Chuyển đổi dữ liệu để đảm bảo kiểu dữ liệu đúng
      const dataArray = Object.values(data);

      // Chuyển đổi dữ liệu để đảm bảo kiểu dữ liệu đúng
      return dataArray.map((item) => ({
        thang: Number(item.thang),
        nam: Number(item.nam),
        doanhThu: Number(item.doanhThu) || 0,
      }));
    } catch (error) {
      console.error("Error calling SP_GetRevenueReport:", error);
      throw new Error("Không thể lấy báo cáo doanh thu: " + error.message);
    }
  },
  cancelOrder: async (maKH, maDDH) => {
    const transaction = await sequelize.transaction();
    try {
      const order = await DonDatHang.findOne({
        where: { MaDDH: maDDH, MaKH: maKH },
        include: [
          {
            model: CT_DonDatHang,
            attributes: ["MaCTDDH", "MaCTSP", "SoLuong"],
          },
        ],
        transaction,
      });
      if (!order) {
        await transaction.rollback();
        return null;
      }

      // Chỉ hoàn trả tồn kho nếu đơn chưa hoàn tất & chưa hủy
      if (order.MaTTDH !== 5 && order.MaTTDH !== 4) {
        if (order.CT_DonDatHangs && order.CT_DonDatHangs.length > 0) {
          for (const ct of order.CT_DonDatHangs) {
            if (ct.MaCTSP && ct.SoLuong) {
              await ChiTietSanPham.increment(
                { SoLuongTon: ct.SoLuong },
                { where: { MaCTSP: ct.MaCTSP }, transaction }
              );
            }
          }
        }
      }

      // Cập nhật trạng thái về HỦY (5)
      await order.update({ MaTTDH: 5 }, { transaction });
      await transaction.commit();
      return order;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Thống kê đơn hàng theo sản phẩm
  getProductOrderStats: async (startDate = null, endDate = null) => {
    try {
      const whereCondition = {
        MaTTDH: { [Op.ne]: 6 }, // Loại bỏ giỏ hàng
      };

      if (startDate && endDate) {
        whereCondition.NgayTao = {
          [Op.between]: [startDate, endDate],
        };
      }

      const orderDetails = await CT_DonDatHang.findAll({
        include: [
          {
            model: DonDatHang,
            where: whereCondition,
            attributes: [],
          },
          {
            model: ChiTietSanPham,
            include: [
              {
                model: SanPham,
                attributes: ["MaSP", "TenSP"],
                include: [
                  {
                    model: LoaiSP,
                    attributes: ["MaLoaiSP", "TenLoaiSP"],
                  },
                ],
              },
              {
                model: KichThuoc,
                attributes: ["TenKichThuoc"],
              },
              {
                model: Mau,
                attributes: ["TenMau", "MaHex"],
              },
            ],
          },
        ],
        attributes: ["SoLuong", "DonGia"],
      });

      // Xử lý thống kê
      const stats = {};
      orderDetails.forEach((detail) => {
        const sp = detail.ChiTietSanPham?.SanPham;
        if (sp) {
          const key = `${sp.MaSP}-${sp.TenSP}`;
          if (!stats[key]) {
            stats[key] = {
              MaSP: sp.MaSP,
              TenSP: sp.TenSP,
              LoaiSP: sp.LoaiSP?.TenLoaiSP || "",
              TongSoLuongBan: 0,
              TongDoanhThu: 0,
              SoBienThe: 0,
              BienThe: [],
            };
          }

          stats[key].TongSoLuongBan += detail.SoLuong;
          stats[key].TongDoanhThu += detail.SoLuong * parseFloat(detail.DonGia);

          // Thêm biến thể
          const bienThe = `${
            detail.ChiTietSanPham.KichThuoc?.TenKichThuoc || ""
          }-${detail.ChiTietSanPham.Mau?.TenMau || ""}`;
          if (!stats[key].BienThe.includes(bienThe)) {
            stats[key].BienThe.push(bienThe);
            stats[key].SoBienThe++;
          }
        }
      });

      return Object.values(stats).sort(
        (a, b) => b.TongSoLuongBan - a.TongSoLuongBan
      );
    } catch (error) {
      console.error("Error in getProductOrderStats:", error);
      throw new Error("Không thể lấy thống kê đơn hàng theo sản phẩm");
    }
  },

  // Nhóm đơn hàng theo đơn giá để xử lý tình trạng nhiều đơn giá khác nhau cho cùng sản phẩm
  groupByDonGia: (donGiaList) => {
    const grouped = {};
    donGiaList.forEach((item) => {
      const key = item.DonGia.toString();
      if (!grouped[key]) {
        grouped[key] = {
          DonGia: parseFloat(item.DonGia),
          TongSoLuong: 0,
          DonHangs: [],
        };
      }
      grouped[key].TongSoLuong += item.SoLuong;
      grouped[key].DonHangs.push({
        MaDDH: item.MaDDH,
        NgayTao: item.NgayTao,
        SoLuong: item.SoLuong,
      });
    });
    return Object.values(grouped);
  },
  getCurrentMonthOrders: async () => {
    // Tính toán ngày đầu và cuối tháng hiện tại
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    // Format ngày cho SQL
    const startDate = startOfMonth.toISOString().split("T")[0];
    const endDate = endOfMonth.toISOString().split("T")[0];

    const whereCondition = {
      NgayTao: {
        [Op.between]: [startDate, endDate],
      },
      MaTTDH: { [Op.ne]: 6 }, // Loại bỏ giỏ hàng
    };

    const orders = await DonDatHang.findAll({
      where: whereCondition,
      include: [
        {
          model: KhachHang,
          attributes: ["MaKH", "TenKH", "SDT", "DiaChi", "CCCD"],
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
    });

    // Tính tổng tiền cho mỗi đơn hàng
    const ordersWithTotal = orders.map((order) => {
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
      thongTinThang: {
        thang: now.getMonth() + 1,
        nam: now.getFullYear(),
        ngayBatDau: startDate,
        ngayKetThuc: endDate,
        tongSoDonHang: ordersWithTotal.length,
      },
    };
  },
};

// Hàm helper để nhóm đơn giá (đặt bên ngoài object)
const groupByDonGia = (donGiaList) => {
  const grouped = {};
  donGiaList.forEach((item) => {
    const key = item.DonGia.toString();
    if (!grouped[key]) {
      grouped[key] = {
        DonGia: parseFloat(item.DonGia),
        TongSoLuong: 0,
        DonHangs: [],
      };
    }
    grouped[key].TongSoLuong += item.SoLuong;
    grouped[key].DonHangs.push({
      MaDDH: item.MaDDH,
      NgayTao: item.NgayTao,
      SoLuong: item.SoLuong,
    });
  });
  return Object.values(grouped);
};

module.exports = DonDatHangService;
