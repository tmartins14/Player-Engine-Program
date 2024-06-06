// Stores data on various formations and the X,Y coordinates of each player
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Position = require("./position");

const Formation = sequelize.define(
  "Formation",
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
    position_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Position,
        key: "position_id",
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
    tableName: "Formations",
  }
);

module.exports = Formation;
