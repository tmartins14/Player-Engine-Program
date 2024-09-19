const Match = require("../components/Match");
const Team = require("../components/Team");
const Player = require("../components/Player");
const Field = require("../components/Field");

// Define the game length in minutes
const GAME_LENGTH = 2; // Set to 2 minutes

// Create teams
const createTeam = (name, formation) => {
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

  // Ensure we don't exceed the number of positions available in the formation
  for (let i = 0; i < formationPositions.length; i++) {
    const positionKey = formationPositions[i]; // Assign the position based on formation
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
    team.addPlayer(player);
  }

  // Set player positions on the field according to the formation
  team.setFormationPositions(new Field(11));

  return team;
};

// Create home and away teams
const homeTeam = createTeam("Home Team", "4-4-2");
const awayTeam = createTeam("Away Team", "4-4-2");

// Create the match instance
const match = new Match(homeTeam, awayTeam);
match.maxTime = GAME_LENGTH * 60; // Set the match length to the defined game length in seconds

// Start the match and simulate it
match.startMatch((currentPositions) => {
  console.log(currentPositions); // Output the positions for each frame in real-time
});
