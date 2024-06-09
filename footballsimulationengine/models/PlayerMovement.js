const { DataTypes } = require("sequelize");
const sequelize = require("../services/dataServices/database");

const PlayerMovement = sequelize.define(
  "player_movement",
  {
    frame: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    game_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    team_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    player_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    x: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    y: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    z: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    game_running: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    phase: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "player_movement",
  }
);

module.exports = PlayerMovement;
