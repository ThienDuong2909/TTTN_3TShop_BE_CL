const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const NhanVien_KhuVuc = sequelize.define('NhanVien_KhuVuc', {
  MaNVKV: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  MaKhuVuc: {
    type: DataTypes.STRING(10),
    allowNull: false,
    references: {
      model: 'KhuVuc',
      key: 'MaKhuVuc'
    }
  },
  MaNV: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'NhanVien',
      key: 'MaNV'
    }
  },
  NgayTao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  NgayBatDau: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'NhanVien_KhuVuc',
  timestamps: false
});

module.exports = NhanVien_KhuVuc;
