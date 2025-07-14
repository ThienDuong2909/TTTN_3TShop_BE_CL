const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const BinhLuan = sequelize.define('BinhLuan', {
  MaBL: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  MaKH: {
    type: DataTypes.INTEGER,
    references: { model: 'KhachHang', key: 'MaKH' },
  },
  MaCTDonDatHang: {
    type: DataTypes.INTEGER,
    references: { model: 'CT_DonDatHang', key: 'MaCTDDH' },
  },
  MoTa: DataTypes.TEXT,
  SoSao: {
    type: DataTypes.INTEGER,
    validate: { min: 0, max: 5 },
  },
  NgayBinhLuan: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = BinhLuan; 