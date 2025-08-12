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
  NgaySinh: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  GioiTinh: {
    type: DataTypes.TINYINT,
    allowNull: true,
  },
  AnhDaiDien: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
});

module.exports = KhachHang;
