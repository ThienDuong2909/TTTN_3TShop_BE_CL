const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const TrangThaiDatHangNCC = sequelize.define('TrangThaiDatHangNCC', {
  MaTrangThai: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  TenTrangThai: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
});

module.exports = TrangThaiDatHangNCC; 