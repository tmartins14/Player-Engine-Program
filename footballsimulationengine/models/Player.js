const { DataTypes } = require("sequelize");
const sequelize = require("../services/dataServices/database");
const Position = require("./position");

const Player = sequelize.define(
  "players",
  {
    player_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
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
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    passing: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    shooting: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tackling: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    saving: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    agility: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    strength: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    penalty_taking: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    jumping: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "players",
  }
);

module.exports = Player;
