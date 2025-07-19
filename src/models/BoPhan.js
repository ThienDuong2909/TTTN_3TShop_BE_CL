const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const BoPhan = sequelize.define('BoPhan', {
  MaBoPhan: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  TenBoPhan: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  NgayTao: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  TrangThai: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
});

module.exports = BoPhan; 