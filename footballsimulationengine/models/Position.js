const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Position = sequelize.define(
  "Position",
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
  },
  {
    timestamps: false,
    tableName: "Positions",
  }
);

module.exports = Position;
