const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const NhanVien_BoPhan = sequelize.define('NhanVien_BoPhan', {
  MaNV: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'NhanVien', key: 'MaNV' },
  },
  MaBoPhan: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'BoPhan', key: 'MaBoPhan' },
  },
  NgayBatDau: {
    type: DataTypes.DATEONLY,
    primaryKey: true,
    allowNull: false,
  },
  NgayKetThuc: DataTypes.DATEONLY,
  ChucVu: DataTypes.STRING(100),
  TrangThai: {
    type: DataTypes.ENUM('DANGLAMVIEC', 'DAKETTHUC'),
    defaultValue: 'DANGLAMVIEC',
  },
  GhiChu: DataTypes.TEXT,
});

module.exports = NhanVien_BoPhan; 