const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const DotGiamGia = sequelize.define('DotGiamGia', {
  MaDot: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  NgayBatDau: DataTypes.DATEONLY,
  NgayKetThuc: DataTypes.DATEONLY,
  MoTa: DataTypes.TEXT,
});

module.exports = DotGiamGia; 