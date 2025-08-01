const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const PhieuDatHangNCC = sequelize.define('PhieuDatHangNCC', {
  MaPDH: {
    type: DataTypes.STRING(100),
    primaryKey: true,
  },
  NgayDat: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  NgayKienNghiGiao: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Ngày kiến nghị giao hàng từ nhà cung cấp'
  },
  MaNV: {
    type: DataTypes.INTEGER,
    references: { model: 'NhanVien', key: 'MaNV' },
  },
  MaNCC: {
    type: DataTypes.INTEGER,
    references: { model: 'NhaCungCap', key: 'MaNCC' },
  },
  MaTrangThai: {
    type: DataTypes.INTEGER,
    references: { model: 'TrangThaiDatHangNCC', key: 'MaTrangThai' },
  },
});

module.exports = PhieuDatHangNCC; 