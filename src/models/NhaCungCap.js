const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const NhaCungCap = sequelize.define('NhaCungCap', {
  MaNCC: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  TenNCC: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  DiaChi: DataTypes.STRING(255),
  SDT: DataTypes.STRING(20),
  Email: DataTypes.STRING(100),
});

module.exports = NhaCungCap; 