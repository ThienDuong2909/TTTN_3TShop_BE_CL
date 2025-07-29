const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize");

const TiGia = sequelize.define(
  "TiGia",
  {
    MaTiGia: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    GiaTri: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    NgayApDung: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "TiGia",
    timestamps: false,
  }
);

module.exports = TiGia;
