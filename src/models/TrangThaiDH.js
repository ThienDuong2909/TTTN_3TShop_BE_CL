const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const TrangThaiDH = sequelize.define('TrangThaiDH', {
  MaTTDH: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  Note: DataTypes.TEXT,
  ThoiGianCapNhat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  TrangThai: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
});

module.exports = TrangThaiDH; 