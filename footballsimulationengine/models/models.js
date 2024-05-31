const database = require("../services/database");

const MatchCoordinates = require("./MatchCoordinates");

module.exports = {
  database,
  models: { MatchCoordinates },
};
