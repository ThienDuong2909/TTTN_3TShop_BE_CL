const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const PhieuChi = sequelize.define('PhieuChi', {
  MaPhieuChi: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  NgayChi: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  SoTien: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  MaPhieuTra: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'PhieuTraHang', key: 'MaPhieuTra' },
  },
  MaNVLap: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'NhanVien', key: 'MaNV' },
  },
});

module.exports = PhieuChi;
