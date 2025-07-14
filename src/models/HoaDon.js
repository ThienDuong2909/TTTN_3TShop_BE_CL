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
});

module.exports = HoaDon; 