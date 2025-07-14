const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const SanPham = sequelize.define('SanPham', {
  MaSP: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  TenSP: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  MaLoaiSP: {
    type: DataTypes.INTEGER,
    references: { model: 'LoaiSP', key: 'MaLoaiSP' },
  },
  MaNCC: {
    type: DataTypes.INTEGER,
    references: { model: 'NhaCungCap', key: 'MaNCC' },
  },
  MoTa: DataTypes.TEXT,
});

module.exports = SanPham; 