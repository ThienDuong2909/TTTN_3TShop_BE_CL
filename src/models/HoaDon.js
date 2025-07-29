const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const HoaDon = sequelize.define('HoaDon', {
  SoHD: {
    type: DataTypes.STRING(100),
    primaryKey: true,
  },
  MaDDH: {
    type: DataTypes.INTEGER,
    unique: true,
    references: { model: 'DonDatHang', key: 'MaDDH' },
  },
  NgayLap: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  MaNVLap: {
    type: DataTypes.INTEGER,
    references: { model: 'NhanVien', key: 'MaNV' },
    allowNull: true,
  },
});

module.exports = HoaDon; 