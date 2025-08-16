const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const ThayDoiGia = sequelize.define('ThayDoiGia', {
  MaSP: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'SanPham',
      key: 'MaSP',
    },
  },
  Gia: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
  },
  NgayThayDoi: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  NgayApDung: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    primaryKey: true,
  },
}, {
  tableName: 'ThayDoiGia',
  timestamps: false,
});

module.exports = ThayDoiGia;
