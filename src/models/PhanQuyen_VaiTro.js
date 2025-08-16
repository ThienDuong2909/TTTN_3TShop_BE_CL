const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const PhanQuyen_VaiTro = sequelize.define('PhanQuyen_VaiTro', {
  VaiTroId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'VaiTro', key: 'MaVaiTro' },
  },
  PhanQuyenId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'PhanQuyen', key: 'id' },
  },
}, {
  tableName: 'PhanQuyen_VaiTro',
  timestamps: false,
});

module.exports = PhanQuyen_VaiTro; 