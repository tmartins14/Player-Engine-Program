const database = require("../services/dataServices/database");

const BallMovement = require("./BallMovement");
const Formation = require("./Formation");
const FrameTime = require("./FrameTime");
const MatchEvent = require("./MatchEvent");
const Player = require("./Player");
const PlayerMovement = require("./PlayerMovement");
const Position = require("./Position");
// const Team = require("./Team");

module.exports = {
  database,
  models: {
    BallMovement,
    Formation,
    FrameTime,
    MatchEvent,
    Player,
    PlayerMovement,
    Position,
    // Team,
  },
};
