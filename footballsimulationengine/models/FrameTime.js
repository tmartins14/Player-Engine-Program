const { DataTypes } = require("sequelize");
const sequelize = require("../services/dataServices/database");

const FrameTime = sequelize.define(
  "frame_times",
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
    tableName: "frame_times",
  }
);

module.exports = FrameTime;
