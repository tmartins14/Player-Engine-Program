const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FrameTime = sequelize.define(
  "FrameTime",
  {
    frame: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    game_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    game_time: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "FrameTimes",
  }
);

module.exports = FrameTime;
