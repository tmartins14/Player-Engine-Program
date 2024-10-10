// Engine Script
// -------------
// This script initializes the game, creates teams, assigns roles, and manages the match simulation.

const fs = require("fs"); // Import the 'fs' module to read the pitch.json file
const Match = require("./components/Match");
const Team = require("./components/Team");
const Player = require("./components/Player");
const Field = require("./components/Field");

//------------------------
//    Functions
//------------------------

/**
 * Creates a team with players assigned to positions based on the formation.
 * @param {String} name - The name of the team.
 * @param {String} formation - The team's formation (e.g., '4-4-2', '4-3-3').
 * @param {String} teamSide - 'home' or 'away'
 * @returns {Team} team - The created team with players.
 */
const createTeam = async (name, formation, teamSide) => {
  const team = new Team(name, formation, teamSide);

  // Get formation positions from the team
  const formationPositions = team.getFormationPositions();

  // Loop through formation positions and create players
  Object.keys(formationPositions).forEach((positionKey, index) => {
    const player = new Player({
      name: `${name} Player ${index + 1}`,
      teamId: team.name,
      position: positionKey,
      stats: {
        rating: 75,
        pace: 70,
        shooting: 60,
        dribbling: 65,
        defending: 70,
        passing: 75,
        physical: 70,
        heading: 65, // Added heading stat
        saving: positionKey === "GK" ? 80 : 50,
      },
      fitness: 100,
      injured: false,
    });
    team.addPlayer(player); // Add player to team
  });

  return team; // Return the created team
};

/**
 * Assigns roles to players in a team based on their stats and positions.
 * @param {Team} team - The team to assign roles to.
 */
function assignRoles(team) {
  // Assign captain: the player with the highest rating or first player
  const captain = team.players.reduce((bestPlayer, player) => {
    return player.stats.rating > bestPlayer.stats.rating ? player : bestPlayer;
  }, team.players[0]);
  captain.setRoles({ captain: true });

  // Assign vice-captain: the player with the next highest rating
  const viceCaptain = team.players
    .filter((player) => player !== captain)
    .reduce((bestPlayer, player) => {
      return player.stats.rating > bestPlayer.stats.rating
        ? player
        : bestPlayer;
    }, team.players[0]);
  viceCaptain.setRoles({ viceCaptain: true });

  // Assign penalty taker: player with the highest shooting stat
  let penaltyTaker = team.players.reduce((bestPlayer, player) => {
    return player.stats.shooting > bestPlayer.stats.shooting
      ? player
      : bestPlayer;
  }, team.players[0]);
  penaltyTaker.setRoles({ penaltyTaker: true });

  // Assign free-kick taker: player with the highest passing stat
  let freeKickTaker = team.players.reduce((bestPlayer, player) => {
    return player.stats.passing > bestPlayer.stats.passing
      ? player
      : bestPlayer;
  }, team.players[0]);
  freeKickTaker.setRoles({ freeKickTaker: true });

  // Assign left corner taker
  let leftCornerTaker = team.players.find((player) => player.position === "LM");
  if (!leftCornerTaker) {
    leftCornerTaker = team.players.find((player) =>
      ["CM", "CAM", "CDM"].includes(player.position)
    );
  }
  if (leftCornerTaker) {
    leftCornerTaker.setRoles({ leftCornerTaker: true });
  }

  // Assign right corner taker
  let rightCornerTaker = team.players.find(
    (player) => player.position === "RM"
  );
  if (!rightCornerTaker) {
    rightCornerTaker = team.players.find((player) =>
      ["CM", "CAM", "CDM"].includes(player.position)
    );
  }
  if (rightCornerTaker) {
    rightCornerTaker.setRoles({ rightCornerTaker: true });
  }
}

/**
 * Initializes the game by creating home and away teams and setting up the pitch details.
 * @param {Object} team1 - First team object.
 * @param {Object} team2 - Second team object.
 * @returns {Object} match - The initialized match object.
 */
async function initiateGame(team1, team2) {
  // Read the pitch details from 'pitch.json'
  let pitchDetails;
  try {
    const pitchData = fs.readFileSync("./data/pitch.json", "utf8");
    pitchDetails = JSON.parse(pitchData);
  } catch (error) {
    console.error("Error reading pitch.json:", error);
    // Use default pitch dimensions if there's an error
    pitchDetails = {
      pitchWidth: 68, // Standard width in meters
      pitchHeight: 105, // Standard length in meters
    };
  }

  // Create the home and away teams using the Team constructor
  const homeTeam = new Team(team1.name, team1.formation, "home");
  const awayTeam = new Team(team2.name, team2.formation, "away");

  // Initialize players for the home team
  team1.players.forEach((playerData) => {
    const player = new Player({
      name: playerData.name,
      teamId: homeTeam.name,
      position: playerData.position,
      stats: playerData.stats,
      fitness: playerData.fitness || 100,
      injured: playerData.injured || false,
    });
    homeTeam.addPlayer(player);
  });

  // Initialize players for the away team
  team2.players.forEach((playerData) => {
    const player = new Player({
      name: playerData.name,
      teamId: awayTeam.name,
      position: playerData.position,
      stats: playerData.stats,
      fitness: playerData.fitness || 100,
      injured: playerData.injured || false,
    });
    awayTeam.addPlayer(player);
  });

  // Assign roles to players in both teams
  assignRoles(homeTeam);
  assignRoles(awayTeam);

  // Initialize the field dimensions using pitchDetails
  const field = new Field(11);
  field.setFieldDimensionsFromPitch(pitchDetails); // Use pitchDetails from pitch.json to set the dimensions

  // Set field reference for teams and players
  homeTeam.field = field;
  awayTeam.field = field;

  homeTeam.players.forEach((player) => {
    player.field = field;
  });
  awayTeam.players.forEach((player) => {
    player.field = field;
  });

  // Initialize the match object with the teams and field details
  const match = new Match(homeTeam, awayTeam);
  match.field = field; // Assign field to the match object

  // Initialize positions for both teams
  match.initializePositions(false);

  return match;
}

/**
 * Simulates the next frame of the match and returns the updated match details.
 * @param {Object} match - The match object containing the current state.
 * @returns {Object} - An object containing the updated match object and matchDetails.
 */
async function playIteration(match) {
  // Initialize an object to hold match details including player positions

  const matchDetails = {};

  // Push the pitch dimensions
  matchDetails.fieldWidth = match.field.width;
  matchDetails.fieldLength = match.field.length;

  // Initialize match if it's not started yet
  if (!match.isPlaying) {
    match.playMatch();
  }

  const deltaTime = 0.1; // Match the client's update frequency (100ms)

  if (match.matchTime === 0) {
    match.matchTime += deltaTime;
    return;
  }

  // Simulate the match by updating it by one time step

  match.updateMatch(deltaTime);

  // Get current positions
  const currentPositions = match.getCurrentPositions();

  // Extract positions into matchDetails
  matchDetails.homeTeamPositions = [];
  matchDetails.awayTeamPositions = [];
  let index = 0;

  // Assuming both teams have the same number of players
  const numPlayers = match.homeTeam.players.length;

  // Extract home team positions
  for (let i = 0; i < numPlayers; i++) {
    matchDetails.homeTeamPositions.push({
      x: currentPositions[index],
      y: currentPositions[index + 1],
    });
    index += 2;
  }

  // Extract away team positions
  for (let i = 0; i < numPlayers; i++) {
    matchDetails.awayTeamPositions.push({
      x: currentPositions[index],
      y: currentPositions[index + 1],
    });
    index += 2;
  }

  // Extract ball position
  matchDetails.ballPosition = {
    x: currentPositions[index],
    y: currentPositions[index + 1],
  };

  // Include additional match details
  matchDetails.homeTeam = {
    name: match.homeTeam.name,
    score: match.homeScore,
    players: match.homeTeam.players.map((player) => ({
      name: player.name,
      position: player.position,
      rating: player.stats.rating,
      fitness: player.fitness,
      currentPOS: [player.currentPosition.x, player.currentPosition.y],
    })),
  };

  matchDetails.awayTeam = {
    name: match.awayTeam.name,
    score: match.awayScore,
    players: match.awayTeam.players.map((player) => ({
      name: player.name,
      position: player.position,
      rating: player.stats.rating,
      fitness: player.fitness,
      currentPOS: [player.currentPosition.x, player.currentPosition.y],
    })),
  };

  matchDetails.ball = {
    position: [match.ball.position.x, match.ball.position.y],
    withPlayer: match.ball.carrier ? match.ball.carrier.name : null,
  };

  matchDetails.matchTime = match.matchTime;
  matchDetails.half = match.matchTime < match.maxTime / 2 ? 1 : 2;

  // Return both the updated match object and matchDetails
  return { match, matchDetails };
}

/**
 * Starts the second half of the match, switching sides and resetting necessary variables.
 * @param {Object} match - The match object initialized with the teams.
 * @returns {Object} - The updated match details after switching sides.
 */
async function startSecondHalf(match) {
  // Switch the sides for both teams
  match.isHomeTeamKickingOff = !match.isHomeTeamKickingOff;
  match.initializePositions(true); // true indicates it's the second half

  // Reset match time to start of second half
  match.matchTime = match.maxTime / 2;

  // Prepare match details for the second half
  const matchDetails = {};

  matchDetails.message = "Second half started.";
  matchDetails.matchTime = match.matchTime;
  matchDetails.half = 2;

  return matchDetails; // Return the updated match details for the second half
}

module.exports = {
  initiateGame,
  playIteration,
  startSecondHalf,
  createTeam,
};
