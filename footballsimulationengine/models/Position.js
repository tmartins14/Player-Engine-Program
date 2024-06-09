const { DataTypes } = require("sequelize");
const sequelize = require("../services/dataServices/database");

const Position = sequelize.define(
  "positions",
  {
    position_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    position_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    position_abv: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "positions",
  }
);

module.exports = Position;
