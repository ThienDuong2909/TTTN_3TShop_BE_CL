const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const CT_DonDatHang = sequelize.define('CT_DonDatHang', {
  MaCTDDH: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  MaDDH: {
    type: DataTypes.INTEGER,
    references: { model: 'DonDatHang', key: 'MaDDH' },
  },
  MaCTSP: {
    type: DataTypes.INTEGER,
    references: { model: 'ChiTietSanPham', key: 'MaCTSP' },
  },
  SoLuong: DataTypes.INTEGER,
  DonGia: DataTypes.DECIMAL(18,2),
  MaPhieuTra: {
    type: DataTypes.INTEGER,
    references: { model: 'PhieuTraHang', key: 'MaPhieuTra' },
  },
  SoLuongTra: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

module.exports = CT_DonDatHang; 