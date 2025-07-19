const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const KichThuoc = sequelize.define('KichThuoc', {
  MaKichThuoc: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  TenKichThuoc: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  NgayTao: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
});

module.exports = KichThuoc; 