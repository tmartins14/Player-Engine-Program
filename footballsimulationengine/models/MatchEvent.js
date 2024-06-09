const { DataTypes } = require("sequelize");
const sequelize = require("../services/dataServices/database");

const MatchEvent = sequelize.define(
  "match_events",
  {
    frame: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    game_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    event_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    player_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    related_player_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    x: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    y: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: "match_events",
  }
);

module.exports = MatchEvent;
