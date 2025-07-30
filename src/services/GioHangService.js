const { Op } = require("sequelize");
const DonDatHang = require("../models/DonDatHang");
const CT_DonDatHang = require("../models/CT_DonDatHang");
const ChiTietSanPham = require("../models/ChiTietSanPham");
const KhachHang = require("../models/KhachHang");
const Mau = require("../models/Mau");
const TrangThaiDH = require("../models/TrangThaiDH");
const KichThuoc = require("../models/KichThuoc");
const SanPhamService = require("./SanPhamService");
const NhanVien = require("../models/NhanVien");
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
      donDatHang = await DonDatHang.create({
        MaKH: Number(maKH),
        NgayTao: new Date(),
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
  placeOrder: async (
    maKH,
    dsSanPham,
    diaChiGiao,
    nguoiNhan,
    SDT,
    thoiGianGiao
  ) => {
    const donDatHang = await DonDatHang.findOne({
      where: { MaKH: Number(maKH), MaTTDH: 6 },
      include: [{ model: CT_DonDatHang }],
    });

    if (!donDatHang) throw new Error("Không tìm thấy đơn hàng đang chờ");

    for (const sp of dsSanPham) {
      const { maCTSP, soLuong } = sp;

      const chiTietSP = await ChiTietSanPham.findOne({
        where: {
          MaCTSP: Number(maCTSP),
        },
      });

      if (!chiTietSP) {
        throw new Error("Không tìm thấy chi tiết sản phẩm phù hợp");
      }

      const ctDon = donDatHang.CT_DonDatHangs.find(
        (item) => item.MaCTSP === chiTietSP.MaCTSP
      );

      if (!ctDon) {
        throw new Error(`Sản phẩm ${maCTSP} chưa có trong đơn hàng`);
      }

      if (soLuong > chiTietSP.SoLuongTon) {
        throw new Error(`Sản phẩm ${maCTSP} không đủ tồn kho`);
      }

      // Cập nhật lại số lượng đặt
      await CT_DonDatHang.update(
        { SoLuong: soLuong },
        { where: { MaCTDDH: ctDon.MaCTDDH } }
      );

      // Trừ tồn kho
      await ChiTietSanPham.update(
        { SoLuongTon: chiTietSP.SoLuongTon - soLuong },
        { where: { MaCTSP: chiTietSP.MaCTSP } }
      );
    }

    // Cập nhật trạng thái đơn hàng và thêm SDT, ThoiGianGiao
    await DonDatHang.update(
      {
        MaTTDH: 1, // CHỜ XÁC NHẬN
        DiaChiGiao: diaChiGiao,
        NguoiNhan: nguoiNhan,
        SDT: SDT,
        ThoiGianGiao: thoiGianGiao,
      },
      { where: { MaDDH: donDatHang.MaDDH } }
    );

    // Trả về đơn hàng đã cập nhật
    const updatedOrder = await DonDatHang.findOne({
      where: { MaDDH: donDatHang.MaDDH },
      include: [{ model: CT_DonDatHang }],
    });

    return updatedOrder;
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
              include: ["SanPham", "Mau", "KichThuoc"],
            },
          ],
        },
      ],
    });

    if (!donDatHang) {
      return { items: [], MaDDH: null };
    }

    const cartItems = donDatHang.CT_DonDatHangs.map((ct) => ({
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
    }));

    return {
      MaDDH: donDatHang.MaDDH,
      items: cartItems,
    };
  },
  clearCart: async (maKH) => {
    const donDatHang = await DonDatHang.findOne({
      where: { MaKH: Number(maKH), MaTTDH: 6 },
      include: [{ model: CT_DonDatHang }],
    });

    if (!donDatHang) throw new Error("Không tìm thấy giỏ hàng của khách hàng");

    // Xoá tất cả CT_DonDatHang thuộc đơn đó
    await CT_DonDatHang.destroy({
      where: { MaDDH: donDatHang.MaDDH },
    });

    // Trả lại đơn hàng rỗng
    return {
      MaDDH: donDatHang.MaDDH,
      items: [],
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
                  include: [
                    { model: require("../models/AnhSanPham") }, // Thêm ở đây
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
      ],
      order: [["NgayTao", "DESC"]],
    });

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
                  include: [{ model: require("../models/AnhSanPham") }],
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
      ],
    });

    return order;
  },
};

module.exports = GioHangService;
