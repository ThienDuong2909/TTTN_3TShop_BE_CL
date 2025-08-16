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
  DiaChi: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  Luong: DataTypes.DECIMAL(18,2),
  MaTK: {
    type: DataTypes.INTEGER,
    unique: true,
    references: { model: 'TaiKhoan', key: 'MaTK' },
  }
});

module.exports = NhanVien; 