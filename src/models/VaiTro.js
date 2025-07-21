// Các vai trò mặc định:
// 1: Admin
// 2: NhanVien
// 3: KhachHang
const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const VaiTro = sequelize.define('VaiTro', {
  MaVaiTro: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  TenVaiTro: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
});

module.exports = VaiTro; 