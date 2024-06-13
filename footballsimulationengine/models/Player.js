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
      allowNull: true,
    },
    pace: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    passing: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    shooting: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    defending: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    dribbling: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    physical: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    saving: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: "players",
  }
);

module.exports = Player;
