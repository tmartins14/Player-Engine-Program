const Team = require("../components/Team");
const Player = require("../components/Player");
const Field = require("../components/Field");

let failedTests = 0;
let totalTests = 0;

// Utility function for logging test results
function logTestResult(testName, condition) {
  totalTests++;
  if (!condition) {
    console.log(`${testName}: FAIL`);
    failedTests++;
  }
}

// Test 1: Team Initialization
function testTeamInitialization() {
  console.log("Test 1: Team Initialization...");

  const team = new Team("Team A", "4-4-2", "attacking");

  logTestResult("Team Name", team.name === "Team A");
  logTestResult("Team Formation", team.formation === "4-4-2");
  logTestResult("Team Strategy", team.strategy === "attacking");
  logTestResult(
    "Players Array Initialized",
    Array.isArray(team.players) && team.players.length === 0
  );
}

// Test 2: Adding and Removing Players
function testAddAndRemovePlayers() {
  console.log("Test 2: Adding and Removing Players...");

  const field = new Field(11);
  const team = new Team("Team A", "4-4-2", { aggression: 70 });
  const player1 = new Player({ name: "Player 1", position: "GK", field });
  const player2 = new Player({ name: "Player 2", position: "RB", field });

  team.addPlayer(player1);
  team.addPlayer(player2);

  logTestResult("Player Added", team.players.length === 2);
  logTestResult("Player 1 in Team", team.players.includes(player1));
  logTestResult("Player 2 in Team", team.players.includes(player2));

  team.removePlayer(player1);
  logTestResult("Player Removed", team.players.length === 1);
  logTestResult("Player 1 Removed", !team.players.includes(player1));
}

// Test 3: Set Formation Positions
function testSetFormationPositions() {
  console.log("Test 3: Set Formation Positions...");

  const field = new Field(11);
  const team = new Team("Team A", "4-4-2", { aggression: 50 });

  const players = [
    new Player({ name: "Player 1", position: "GK", field }),
    new Player({ name: "Player 2", position: "RB", field }),
    new Player({ name: "Player 3", position: "CB1", field }),
    new Player({ name: "Player 4", position: "CB2", field }),
    new Player({ name: "Player 5", position: "LB", field }),
    new Player({ name: "Player 6", position: "RM", field }),
    new Player({ name: "Player 7", position: "CM1", field }),
    new Player({ name: "Player 8", position: "CM2", field }),
    new Player({ name: "Player 9", position: "LM", field }),
    new Player({ name: "Player 10", position: "ST1", field }),
    new Player({ name: "Player 11", position: "ST2", field }),
  ];

  players.forEach((player) => team.addPlayer(player));
  team.setFormationPositions();

  logTestResult(
    "GK Position Set",
    players[0].currentPosition.x === 0 &&
      players[0].currentPosition.y === -field.length * 0.45
  );
  logTestResult(
    "RB Position Set",
    players[1].currentPosition.x === -field.width * 0.3 &&
      players[1].currentPosition.y === -field.length * 0.3
  );
}

// Test 4: Assign Roles and Instructions
function testAssignRolesAndInstructions() {
  console.log("Test 4: Assign Roles and Instructions...");

  const field = new Field(11);
  const team = new Team("Team A", "4-4-2", {
    aggression: 60,
    passing: "direct",
  });

  const players = [
    new Player({ name: "Player 1", position: "GK", field }),
    new Player({ name: "Player 2", position: "RB", field }),
    new Player({ name: "Player 3", position: "CB1", field }),
    new Player({ name: "Player 4", position: "CB2", field }),
    new Player({ name: "Player 5", position: "LB", field }),
    new Player({ name: "Player 6", position: "RM", field }),
    new Player({ name: "Player 7", position: "CM1", field }),
    new Player({ name: "Player 8", position: "CM2", field }),
    new Player({ name: "Player 9", position: "LM", field }),
    new Player({ name: "Player 10", position: "ST1", field }),
    new Player({ name: "Player 11", position: "ST2", field }),
  ];

  players.forEach((player) => team.addPlayer(player));
  team.assignRolesAndInstructions();

  logTestResult(
    "Player 1 Role Assigned",
    players[0].teamInstructions.role === "defender"
  );
  logTestResult(
    "Player 6 Role Assigned",
    players[5].teamInstructions.role === "midfielder"
  );
  logTestResult(
    "Player 10 Role Assigned",
    players[9].teamInstructions.role === "attacker"
  );
  logTestResult(
    "Player 10 Passing Strategy",
    players[9].teamInstructions.passingStrategy === "direct"
  );
}

// Test 5: Update Strategy
function testUpdateStrategy() {
  console.log("Test 5: Update Strategy...");

  const field = new Field(11);
  const team = new Team("Team A", "4-4-2", {
    aggression: 50,
    passing: "possession",
  });

  const players = [
    new Player({ name: "Player 1", position: "GK", field }),
    new Player({ name: "Player 2", position: "RB", field }),
    new Player({ name: "Player 3", position: "CB1", field }),
    new Player({ name: "Player 4", position: "CB2", field }),
    new Player({ name: "Player 5", position: "LB", field }),
    new Player({ name: "Player 6", position: "RM", field }),
    new Player({ name: "Player 7", position: "CM1", field }),
    new Player({ name: "Player 8", position: "CM2", field }),
    new Player({ name: "Player 9", position: "LM", field }),
    new Player({ name: "Player 10", position: "ST1", field }),
    new Player({ name: "Player 11", position: "ST2", field }),
  ];

  players.forEach((player) => team.addPlayer(player));
  team.assignRolesAndInstructions();

  team.updateStrategy({ aggression: 80, passing: "direct" });
  team.assignRolesAndInstructions();

  logTestResult("Aggression Updated", team.strategy.aggression === 80);
  logTestResult("Passing Strategy Updated", team.strategy.passing === "direct");
  logTestResult(
    "Player 10 Updated Passing Strategy",
    players[9].teamInstructions.passingStrategy === "direct"
  );
}

// Run all tests
function runTeamTests() {
  console.log("Starting Team Class Tests...");

  try {
    testTeamInitialization();
    testAddAndRemovePlayers();
    testSetFormationPositions();
    testAssignRolesAndInstructions();
    testUpdateStrategy();

    console.log(
      `Team Class Tests Completed. ${failedTests}/${totalTests} tests failed.`
    );
  } catch (error) {
    console.error("Error during team tests:", error);
  }
}

runTeamTests();
