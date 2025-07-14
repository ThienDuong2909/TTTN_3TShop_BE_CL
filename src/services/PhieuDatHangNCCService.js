const PhieuDatHangNCC = require('../models/PhieuDatHangNCC');
const CT_PhieuDatHangNCC = require('../models/CT_PhieuDatHangNCC');
const { v4: uuidv4 } = require('uuid');

const PhieuDatHangNCCService = {
  create: async (data) => {
    // data: { NgayDat, MaNV, MaNCC, MaTrangThai, chiTiet: [{ MaCTSP, SoLuong, DonGia }] }
    if (!data.NgayDat || !data.MaNV || !data.MaNCC || !Array.isArray(data.chiTiet) || data.chiTiet.length === 0) {
      throw new Error('Thiếu thông tin phiếu đặt hàng hoặc chi tiết phiếu');
    }
    const MaPDH = uuidv4();
    const phieu = await PhieuDatHangNCC.create({
      MaPDH,
      NgayDat: data.NgayDat,
      MaNV: data.MaNV,
      MaNCC: data.MaNCC,
      MaTrangThai: data.MaTrangThai,
    });
    for (const ct of data.chiTiet) {
      if (!ct.MaCTSP || !ct.SoLuong || !ct.DonGia) {
        throw new Error('Chi tiết phiếu đặt hàng thiếu trường bắt buộc');
      }
      if (ct.SoLuong <= 0) throw new Error('Số lượng phải lớn hơn 0');
      if (ct.DonGia <= 0) throw new Error('Đơn giá phải lớn hơn 0');
      await CT_PhieuDatHangNCC.create({
        MaPDH,
        MaCTSP: ct.MaCTSP,
        SoLuong: ct.SoLuong,
        DonGia: ct.DonGia,
      });
    }
    return phieu;
  },
  getAll: async () => {
    return PhieuDatHangNCC.findAll({ include: [CT_PhieuDatHangNCC] });
  },
  getById: async (id) => {
    return PhieuDatHangNCC.findByPk(id, { include: [CT_PhieuDatHangNCC] });
  },
};

module.exports = PhieuDatHangNCCService; 