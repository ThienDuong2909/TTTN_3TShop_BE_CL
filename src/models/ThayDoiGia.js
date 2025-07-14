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
  NgayThayDoi: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    primaryKey: true,
  },
  Gia: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
  },
  NgayApDung: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
}, {
  tableName: 'ThayDoiGia',
  timestamps: false,
});

module.exports = ThayDoiGia;
