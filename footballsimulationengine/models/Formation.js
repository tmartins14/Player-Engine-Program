// Stores data on various formations and the X,Y coordinates of each player
const { DataTypes } = require("sequelize");
const sequelize = require("../services/dataServices/database");
const Position = require("./position");

const Formation = sequelize.define(
  "formations",
  {
    formation_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    formation_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Position,
        key: "position_abv",
      },
    },
    x: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    y: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "formations",
  }
);

module.exports = Formation;
