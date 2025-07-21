const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const LoaiSP = sequelize.define('LoaiSP', {
  MaLoaiSP: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  TenLoai: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  NgayTao: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  HinhMinhHoa: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = LoaiSP; 