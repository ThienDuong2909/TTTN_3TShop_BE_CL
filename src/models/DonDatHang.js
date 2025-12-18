const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize");

const DonDatHang = sequelize.define("DonDatHang", {
  MaDDH: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  MaKH: {
    type: DataTypes.INTEGER,
    references: { model: "KhachHang", key: "MaKH" },
  },
  MaNV_Duyet: {
    type: DataTypes.INTEGER,
    references: { model: "NhanVien", key: "MaNV" },
  },
  MaNV_Giao: {
    type: DataTypes.INTEGER,
    references: { model: "NhanVien", key: "MaNV" },
  },
  NgayTao: DataTypes.DATE,
  DiaChiGiao: DataTypes.STRING(255),
  ThoiGianGiao: DataTypes.DATE,
  NguoiNhan: DataTypes.STRING(100),
  SDT: DataTypes.STRING(10),
  MaTTDH: {
    type: DataTypes.INTEGER,
    references: { model: "TrangThaiDH", key: "MaTTDH" },
  },
  SDT: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  HinhMinhChung: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  NgayCapNhat: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  payosOrderCode: {
    type: DataTypes.STRING,
    allowNull: true,
  }
});

module.exports = DonDatHang;
