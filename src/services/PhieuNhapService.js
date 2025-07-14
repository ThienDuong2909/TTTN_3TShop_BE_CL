const PhieuNhap = require('../models/PhieuNhap');
const CT_PhieuNhap = require('../models/CT_PhieuNhap');
const ChiTietSanPham = require('../models/ChiTietSanPham');
const { v4: uuidv4 } = require('uuid');
const xlsx = require('xlsx');
const fs = require('fs');

const PhieuNhapService = {
  create: async (data) => {
    if (!data.NgayNhap || !data.MaNV || !Array.isArray(data.chiTiet) || data.chiTiet.length === 0) {
      throw new Error('Thiếu thông tin phiếu nhập hoặc chi tiết phiếu nhập');
    }
    const SoPN = uuidv4();
    const phieu = await PhieuNhap.create({
      SoPN,
      NgayNhap: data.NgayNhap,
      MaPDH: data.MaPDH,
      MaNV: data.MaNV,
    });
    for (const ct of data.chiTiet) {
      if (!ct.MaCTSP || !ct.SoLuong || !ct.DonGia) {
        throw new Error('Chi tiết phiếu nhập thiếu trường bắt buộc');
      }
      const ctsp = await ChiTietSanPham.findByPk(ct.MaCTSP);
      if (!ctsp) throw new Error(`Mã chi tiết sản phẩm không tồn tại: ${ct.MaCTSP}`);
      if (ct.SoLuong <= 0) throw new Error('Số lượng phải lớn hơn 0');
      if (ct.DonGia <= 0) throw new Error('Đơn giá phải lớn hơn 0');
      await CT_PhieuNhap.create({
        SoPN,
        MaCTSP: ct.MaCTSP,
        SoLuong: ct.SoLuong,
        DonGia: ct.DonGia,
      });
    }
    return phieu;
  },
  getAll: async () => {
    return PhieuNhap.findAll({ include: [CT_PhieuNhap] });
  },
  getById: async (id) => {
    return PhieuNhap.findByPk(id, { include: [CT_PhieuNhap] });
  },
  importExcel: async (file, MaNV) => {
    if (!file) throw new Error('Không có file được upload');
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);
    if (!rows.length) throw new Error('File Excel không có dữ liệu');
    const SoPN = uuidv4();
    const firstRow = rows[0];
    if (!firstRow.NgayNhap) {
      throw new Error('File Excel thiếu trường NgayNhap ở dòng đầu');
    }
    // Validate từng dòng
    const errors = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.MaCTSP || !row.SoLuong || !row.DonGia) {
        errors.push({ row: i + 2, error: 'Thiếu trường MaCTSP, SoLuong hoặc DonGia' });
        continue;
      }
      const ctsp = await ChiTietSanPham.findByPk(row.MaCTSP);
      if (!ctsp) {
        errors.push({ row: i + 2, error: `Mã chi tiết sản phẩm không tồn tại: ${row.MaCTSP}` });
      }
      if (row.SoLuong <= 0) {
        errors.push({ row: i + 2, error: 'Số lượng phải lớn hơn 0' });
      }
      if (row.DonGia <= 0) {
        errors.push({ row: i + 2, error: 'Đơn giá phải lớn hơn 0' });
      }
    }
    if (errors.length) {
      fs.unlinkSync(file.path);
      return { success: false, errors };
    }
    // Nếu không có lỗi, tạo phiếu nhập và chi tiết
    const phieu = await PhieuNhap.create({
      SoPN,
      NgayNhap: firstRow.NgayNhap,
      MaPDH: firstRow.MaPDH || null,
      MaNV,
    });
    for (const row of rows) {
      await CT_PhieuNhap.create({
        SoPN,
        MaCTSP: row.MaCTSP,
        SoLuong: row.SoLuong,
        DonGia: row.DonGia,
      });
    }
    fs.unlinkSync(file.path);
    return { success: true, phieu };
  },
};

module.exports = PhieuNhapService; 