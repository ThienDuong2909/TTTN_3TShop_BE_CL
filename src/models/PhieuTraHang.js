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
    allowNull: true, // Cho phép null theo schema database
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
  TrangThai: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1 // Mặc định là 1 (Chờ duyệt)
  }
});

module.exports = PhieuTraHang;
