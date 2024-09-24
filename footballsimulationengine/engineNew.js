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
 * @returns {Object} matchDetails - The initialized match details.
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

  // Set player positions based on the team's formation
  team.setFormationPositions(new Field(11));

  return team; // Return the created team
};

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

  // Initialize the match object with the teams and pitch details
  const match = new Match(homeTeam, awayTeam);

  match.initializePositions();

  match.field = pitchDetails;

  // Log the current position of each player in the homeTeam
  for (const player of homeTeam.players) {
    console.log(`${player.name} is at position: `, player.currentPosition);
  }

  return match;
}

/**
 * Simulates a single iteration of the match and updates match details.
 * This updates ball movement, player actions, and overall match flow.
 * @param {Object} match - The match instance initialized with the teams.
 * @returns {Object} matchDetails - The updated match details after a single iteration.
 */
async function playIteration(match) {
  // Call updateMatch to process a single iteration of the match
  const matchDetails = [];

  // Simulate one second (one frame) of the match
  match.startMatch((currentPositions) => {
    matchDetails.push(currentPositions); // Store each frame's positions in matchDetails
  });

  return matchDetails;
}

/**
 * Starts the second half of the match, switching sides and resetting necessary variables.
 * @param {Object} match - The match instance initialized with the teams.
 * @returns {Object} matchDetails - The updated match details after switching sides.
 */
async function startSecondHalf(match) {
  // Switch the sides for both teams
  match.homeTeam.switchSides();
  match.awayTeam.switchSides();

  // Reset match details for the second half
  match.kickOff();

  // Capture match details for the second half
  const matchDetails = [];
  match.startMatch((currentPositions) => {
    matchDetails.push(currentPositions); // Store each frame's positions in matchDetails
  });

  return matchDetails;
}

module.exports = {
  initiateGame,
  playIteration,
  startSecondHalf,
  createTeam,
};
