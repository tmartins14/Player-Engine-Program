const { DataTypes } = require("sequelize");
const sequelize = require("../services/dataServices/database");

const Position = sequelize.define(
  "positions",
  {
    position_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    position_abv: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "positions",
  }
);

module.exports = Position;
