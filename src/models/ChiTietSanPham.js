const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const ChiTietSanPham = sequelize.define('ChiTietSanPham', {
  MaCTSP: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  MaSP: {
    type: DataTypes.INTEGER,
    references: { model: 'SanPham', key: 'MaSP' },
  },
  MaKichThuoc: {
    type: DataTypes.INTEGER,
    references: { model: 'KichThuoc', key: 'MaKichThuoc' },
  },
  MaMau: {
    type: DataTypes.INTEGER,
    references: { model: 'Mau', key: 'MaMau' },
  },
  SoLuongTon: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['MaSP', 'MaKichThuoc', 'MaMau']
    }
  ]
});

module.exports = ChiTietSanPham; 