const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize");

const FP_Rules = sequelize.define(
  "FP_Rules",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    model_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    antecedent: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Tập A (MaSP) - JSON array",
      get() {
        const rawValue = this.getDataValue("antecedent");
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue("antecedent", JSON.stringify(value));
      },
    },
    consequent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Item b (MaSP)",
    },
    itemset: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Tập X = A ∪ {b} - JSON array",
      get() {
        const rawValue = this.getDataValue("itemset");
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue("itemset", JSON.stringify(value));
      },
    },
    support: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    confidence: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    lift: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "FP_Rules",
    timestamps: false,
  }
);

module.exports = FP_Rules;
