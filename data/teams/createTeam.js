const fs = require("fs");
const Team = require("../../footballsimulationengine/components/Team");
const Player = require("../../footballsimulationengine/components/Player");
const Field = require("../../footballsimulationengine/components/Field");

// Function to normalize x and y positions within the specified range
const normalizePosition = (x, y) => {
  return {
    x: ((x - 50) / (600 - 50)) * 100 - 50, // Normalizes x to -50 to 50
    y: ((y - 66) / (500 - 66)) * 132 - 66, // Normalizes y to -66 to 66
  };
};

const createTeam = (teamName) => {
  const team = new Team(teamName, "4-4-2"); // Assuming a 4-4-2 formation

  // Define field dimensions (default 11v11)
  const field = new Field(11);

  // Player data for all 11 players
  const playersData = [
    {
      name: "Bill Johnson",
      position: "GK",
      stats: {
        rating: 75,
        pace: 20,
        shooting: 12,
        dribbling: 20,
        defending: 20,
        passing: 20,
        physical: 20,
        saving: 20,
      },
      fitness: 100,
      injured: false,
      startPOS: [340, 0],
    },
    {
      name: "Fred Johnson",
      position: "LB",
      stats: {
        rating: 90,
        pace: 20,
        shooting: 20,
        dribbling: 20,
        defending: 20,
        passing: 20,
        physical: 20,
        saving: 20,
      },
      fitness: 100,
      injured: false,
      startPOS: [80, 80],
    },
    {
      name: "George Johnson",
      position: "CB",
      stats: {
        rating: 84,
        pace: 20,
        shooting: 20,
        dribbling: 20,
        defending: 20,
        passing: 20,
        physical: 20,
        saving: 20,
      },
      fitness: 100,
      injured: false,
      startPOS: [230, 80],
    },
    {
      name: "Jim Johnson",
      position: "CB",
      stats: {
        rating: 75,
        pace: 20,
        shooting: 20,
        dribbling: 20,
        defending: 20,
        passing: 20,
        physical: 20,
        saving: 20,
      },
      fitness: 100,
      injured: false,
      startPOS: [420, 80],
    },
    {
      name: "Georgina Johnson",
      position: "RB",
      stats: {
        rating: 82,
        pace: 20,
        shooting: 20,
        dribbling: 20,
        defending: 20,
        passing: 20,
        physical: 23,
        saving: 20,
      },
      fitness: 100,
      injured: false,
      startPOS: [600, 80],
    },
    {
      name: "Lucy Johnson",
      position: "LM",
      stats: {
        rating: 87,
        pace: 20,
        shooting: 20,
        dribbling: 20,
        defending: 20,
        passing: 20,
        physical: 20,
        saving: 20,
      },
      fitness: 100,
      injured: false,
      startPOS: [80, 270],
    },
    {
      name: "Arthur Johnson",
      position: "CM",
      stats: {
        rating: 41,
        pace: 33,
        shooting: 20,
        dribbling: 20,
        defending: 20,
        passing: 33,
        physical: 20,
        saving: 20,
      },
      fitness: 100,
      injured: false,
      startPOS: [230, 270],
    },
    {
      name: "Cameron Johnson",
      position: "CM",
      stats: {
        rating: 99,
        pace: 20,
        shooting: 20,
        dribbling: 20,
        defending: 20,
        passing: 20,
        physical: 20,
        saving: 20,
      },
      fitness: 100,
      injured: false,
      startPOS: [420, 270],
    },
    {
      name: "Gill Johnson",
      position: "RM",
      stats: {
        rating: 79,
        pace: 20,
        shooting: 20,
        dribbling: 20,
        defending: 20,
        passing: 20,
        physical: 20,
        saving: 20,
      },
      fitness: 100,
      injured: false,
      startPOS: [600, 270],
    },
    {
      name: "Peter Johnson",
      position: "ST",
      stats: {
        rating: 75,
        pace: 20,
        shooting: 20,
        dribbling: 20,
        defending: 20,
        passing: 20,
        physical: 20,
        saving: 20,
      },
      fitness: 100,
      injured: false,
      startPOS: [280, 500],
    },
    {
      name: "Louise Johnson",
      position: "ST",
      stats: {
        rating: 88,
        pace: 20,
        shooting: 20,
        dribbling: 20,
        defending: 20,
        passing: 20,
        physical: 20,
        saving: 20,
      },
      fitness: 100,
      injured: false,
      startPOS: [440, 500],
    },
  ];

  // Create Player objects and add them to the team
  playersData.forEach((playerData) => {
    const normalizedPosition = normalizePosition(
      playerData.startPOS[0],
      playerData.startPOS[1]
    );

    const player = new Player({
      name: playerData.name,
      teamId: team.name,
      position: playerData.position,
      stats: playerData.stats,
      fitness: playerData.fitness,
      injured: playerData.injured,
      field: field,
    });

    // Set the player's initial position to the normalized startPOS
    player.currentPosition = normalizedPosition;

    team.addPlayer(player);
  });

  // Convert the team to a JSON object
  const teamJson = JSON.stringify(team, null, 2);

  // Write the team data to a JSON file
  fs.writeFileSync(`${teamName}.json`, teamJson);

  console.log(`Team saved to ${teamName}.json`);
};

createTeam("Team1");
