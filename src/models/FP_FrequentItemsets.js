const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize");

const FP_FrequentItemsets = sequelize.define(
  "FP_FrequentItemsets",
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
    itemset: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Frequent itemset (MaSP) - JSON array",
      get() {
        const rawValue = this.getDataValue("itemset");
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue("itemset", JSON.stringify(value));
      },
    },
    support_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    support_ratio: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "FP_FrequentItemsets",
    timestamps: false,
  }
);

module.exports = FP_FrequentItemsets;
