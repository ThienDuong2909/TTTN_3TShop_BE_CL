const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const PhieuTraHang = sequelize.define('PhieuTraHang', {
  MaPhieuTra: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  SoHD: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
    references: { model: 'HoaDon', key: 'SoHD' },
  },
  NVLap: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'NhanVien', key: 'MaNV' },
  },
  NgayTra: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  LyDo: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

module.exports = PhieuTraHang;
