const { DataTypes } = require("sequelize");
const sequelize = require("../services/dataServices/database");

const BallMovement = sequelize.define(
  "ball_movement",
  {
    frame_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    game_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    x_ball: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    y_ball: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    z_ball: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    speed_ball: {
      type: DataTypes.FLOAT,
      allowNull: true, // Can be null
    },
    ball_owning_team: {
      type: DataTypes.STRING(1),
      allowNull: false,
    },
    ball_status: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    ball_contact_info: {
      type: DataTypes.ENUM,
      values: ["SetHome", "SetAway", "Whistle"],
      allowNull: true, // Can be null
    },
  },
  {
    timestamps: false,
    tableName: "ball_movement",
  }
);

module.exports = BallMovement;
