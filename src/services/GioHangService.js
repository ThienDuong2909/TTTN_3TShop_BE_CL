const { Op } = require("sequelize");
const DonDatHang = require("../models/DonDatHang");
const CT_DonDatHang = require("../models/CT_DonDatHang");
const ChiTietSanPham = require("../models/ChiTietSanPham");
const KhachHang = require("../models/KhachHang");
const SanPhamService = require("./SanPhamService");

const GioHangService = {
  addToCart: async (maKH, maSP, maMau, maKichThuoc, soLuongInput) => {
    const soLuong = Number(soLuongInput) || 1;

    const khachHang = await KhachHang.findOne({
      where: { MaKH: Number(maKH) },
    });
    if (!khachHang) throw new Error("Khách hàng không tồn tại");

    const chiTietSP = await ChiTietSanPham.findOne({
      where: {
        MaSP: Number(maSP),
        MaMau: Number(maMau),
        MaKichThuoc: Number(maKichThuoc),
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
    }
    donDatHang.CT_DonDatHangs = [];
    console.log("dondathang", donDatHang);

    const existingItem = donDatHang?.CT_DonDatHangs.find(
      (item) => item.MaCTSP === maCTSP
    );

    if (existingItem) {
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

  removeFromCart: async (maKH, maCTSP) => {
    // Tìm đơn hàng đang ở trạng thái CHODAT (MaTTDH = 6)
    const donDatHang = await DonDatHang.findOne({
      where: {
        MaKH: Number(maKH),
        MaTTDH: 6,
      },
      include: [{ model: CT_DonDatHang }],
    });

    if (!donDatHang) {
      throw new Error("Không tìm thấy đơn hàng giỏ hàng");
    }

    // Kiểm tra xem sản phẩm có trong giỏ hay không
    const item = donDatHang.CT_DonDatHangs.find(
      (ct) => ct.MaCTSP === Number(maCTSP)
    );

    if (!item) {
      throw new Error("Sản phẩm không tồn tại trong giỏ hàng");
    }

    // Xoá sản phẩm khỏi chi tiết đơn hàng
    await CT_DonDatHang.destroy({
      where: {
        MaDDH: donDatHang.MaDDH,
        MaCTSP: Number(maCTSP),
      },
    });

    // Trả về giỏ hàng cập nhật
    const updatedCart = await DonDatHang.findOne({
      where: { MaDDH: donDatHang.MaDDH },
      include: [{ model: CT_DonDatHang }],
    });

    return updatedCart;
  },
  placeOrder: async (maKH, dsSanPham) => {
    const donDatHang = await DonDatHang.findOne({
      where: { MaKH: Number(maKH), MaTTDH: 6 },
      include: [{ model: CT_DonDatHang }],
    });

    if (!donDatHang) throw new Error("Không tìm thấy đơn hàng đang chờ");

    for (const sp of dsSanPham) {
      const { maCTDDH, soLuong } = sp;

      const ctDon = donDatHang.CT_DonDatHangs.find(
        (item) => item.MaCTDDH === maCTDDH
      );
      if (!ctDon)
        throw new Error(`Không tìm thấy chi tiết đơn hàng ${maCTDDH}`);

      const chiTietSP = await ChiTietSanPham.findOne({
        where: { MaCTSP: ctDon.MaCTSP },
      });
      if (!chiTietSP) throw new Error("Chi tiết sản phẩm không tồn tại");

      if (soLuong > chiTietSP.SoLuongTon) {
        throw new Error(`Sản phẩm ${ctDon.MaCTSP} không đủ tồn kho`);
      }

      // Cập nhật số lượng mới cho CT_DonDatHang
      await CT_DonDatHang.update(
        { SoLuong: soLuong },
        { where: { MaCTDDH: maCTDDH } }
      );

      // Trừ tồn kho
      await ChiTietSanPham.update(
        { SoLuongTon: chiTietSP.SoLuongTon - soLuong },
        { where: { MaCTSP: ctDon.MaCTSP } }
      );
    }

    // Đổi trạng thái đơn hàng → Chờ xác nhận (MaTTDH = 1)
    await DonDatHang.update(
      { MaTTDH: 1 },
      { where: { MaDDH: donDatHang.MaDDH } }
    );

    // Trả lại đơn đã cập nhật
    const updatedOrder = await DonDatHang.findOne({
      where: { MaDDH: donDatHang.MaDDH },
      include: [{ model: CT_DonDatHang }],
    });

    return updatedOrder;
  },
};

module.exports = GioHangService;
