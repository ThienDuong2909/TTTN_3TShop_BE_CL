const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize");

const Mau = sequelize.define("Mau", {
  MaMau: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  TenMau: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  MaHex: DataTypes.STRING(7),
  // NgayTao: {
  //   type: DataTypes.DATE,
  //   allowNull: true,
  // },
  // TrangThai: {
  //   type: DataTypes.BOOLEAN,
  //   allowNull: true,
  // },
});

module.exports = Mau;
