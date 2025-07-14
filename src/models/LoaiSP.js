const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const LoaiSP = sequelize.define('LoaiSP', {
  MaLoaiSP: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  TenLoai: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
});

module.exports = LoaiSP; 