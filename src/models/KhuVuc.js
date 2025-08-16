const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const KhuVuc = sequelize.define('KhuVuc', {
  MaKhuVuc: {
    type: DataTypes.STRING(10),
    primaryKey: true,
    allowNull: false
  },
  TenKhuVuc: {
    type: DataTypes.STRING(65),
    allowNull: false,
    charset: 'utf8mb3'
  }
}, {
  tableName: 'KhuVuc',
  timestamps: false
});

module.exports = KhuVuc;
