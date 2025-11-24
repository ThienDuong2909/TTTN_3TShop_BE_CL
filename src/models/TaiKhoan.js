const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const TaiKhoan = sequelize.define('TaiKhoan', {
  MaTK: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  Email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  Password: {
    type: DataTypes.STRING(255),
    allowNull: true, // Allow null for Google login
  },
  AuthType: {
    type: DataTypes.STRING(20),
    defaultValue: 'local', // 'local' or 'google'
  },
  MaVaiTro: {
    type: DataTypes.INTEGER,
    references: { model: 'VaiTro', key: 'MaVaiTro' },
  },
});

module.exports = TaiKhoan;