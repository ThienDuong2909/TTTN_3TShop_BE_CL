const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const PhanQuyen = sequelize.define('PhanQuyen', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  Ten: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  TenHienThi: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  NgayTao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'PhanQuyen',
  timestamps: false,
});

module.exports = PhanQuyen; 