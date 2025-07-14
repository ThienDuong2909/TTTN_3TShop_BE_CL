const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const CT_PhieuNhap = sequelize.define('CT_PhieuNhap', {
  SoPN: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    references: { model: 'PhieuNhap', key: 'SoPN' },
  },
  MaCTSP: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'ChiTietSanPham', key: 'MaCTSP' },
  },
  SoLuong: DataTypes.INTEGER,
  DonGia: DataTypes.DECIMAL(18,2),
});

module.exports = CT_PhieuNhap; 