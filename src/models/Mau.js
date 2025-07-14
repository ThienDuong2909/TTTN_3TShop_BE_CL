const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Mau = sequelize.define('Mau', {
  MaMau: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  TenMau: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  MaHex: DataTypes.STRING(7),
});

module.exports = Mau; 