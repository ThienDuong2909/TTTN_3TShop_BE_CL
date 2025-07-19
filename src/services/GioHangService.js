const { Op } = require("sequelize");
const DonDatHang = require("../models/DonDatHang");
const CT_DonDatHang = require("../models/CT_DonDatHang");
const ChiTietSanPham = require("../models/ChiTietSanPham");
const KhachHang = require("../models/KhachHang");
const Mau = require("../models/Mau");
const KichThuoc = require("../models/KichThuoc");
const SanPhamService = require("./SanPhamService");
const MauService = require("./MauService");

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

    const donGia = await SanPhamService.getCurrentPrice(maSP);

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
      });
      donDatHang.CT_DonDatHangs = [];
    }

    console.log("dondathang", donDatHang);

    const existingItem = donDatHang?.CT_DonDatHangs.find(
      (item) => item.MaCTSP === maCTSP
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

  removeFromCart: async (maKH, maSP, maHex, tenKichThuoc) => {
    // 1. Tìm khách hàng và mã sản phẩm
    if (!maKH || !maSP || !maHex || !tenKichThuoc) {
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

    // 5. Tìm chi tiết đơn hàng có MaCTSP
    const item = donDatHang.CT_DonDatHangs.find(
      (ct) => ct.MaCTSP === chiTietSP.MaCTSP
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

  // placeOrder: async (maKH, dsSanPham, diaChiGiao, nguoiNhan) => {
  //   const donDatHang = await DonDatHang.findOne({
  //     where: { MaKH: Number(maKH), MaTTDH: 6 },
  //     include: [{ model: CT_DonDatHang }],
  //   });

  //   if (!donDatHang) throw new Error("Không tìm thấy đơn hàng đang chờ");

  //   for (const sp of dsSanPham) {
  //     const { maCTDDH, soLuong } = sp;

  //     const ctDon = donDatHang.CT_DonDatHangs.find(
  //       (item) => item.MaCTDDH === maCTDDH
  //     );
  //     if (!ctDon)
  //       throw new Error(`Không tìm thấy chi tiết đơn hàng ${maCTDDH}`);

  //     const chiTietSP = await ChiTietSanPham.findOne({
  //       where: { MaCTSP: ctDon.MaCTSP },
  //     });
  //     if (!chiTietSP) throw new Error("Chi tiết sản phẩm không tồn tại");

  //     if (soLuong > chiTietSP.SoLuongTon) {
  //       throw new Error(`Sản phẩm ${ctDon.MaCTSP} không đủ tồn kho`);
  //     }

  //     // Cập nhật số lượng mới cho CT_DonDatHang
  //     await CT_DonDatHang.update(
  //       { SoLuong: soLuong },
  //       { where: { MaCTDDH: maCTDDH } }
  //     );

  //     // Trừ tồn kho
  //     await ChiTietSanPham.update(
  //       { SoLuongTon: chiTietSP.SoLuongTon - soLuong },
  //       { where: { MaCTSP: ctDon.MaCTSP } }
  //     );
  //   }

  //   // Đổi trạng thái đơn hàng → Chờ xác nhận (MaTTDH = 1)
  //   await DonDatHang.update(
  //     { MaTTDH: 1 },
  //     { where: { MaDDH: donDatHang.MaDDH } }
  //   );

  //   // Trả lại đơn đã cập nhật
  //   const updatedOrder = await DonDatHang.findOne({
  //     where: { MaDDH: donDatHang.MaDDH },
  //     include: [{ model: CT_DonDatHang }],
  //   });

  //   return updatedOrder;
  // },
  placeOrder: async (maKH, dsSanPham, diaChiGiao, nguoiNhan) => {
    const donDatHang = await DonDatHang.findOne({
      where: { MaKH: Number(maKH), MaTTDH: 6 },
      include: [{ model: CT_DonDatHang }],
    });

    if (!donDatHang) throw new Error("Không tìm thấy đơn hàng đang chờ");

    for (const sp of dsSanPham) {
      const { maCTSP, soLuong } = sp;

      // const mau = await Mau.findOne({ where: { MaHex } });
      // const kichThuoc = await KichThuoc.findOne({ where: { TenKichThuoc } });

      // if (!mau || !kichThuoc) {
      //   throw new Error(`Không tìm thấy màu hoặc kích thước phù hợp`);
      // }

      const chiTietSP = await ChiTietSanPham.findOne({
        where: {
          MaCTSP: Number(maCTSP),
          // MaMau: mau.MaMau,
          // MaKichThuoc: kichThuoc.MaKichThuoc,
        },
      });

      if (!chiTietSP) {
        throw new Error("Không tìm thấy chi tiết sản phẩm phù hợp");
      }

      const ctDon = donDatHang.CT_DonDatHangs.find(
        (item) => item.MaCTSP === chiTietSP.MaCTSP
      );

      if (!ctDon) {
        throw new Error(`Sản phẩm ${maSP} chưa có trong đơn hàng`);
      }

      if (soLuong > chiTietSP.SoLuongTon) {
        throw new Error(
          `Sản phẩm ${maSP} - ${MaHex} - ${TenKichThuoc} không đủ tồn kho`
        );
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

    // Cập nhật trạng thái đơn hàng
    await DonDatHang.update(
      {
        MaTTDH: 1, // CHỜ XÁC NHẬN
        DiaChiGiao: diaChiGiao,
        NguoiNhan: nguoiNhan,
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
};

module.exports = GioHangService;
