const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize");
const SanPham = sequelize.define("SanPham", {
  MaSP: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  TenSP: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  MaLoaiSP: {
    type: DataTypes.INTEGER,
    references: { model: "LoaiSP", key: "MaLoaiSP" },
  },
  MaNCC: {
    type: DataTypes.INTEGER,
    references: { model: "NhaCungCap", key: "MaNCC" },
  },
  GiaNhapBQ: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  MoTa: DataTypes.TEXT,
  TrangThai: {
    type: DataTypes.BOOLEAN,
  },
  NgayTao: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});
module.exports = SanPham;
