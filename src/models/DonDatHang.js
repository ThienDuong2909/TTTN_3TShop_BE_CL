const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const DonDatHang = sequelize.define('DonDatHang', {
  MaDDH: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  MaKH: {
    type: DataTypes.INTEGER,
    references: { model: 'KhachHang', key: 'MaKH' },
  },
  MaNV_Duyet: {
    type: DataTypes.INTEGER,
    references: { model: 'NhanVien', key: 'MaNV' },
  },
  MaNV_Giao: {
    type: DataTypes.INTEGER,
    references: { model: 'NhanVien', key: 'MaNV' },
  },
  NgayTao: DataTypes.DATEONLY,
  DiaChiGiao: DataTypes.STRING(255),
  ThoiGianGiao: DataTypes.DATE,
  NguoiNhan: DataTypes.STRING(100),
  MaTTDH: {
    type: DataTypes.INTEGER,
    references: { model: 'TrangThaiDH', key: 'MaTTDH' },
  },
});

module.exports = DonDatHang; 