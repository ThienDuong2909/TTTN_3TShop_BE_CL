const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize");

const FP_ModelMetadata = sequelize.define(
  "FP_ModelMetadata",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    N: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Số lượng transactions",
    },
    min_sup: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    min_conf: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    total_rules: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_freq_items: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "FP_ModelMetadata",
    timestamps: false,
  }
);

module.exports = FP_ModelMetadata;
