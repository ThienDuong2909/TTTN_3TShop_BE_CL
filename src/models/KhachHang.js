const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize");

const KhachHang = sequelize.define("KhachHang", {
  MaKH: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  TenKH: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  DiaChi: DataTypes.STRING(255),
  SDT: DataTypes.STRING(20),
  CCCD: DataTypes.STRING(20),
  MaTK: {
    type: DataTypes.INTEGER,
    unique: true,
    references: { model: "TaiKhoan", key: "MaTK" },
  },
});

module.exports = KhachHang;
