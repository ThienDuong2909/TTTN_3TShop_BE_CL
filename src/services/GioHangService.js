const { Op } = require("sequelize");
const sequelize = require("../models/sequelize");
const DonDatHang = require("../models/DonDatHang");
const CT_DonDatHang = require("../models/CT_DonDatHang");
const ChiTietSanPham = require("../models/ChiTietSanPham");
const KhachHang = require("../models/KhachHang");
const TaiKhoan = require("../models/TaiKhoan");
const Mau = require("../models/Mau");
const TrangThaiDH = require("../models/TrangThaiDH");
const KichThuoc = require("../models/KichThuoc");
const SanPhamService = require("./SanPhamService");
const EmailService = require("./EmailService");
const NhanVien = require("../models/NhanVien");

const moment = require("moment-timezone");

const HoaDon = require("../models/HoaDon");
const PhieuTraHang = require("../models/PhieuTraHang");


const GioHangService = {
  addToCart: async (maKH, maSP, maHex, tenKichThuoc, soLuongInput) => {
    const soLuong = Number(soLuongInput) || 1;

    const khachHang = await KhachHang.findOne({
      where: { MaKH: Number(maKH) },
    });
    if (!khachHang) throw new Error("Khách hàng không tồn tại");

    const mau = await Mau.findOne({
      where: { MaHex: maHex },
    });
    const kichthuoc = await KichThuoc.findOne({
      where: { TenKichThuoc: tenKichThuoc },
    });
    console.log(mau);
    console.log(kichthuoc);
    const chiTietSP = await ChiTietSanPham.findOne({
      where: {
        MaSP: Number(maSP),
        MaMau: mau.MaMau,
        MaKichThuoc: kichthuoc.MaKichThuoc,
      },
    });

    if (!chiTietSP) throw new Error("Không tìm thấy chi tiết sản phẩm phù hợp");

    const maCTSP = chiTietSP.MaCTSP;

    const giaGoc = await SanPhamService.getCurrentPrice(maSP);
    const phanTramGiam = await SanPhamService.getCurrentDiscount(maSP);
    const donGia = giaGoc - (giaGoc * phanTramGiam) / 100;
    console.log(
      "Giá gốc:",
      giaGoc,
      "Phần trăm giảm:",
      phanTramGiam,
      "Đơn giá:",
      donGia
    );

    let donDatHang = await DonDatHang.findOne({
      where: {
        MaKH: Number(maKH),
        MaTTDH: 6,
      },
      include: [{ model: CT_DonDatHang }],
    });

    if (!donDatHang) {
      const now = new Date();
      const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
      donDatHang = await DonDatHang.create({
        MaKH: Number(maKH),
        NgayTao: vietnamTime,
        DiaChiGiao: khachHang.DiaChi,
        NguoiNhan: khachHang.TenKH,
        MaTTDH: 6,
        SDT: "0123456789",
      });
      donDatHang.CT_DonDatHangs = [];
    }

    console.log("dondathang", donDatHang);

    const existingItem = donDatHang?.CT_DonDatHangs.find(
      (item) => item.MaCTSP === maCTSP && item.DonGia === donGia
    );

    if (existingItem) {
      console.log("existingItem");
      await CT_DonDatHang.update(
        { SoLuong: existingItem.SoLuong + soLuong },
        {
          where: {
            MaDDH: donDatHang.MaDDH,
            MaCTSP: maCTSP,
          },
        }
      );
    } else {
      console.log("not existingItem");

      await CT_DonDatHang.create({
        MaDDH: donDatHang.MaDDH,
        MaCTSP: maCTSP,
        SoLuong: soLuong,
        DonGia: donGia,
      });
    }

    const updatedCart = await DonDatHang.findOne({
      where: { MaDDH: donDatHang.MaDDH },
      include: [{ model: CT_DonDatHang }],
    });

    return updatedCart;
  },

  removeFromCart: async (maKH, maSP, maHex, tenKichThuoc, donGia) => {
    // 1. Tìm khách hàng và mã sản phẩm
    if (!maKH || !maSP || !maHex || !tenKichThuoc || !donGia) {
      throw new Error("Thiếu thông tin để xoá sản phẩm khỏi giỏ hàng");
    }

    // 2. Lấy màu và kích thước
    const mau = await Mau.findOne({ where: { MaHex: maHex } });
    const kichThuoc = await KichThuoc.findOne({
      where: { TenKichThuoc: tenKichThuoc },
    });

    if (!mau || !kichThuoc) {
      throw new Error("Không tìm thấy màu sắc hoặc kích thước");
    }

    // 3. Lấy chi tiết sản phẩm (maCTSP)
    const chiTietSP = await ChiTietSanPham.findOne({
      where: {
        MaCTSP: Number(maSP),
        MaMau: mau.MaMau,
        MaKichThuoc: kichThuoc.MaKichThuoc,
      },
    });

    if (!chiTietSP) {
      throw new Error("Không tìm thấy chi tiết sản phẩm phù hợp");
    }

    // 4. Tìm đơn hàng của khách với trạng thái giỏ hàng (6)
    const donDatHang = await DonDatHang.findOne({
      where: {
        MaKH: Number(maKH),
        MaTTDH: 6,
      },
      include: [{ model: CT_DonDatHang }],
    });

    if (!donDatHang) {
      throw new Error("Không tìm thấy giỏ hàng của khách hàng");
    }
    // console.log("donDatHang", donDatHang);

    // 5. Tìm chi tiết đơn hàng có MaCTSP
    const item = donDatHang.CT_DonDatHangs.find(
      (ct) =>
        ct.MaCTSP === chiTietSP.MaCTSP &&
        Number(ct.DonGia).toFixed(2) === Number(donGia).toFixed(2)
    );

    if (!item) {
      throw new Error("Sản phẩm cần xoá không tồn tại trong giỏ hàng");
    }

    // 6. Xoá dòng chi tiết đơn hàng
    await CT_DonDatHang.destroy({
      where: {
        MaDDH: donDatHang.MaDDH,
        MaCTSP: chiTietSP.MaCTSP,
      },
    });

    // 7. Trả lại giỏ hàng đã cập nhật
    const updatedCart = await DonDatHang.findOne({
      where: { MaDDH: donDatHang.MaDDH },
      include: [{ model: CT_DonDatHang }],
    });

    return updatedCart;
  },

  updateCartItem: async (maKH, maCTSP, soLuong) => {
    const transaction = await sequelize.transaction();
    try {
      if (!maKH || !maCTSP || soLuong === undefined) {
        throw new Error("Thiếu thông tin cập nhật giỏ hàng");
      }

      const donDatHang = await DonDatHang.findOne({
        where: { MaKH: Number(maKH), MaTTDH: 6 },
        include: [{ model: CT_DonDatHang }],
        transaction,
      });

      if (!donDatHang) {
        await transaction.rollback();
        throw new Error("Không tìm thấy giỏ hàng");
      }

      const item = donDatHang.CT_DonDatHangs.find(
        (ct) => ct.MaCTSP === Number(maCTSP)
      );

      if (!item) {
        await transaction.rollback();
        throw new Error("Sản phẩm không tồn tại trong giỏ hàng");
      }

      const newQuantity = Number(soLuong);
      if (newQuantity <= 0) {
        // Nếu số lượng <= 0 thì xóa sản phẩm
        await CT_DonDatHang.destroy({
          where: {
            MaCTDDH: item.MaCTDDH,
          },
          transaction,
        });
      } else {
        await CT_DonDatHang.update(
          { SoLuong: newQuantity },
          {
            where: {
              MaCTDDH: item.MaCTDDH,
            },
            transaction,
          }
        );
      }

      await transaction.commit();

      // Trả về giỏ hàng đã cập nhật
      return await GioHangService.getCartByCustomer(maKH);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  placeOrder: async (
    maKH,
    dsSanPham,
    diaChiGiao,
    nguoiNhan,
    SDT,
    thoiGianGiao
  ) => {
    console.log("=== START placeOrder ===");
    console.log("Input:", { maKH, dsSanPham, diaChiGiao, nguoiNhan, SDT, thoiGianGiao });

    // Bắt đầu transaction
    const transaction = await sequelize.transaction();

    try {
      const donDatHang = await DonDatHang.findOne({
        where: { MaKH: Number(maKH), MaTTDH: 6 },
        include: [{ model: CT_DonDatHang }],
        transaction,
      });
      console.log("donDatHang", donDatHang);

      if (!donDatHang) {
        console.error("ERROR: Không tìm thấy đơn hàng đang chờ (MaTTDH=6) cho MaKH:", maKH);
        await transaction.rollback();
        throw new Error("Không tìm thấy đơn hàng đang chờ");
      }
      console.log("Found DonDatHang:", donDatHang.MaDDH);

      for (const sp of dsSanPham) {
        const { maCTSP, soLuong } = sp;
        console.log(`Processing Item - MaCTSP: ${maCTSP}, SoLuong: ${soLuong}`);

        const chiTietSP = await ChiTietSanPham.findOne({
          where: {
            MaCTSP: Number(maCTSP),
          },
          transaction, // Thêm transaction vào query
        });

        if (!chiTietSP) {
          console.error(`ERROR: Không tìm thấy ChiTietSanPham với MaCTSP: ${maCTSP}`);
          await transaction.rollback();
          throw new Error("Không tìm thấy chi tiết sản phẩm phù hợp");
        }
        console.log(`Found ChiTietSanPham: ${chiTietSP.MaCTSP}, TonKho: ${chiTietSP.SoLuongTon}`);

        const ctDon = donDatHang.CT_DonDatHangs.find(
          (item) => item.MaCTSP === chiTietSP.MaCTSP
        );

        if (!ctDon) {
          console.error(`ERROR: Sản phẩm ${maCTSP} không có trong chi tiết đơn hàng (CT_DonDatHang)`);
          await transaction.rollback();
          throw new Error(`Sản phẩm ${maCTSP} chưa có trong đơn hàng`);
        }

        if (soLuong > chiTietSP.SoLuongTon) {
          console.error(`ERROR: Không đủ tồn kho. Cần: ${soLuong}, Có: ${chiTietSP.SoLuongTon}`);
          await transaction.rollback();
          throw new Error(`Sản phẩm ${maCTSP} không đủ tồn kho`);
        }

        console.log("Updating CT_DonDatHang and ChiTietSanPham...");

        // Cập nhật lại số lượng đặt
        await CT_DonDatHang.update(
          { SoLuong: soLuong },
          {
            where: { MaCTDDH: ctDon.MaCTDDH },
            transaction, // Thêm transaction vào query
          }
        );

        // Trừ tồn kho
        await ChiTietSanPham.update(
          { SoLuongTon: chiTietSP.SoLuongTon - soLuong },
          {
            where: { MaCTSP: chiTietSP.MaCTSP },
            transaction, // Thêm transaction vào query
          }
        );
      }

      console.log("Validating success. Updating DonDatHang status...");

      // Cập nhật trạng thái đơn hàng và thêm SDT, ThoiGianGiao
      await DonDatHang.update(
        {
          MaTTDH: 1,
          DiaChiGiao: diaChiGiao,
          NguoiNhan: nguoiNhan,
          SDT: SDT,
          ThoiGianGiao: thoiGianGiao,
        },
        {
          where: { MaDDH: donDatHang.MaDDH },
          transaction, // Thêm transaction vào query
        }
      );

      console.log("Commit Internal Transaction...");

      // Commit transaction nếu tất cả thao tác thành công
      await transaction.commit();
      console.log("Transaction Committed Successfully.");

      // Trả về đơn hàng đã cập nhật với đầy đủ thông tin để gửi email
      const updatedOrder = await DonDatHang.findOne({
        where: { MaDDH: donDatHang.MaDDH },
        include: [
          {
            model: CT_DonDatHang,
            include: [
              {
                model: ChiTietSanPham,
                include: [
                  {
                    model: require("../models/SanPham"),
                    attributes: ["MaSP", "TenSP"],
                  },
                  { model: Mau },
                  { model: KichThuoc },
                ],
              },
            ],
          },
        ],
      });

      // Gửi email xác nhận đơn hàng cho khách hàng (async, không chờ kết quả)
      // Lấy thông tin khách hàng và email
      try {
        const khachHang = await KhachHang.findOne({
          where: { MaKH: Number(maKH) },
          include: [
            {
              model: TaiKhoan,
              attributes: ["Email"],
            },
          ],
        });

        if (khachHang && khachHang.TaiKhoan && khachHang.TaiKhoan.Email) {
          // Gửi email không đồng bộ (không await)
          EmailService.sendOrderConfirmationEmail(
            updatedOrder,
            khachHang.TaiKhoan.Email,
            khachHang.TenKH
          ).catch((err) => {
            console.error("Lỗi khi gửi email xác nhận đơn hàng:", err);
          });
        }
      } catch (emailError) {
        // Log lỗi nhưng không ảnh hưởng đến kết quả đặt hàng
        console.error("Lỗi khi xử lý gửi email:", emailError);
      }

      return updatedOrder;
    } catch (error) {
      console.error("UNKNOWN ERROR in placeOrder, Rolling back...", error);
      // Rollback transaction nếu có lỗi
      await transaction.rollback();
      throw error;
    }
  },

  getCartByCustomer: async (maKH) => {
    const donDatHang = await DonDatHang.findOne({
      where: {
        MaKH: Number(maKH),
        MaTTDH: 6, // Trạng thái giỏ hàng
      },
      include: [
        {
          model: CT_DonDatHang,
          include: [
            {
              model: ChiTietSanPham,
              include: [
                {
                  model: require("../models/SanPham"),
                  include: [
                    {
                      model: require("../models/AnhSanPham"),
                      where: { AnhChinh: true }, // Chỉ lấy ảnh chính
                      attributes: ["DuongDan"],
                      required: false, // LEFT JOIN để không bỏ sót sản phẩm không có ảnh
                    },
                  ],
                },
                { model: require("../models/Mau") },
                { model: require("../models/KichThuoc") },
              ],
            },
          ],
        },
      ],
    });

    if (!donDatHang) {
      return { items: [], MaDDH: null };
    }

    const cartItems = donDatHang.CT_DonDatHangs.map((ct) => {
      const anhChinh = ct.ChiTietSanPham?.SanPham?.AnhSanPhams?.[0];

      return {
        maCTDDH: ct.MaCTDDH,
        soLuong: ct.SoLuong,
        donGia: ct.DonGia,
        maCTSP: ct.MaCTSP,
        sanPham: {
          maSP: ct.ChiTietSanPham?.SanPham?.MaSP,
          tenSP: ct.ChiTietSanPham?.SanPham?.TenSP,
        },
        kichThuoc: {
          ten: ct.ChiTietSanPham?.KichThuoc?.TenKichThuoc,
        },
        mau: {
          ten: ct.ChiTietSanPham?.Mau?.TenMau,
          hex: ct.ChiTietSanPham?.Mau?.MaHex,
        },
        anhSanPham: anhChinh ? anhChinh.DuongDan : null,
      };
    });

    return {
      MaDDH: donDatHang.MaDDH,
      items: cartItems,
    };
  },
  getAllOrdersByCustomer: async (maKH) => {
    const orders = await DonDatHang.findAll({
      where: { MaKH: Number(maKH), MaTTDH: { [Op.ne]: 6 } },
      include: [
        {
          model: CT_DonDatHang,
          include: [
            {
              model: ChiTietSanPham,
              include: [
                {
                  model: require("../models/SanPham"),
                  attributes: ["MaSP", "TenSP"], // Bỏ MoTa
                  include: [
                    {
                      model: require("../models/AnhSanPham"),
                      where: { AnhChinh: true }, // Chỉ lấy ảnh chính
                      attributes: ["DuongDan", "TenFile"],
                      required: false
                    },
                  ],
                },
                { model: require("../models/Mau") },
                { model: require("../models/KichThuoc") },
              ],
            },
            {
              model: require("../models/BinhLuan"),
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
          model: TrangThaiDH,
          attributes: ["MaTTDH", "TrangThai"],
        },
        {
          model: HoaDon,
          attributes: ['SoHD', 'NgayLap'],
          required: false,
          include: [
            {
              model: PhieuTraHang,
              attributes: ['MaPhieuTra', 'NgayTra', 'LyDo', 'TrangThai'],
              required: false,
              include: [
                {
                  model: NhanVien,
                  attributes: ['MaNV', 'TenNV'],
                  required: false
                }
              ]
            }
          ]
        }
      ],
      order: [["NgayTao", "DESC"]],
    });

    // Xử lý dữ liệu để thêm danh sách bình luận cho mỗi đơn hàng
    // const ordersWithComments = orders.map((order) => {
    //   const orderData = order.toJSON();
    //   let danhSachBinhLuan = [];

    //   // Thu thập tất cả bình luận từ các chi tiết đơn hàng
    //   if (orderData.CT_DonDatHangs && orderData.CT_DonDatHangs.length > 0) {
    //     orderData.CT_DonDatHangs.forEach((item) => {
    //       if (item.BinhLuans && item.BinhLuans.length > 0) {
    //         item.BinhLuans.forEach((binhLuan) => {
    //           danhSachBinhLuan.push({
    //             // Thông tin bình luận cơ bản
    //             MaBL: binhLuan.MaBL,
    //             MaCTDDH: item.MaCTDDH,
    //             MoTa: binhLuan.MoTa,
    //             SoSao: binhLuan.SoSao,
    //             NgayBinhLuan: binhLuan.NgayBinhLuan,

    //             // Thông tin khách hàng bình luận
    //             KhachHang: {
    //               MaKH: binhLuan.KhachHang?.MaKH || maKH,
    //               TenKH: binhLuan.KhachHang?.TenKH || "",
    //             },

    //             // Thông tin chi tiết sản phẩm được bình luận
    //             SanPham: {
    //               MaSP: item.ChiTietSanPham?.SanPham?.MaSP || 0,
    //               TenSP: item.ChiTietSanPham?.SanPham?.TenSP || "",

    //               // Thông tin biến thể sản phẩm
    //               ChiTiet: {
    //                 MaCTSP: item.MaCTSP,
    //                 KichThuoc: {
    //                   MaKichThuoc:
    //                     item.ChiTietSanPham?.KichThuoc?.MaKichThuoc || 0,
    //                   TenKichThuoc:
    //                     item.ChiTietSanPham?.KichThuoc?.TenKichThuoc || "",
    //                 },
    //                 MauSac: {
    //                   MaMau: item.ChiTietSanPham?.Mau?.MaMau || 0,
    //                   TenMau: item.ChiTietSanPham?.Mau?.TenMau || "",
    //                   MaHex: item.ChiTietSanPham?.Mau?.MaHex || "",
    //                 },
    //               },

    //               // Hình ảnh sản phẩm (lấy ảnh đầu tiên)
    //               HinhAnh: item.ChiTietSanPham?.SanPham?.AnhSanPhams?.[0]
    //                 ? {
    //                     MaAnh: item.ChiTietSanPham.SanPham.AnhSanPhams[0].MaAnh,
    //                     TenFile:
    //                       item.ChiTietSanPham.SanPham.AnhSanPhams[0].TenFile,
    //                     DuongDan:
    //                       item.ChiTietSanPham.SanPham.AnhSanPhams[0].DuongDan,
    //                     AnhChinh:
    //                       item.ChiTietSanPham.SanPham.AnhSanPhams[0].AnhChinh,
    //                     ThuTu: item.ChiTietSanPham.SanPham.AnhSanPhams[0].ThuTu,
    //                   }
    //                 : null,
    //             },

    //             // Thông tin đơn hàng liên quan
    //             ThongTinDonHang: {
    //               SoLuong: item.SoLuong,
    //               DonGia: parseFloat(item.DonGia) || 0,
    //               ThanhTien:
    //                 (parseFloat(item.DonGia) || 0) * (item.SoLuong || 0),
    //             },
    //           });
    //         });
    //       }
    //     });
    //   }
    //   return {
    //     ...orderData,
    //     DanhSachBinhLuan: danhSachBinhLuan,
    //   };
    // });

    // return ordersWithComments;
    return orders;
  },
  getOrderById: async (maDDH, maKH) => {
    const order = await DonDatHang.findOne({
      where: { MaDDH: Number(maDDH), MaKH: Number(maKH) },
      include: [
        {
          model: CT_DonDatHang,
          include: [
            {
              model: ChiTietSanPham,
              include: [
                {
                  model: require("../models/SanPham"),
                  attributes: ["MaSP", "TenSP"], // Bỏ MoTa
                  include: [
                    {
                      model: require("../models/AnhSanPham"),
                      where: { AnhChinh: true }, // Chỉ lấy ảnh chính
                      attributes: ["DuongDan", "TenFile"],
                      required: false
                    }
                  ],
                },
                { model: require("../models/Mau") },
                { model: require("../models/KichThuoc") },
              ],
            },
          ],
        },
        {
          model: TrangThaiDH,
          attributes: ["MaTTDH", "TrangThai", "Note", "ThoiGianCapNhat"],
        },
        {
          model: NhanVien,
          as: "NguoiDuyet",
        },
        {
          model: NhanVien,
          as: "NguoiGiao",
        },
        {
          model: HoaDon,
          attributes: ['SoHD', 'NgayLap'],
          required: false,
          include: [
            {
              model: PhieuTraHang,
              attributes: ['MaPhieuTra', 'NgayTra', 'LyDo', 'TrangThai'],
              required: false,
              include: [
                {
                  model: NhanVien,
                  attributes: ['MaNV', 'TenNV'],
                  required: false
                }
              ]
            }
          ]
        }
      ],
    });

    return order;
  },
  clearCart: async (maKH) => {
    const transaction = await sequelize.transaction();
    try {
      if (!maKH) {
        throw new Error("Thiếu mã khách hàng");
      }

      const donDatHang = await DonDatHang.findOne({
        where: {
          MaKH: Number(maKH),
          MaTTDH: 6,
        },
        transaction,
      });

      if (!donDatHang) {
        await transaction.rollback();
        // Nếu không có giỏ hàng coi như đã xoá (hoặc rỗng)
        return { message: "Giỏ hàng đã rỗng" };
      }

      // Xoá toàn bộ chi tiết đơn hàng
      await CT_DonDatHang.destroy({
        where: {
          MaDDH: donDatHang.MaDDH,
        },
        transaction,
      });

      // Tuỳ chọn: Có thể xoá luôn DonDatHang nếu muốn, 
      // nhưng giữ lại để tái sử dụng cũng được.
      // Ở đây chỉ xoá items.

      await transaction.commit();
      return { message: "Đã xoá toàn bộ giỏ hàng thành công" };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};

module.exports = GioHangService;
