const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const PhieuNhap = sequelize.define('PhieuNhap', {
  SoPN: {
    type: DataTypes.STRING(100),
    primaryKey: true,
  },
  NgayNhap: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  MaPDH: {
    type: DataTypes.STRING(100),
    references: { model: 'PhieuDatHangNCC', key: 'MaPDH' },
  },
  MaNV: {
    type: DataTypes.INTEGER,
    references: { model: 'NhanVien', key: 'MaNV' },
  },
});

module.exports = PhieuNhap; 