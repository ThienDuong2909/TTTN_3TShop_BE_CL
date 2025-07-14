const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const CT_PhieuDatHangNCC = sequelize.define('CT_PhieuDatHangNCC', {
  MaPDH: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    references: { model: 'PhieuDatHangNCC', key: 'MaPDH' },
  },
  MaCTSP: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'ChiTietSanPham', key: 'MaCTSP' },
  },
  SoLuong: DataTypes.INTEGER,
  DonGia: DataTypes.DECIMAL(18,2),
});

module.exports = CT_PhieuDatHangNCC; 