const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const CT_DotGiamGia = sequelize.define('CT_DotGiamGia', {
  MaCTDGG: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  MaDot: {
    type: DataTypes.INTEGER,
    references: { model: 'DotGiamGia', key: 'MaDot' },
  },
  MaSP: {
    type: DataTypes.INTEGER,
    references: { model: 'SanPham', key: 'MaSP' },
  },
  PhanTramGiam: DataTypes.DECIMAL(5,2),
});

module.exports = CT_DotGiamGia; 