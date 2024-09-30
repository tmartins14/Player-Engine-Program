const Match = require("./components/Match");
const Team = require("./components/Team");
const Player = require("./components/Player");
const Field = require("./components/Field");

//------------------------
//    Functions
//------------------------

/**
 * Initializes the game with two teams and pitch details.
 * This sets up the match and kicks it off with the defined rules and player positions.
 * @param {Object} team1 - First team object (home team).
 * @param {Object} team2 - Second team object (away team).
 * @param {Object} pitchDetails - Pitch object containing pitch width, length, etc.
 * @returns {Object} match - The initialized match object.
 */

const createTeam = async (name, formation) => {
  const team = new Team(name, formation);

  // Define a default 4-4-2 formation positions array
  const formationPositions = [
    "GK",
    "RB",
    "CB1",
    "CB2",
    "LB",
    "RM",
    "CM1",
    "CM2",
    "LM",
    "ST1",
    "ST2",
  ];

  // Loop through formation positions and create players
  for (let i = 0; i < formationPositions.length; i++) {
    const positionKey = formationPositions[i]; // Assign position based on formation
    const player = new Player({
      name: `${name} Player ${i + 1}`,
      teamId: team.name,
      position: positionKey, // Assign the specific formation position
      stats: {
        rating: 75,
        pace: 70,
        shooting: 60,
        dribbling: 65,
        defending: 70,
        passing: 75,
        physical: 70,
        saving: 50,
      },
      fitness: 100,
      injured: false,
      field: new Field(11),
    });
    team.addPlayer(player); // Add player to team
  }

  return team; // Return the created team
};

/**
 * Initializes the game by creating home and away teams and setting up the pitch details.
 * @param {Object} team1 - First team object.
 * @param {Object} team2 - Second team object.
 * @param {Object} pitchDetails - The pitch configuration with width and height.
 * @returns {Object} match - The initialized match object.
 */
async function initiateGame(team1, team2, pitchDetails) {
  // Create the home and away teams using the new Team constructor
  const homeTeam = new Team(team1.name, team1.formation);
  const awayTeam = new Team(team2.name, team2.formation);

  // Initialize players for both teams
  team1.players.forEach((playerData, index) => {
    const player = new Player({
      name: playerData.name,
      teamId: homeTeam.name,
      position: playerData.position,
      stats: playerData.stats,
      fitness: playerData.fitness || 100,
      injured: playerData.injured || false,
      field: new Field(11),
    });
    homeTeam.addPlayer(player);
  });

  team2.players.forEach((playerData, index) => {
    const player = new Player({
      name: playerData.name,
      teamId: awayTeam.name,
      position: playerData.position,
      stats: playerData.stats,
      fitness: playerData.fitness || 100,
      injured: playerData.injured || false,
      field: new Field(11),
    });
    awayTeam.addPlayer(player);
  });

  // Initialize the match object with the teams and field details
  const match = new Match(homeTeam, awayTeam);

  // Initialize the field dimensions using pitchDetails
  const field = new Field(11);
  field.setFieldDimensionsFromPitch(pitchDetails); // Use pitchDetails from pitch.json to set the dimensions

  match.field = field; // Assign field to the match object

  match.initializePositions(false); // Initialize player positions

  // Log the current position of each player in the homeTeam
  homeTeam.players.forEach((player) => {
    console.log(
      `${player.name} (${player.position}) is at position: `,
      player.currentPosition
    );
  });

  awayTeam.players.forEach((player) => {
    console.log(
      `${player.name} (${player.position}) is at position: `,
      player.currentPosition
    );
  });

  return match;
}

/**
 * Simulates the next frame of the match and returns the updated match details.
 * @param {Object} match - The match object containing the current state.
 * @param {Function} onUpdatePositions - Callback function to handle position updates.
 * @returns {Array} matchDetails - The updated player positions, ball position, and match data.
 */
async function playIteration(match, onUpdatePositions) {
  // Initialize an array to hold match details including player positions
  const matchDetails = [];

  // Push the pitch dimensions first
  matchDetails.push(match.field.width);
  matchDetails.push(match.field.length);

  // Use playMatch to update player positions and the ball's position
  match.playMatch((currentPositions) => {
    // Push each player's position into matchDetails
    currentPositions.forEach((position) => {
      matchDetails.push(position.x);
      matchDetails.push(position.y);
    });

    // Push the match summary details (teams, ball, etc.)
    matchDetails.push({
      homeTeam: {
        name: match.homeTeam.name,
        players: match.homeTeam.players.map((player) => ({
          name: player.name,
          position: player.position,
          rating: player.stats.rating,
          fitness: player.fitness,
          currentPOS: [player.currentPosition.x, player.currentPosition.y],
        })),
      },
      awayTeam: {
        name: match.awayTeam.name,
        players: match.awayTeam.players.map((player) => ({
          name: player.name,
          position: player.position,
          rating: player.stats.rating,
          fitness: player.fitness,
          currentPOS: [player.currentPosition.x, player.currentPosition.y],
        })),
      },
      ball: {
        position: [match.ball.position.x, match.ball.position.y],
        withPlayer: match.ball.withPlayer || false,
      },
      matchTime: match.matchTime,
      half: match.half || 1,
    });
  });

  // Return both the updated match object and matchDetails
  return { match, matchDetails };
}

/**
 * Starts the second half of the match, switching sides and resetting necessary variables.
 * @param {Object} match - The match object initialized with the teams.
 * @returns {Array} matchDetails - The updated match details after switching sides.
 */
async function startSecondHalf(match) {
  // Switch the sides for both teams
  match.homeTeam.switchSides();
  match.awayTeam.switchSides();

  // Re-initialize positions with the sides switched
  match.initializePositions(true); // true indicates it's the second half

  const matchDetails = [];

  // Kick off the second half and capture the positions
  match.playMatch((currentPositions) => {
    matchDetails.push(currentPositions); // Store positions for the second half
  });

  return matchDetails; // Return the updated match details for the second half
}

module.exports = {
  initiateGame,
  playIteration,
  startSecondHalf,
  createTeam,
};
