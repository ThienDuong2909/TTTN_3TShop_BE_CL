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