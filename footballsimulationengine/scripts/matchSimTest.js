const Match = require("../components/Match");
const Team = require("../components/Team");
const Player = require("../components/Player");
const Field = require("../components/Field");
const Ball = require("../components/Ball");

// Define the game length in minutes
const GAME_LENGTH = 2;

// Create teams
const createTeam = (name, formation) => {
  const team = new Team(name, formation);
  for (let i = 0; i < 11; i++) {
    const player = new Player({
      name: `${name} Player ${i + 1}`,
      teamId: team.name,
      position: `Player${i + 1}`,
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
    team.addPlayer(player);
  }
  return team;
};

// Create home and away teams
const homeTeam = createTeam("Home Team", "4-4-2");
const awayTeam = createTeam("Away Team", "4-4-2");

// Create the match instance
const match = new Match(homeTeam, awayTeam);
match.maxTime = GAME_LENGTH; // Set the match length to the defined game length

// Start the match and simulate it
const matchPositions = match.startMatch();

// Output the simulation results
console.log("Match Simulation Positions:");
console.log(matchPositions);
