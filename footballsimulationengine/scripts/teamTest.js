const Team = require("../components/Team");
const Field = require("../components/Field");
const Player = require("../components/Player");

// Utility function to log test results
let failedTests = 0;
let totalTests = 0;

function logTestResult(testName, condition) {
  totalTests++;
  if (!condition) {
    console.log(`${testName}: FAIL`);
    failedTests++;
  }
}

// Test 1: Create a team and add/remove players
function testAddRemovePlayers() {
  console.log("Test 1: Add/Remove Players...");

  const team = new Team("FC Example", "4-4-2");
  const player1 = new Player({ name: "Player 1", position: "GK" });
  const player2 = new Player({ name: "Player 2", position: "ST1" });

  team.addPlayer(player1);
  logTestResult("Add Player 1", team.players.includes(player1));

  team.addPlayer(player2);
  logTestResult("Add Player 2", team.players.includes(player2));

  team.removePlayer(player1);
  logTestResult("Remove Player 1", !team.players.includes(player1));

  team.removePlayer(player2);
  logTestResult("Remove Player 2", !team.players.includes(player2));
}

// Test 2: Set Formation Positions
function testSetFormationPositions() {
  console.log("Test 2: Set Formation Positions...");

  const team = new Team("FC Example", "4-4-2");
  const field = new Field(11); // 11v11 field
  const player1 = new Player({ name: "Player 1", position: "GK" });
  const player2 = new Player({ name: "Player 2", position: "ST1" });

  team.addPlayer(player1);
  team.addPlayer(player2);

  team.setFormationPositions(field);

  logTestResult(
    "Set Formation Position for Player 1 (GK)",
    player1.currentPosition.x === 0 &&
      player1.currentPosition.y === -0.45 * field.length
  );

  logTestResult(
    "Set Formation Position for Player 2 (ST1)",
    player2.currentPosition.x === -0.1 * field.width &&
      player2.currentPosition.y === 0.3 * field.length
  );
}

// Test 3: Select Style of Play
function testSelectStyleOfPlay() {
  console.log("Test 3: Select Style of Play...");

  const team = new Team("FC Example", "4-4-2");

  team.selectStyleOfPlay("tiki-taka");
  logTestResult(
    "Select Tiki-Taka",
    team.tactics.defensiveDepth === 60 && team.tactics.tempo === 70
  );

  team.selectStyleOfPlay("counter-attack");
  logTestResult(
    "Select Counter-Attack",
    team.tactics.defensiveDepth === 30 && team.tactics.tempo === 80
  );

  team.selectStyleOfPlay("park-the-bus");
  logTestResult(
    "Select Park-the-Bus",
    team.tactics.defensiveDepth === 20 && team.tactics.tempo === 30
  );

  team.selectStyleOfPlay("long-ball");
  logTestResult(
    "Select Long Ball",
    team.tactics.passingStyle === 20 && team.tactics.crossingFrequency === 70
  );

  team.selectStyleOfPlay("high-press");
  logTestResult(
    "Select High Press",
    team.tactics.pressingIntensity === 90 &&
      team.tactics.lineOfConfrontation === 80
  );
}

// Run all tests
function runTests() {
  console.log("Starting Team Class Tests...");

  try {
    testAddRemovePlayers();
    testSetFormationPositions();
    testSelectStyleOfPlay();

    console.log(
      `\nTests Completed. ${failedTests}/${totalTests} tests failed.`
    );
  } catch (error) {
    console.error("Error during tests:", error);
  }
}

runTests();
