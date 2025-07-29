const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const NhanVien = sequelize.define('NhanVien', {
  MaNV: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  TenNV: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  NgaySinh: DataTypes.DATEONLY,
  
  Luong: DataTypes.DECIMAL(18,2),
  MaTK: {
    type: DataTypes.INTEGER,
    unique: true,
    references: { model: 'TaiKhoan', key: 'MaTK' },
  },
  KhuVuc: {
    type: DataTypes.STRING(65),
    allowNull: true,
  },
});

module.exports = NhanVien; 