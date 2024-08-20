const sequelize = require("../services/dataServices/database");
const PlayerModel = require("../models/player");
const PlayerMovementModel = require("../models/playerMovement");
const Player = require("../components/Player");

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

async function syncDatabase() {
  // Sync only the players and player_movement tables
  await PlayerModel.sync({ force: true });
  await PlayerMovementModel.sync({ force: true });
  console.log("Database synchronized.");
}

async function testCreateNewPlayer() {
  // Create a new player instance (this will automatically call createNewPlayer)
  const newPlayer = new Player({
    name: "John Doe",
    teamId: 1, // Assume teamId 1 exists
    position: "ST", // Striker
    rating: 85,
    pace: 70,
    shooting: 60,
    dribbling: 50,
    defending: 80,
    passing: 70,
    physical: 75,
  });

  // Wait for the player to be created in the database
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Adjust the timeout as needed

  const playerDetails = await PlayerModel.findByPk(newPlayer.playerId);
  logTestResult("testCreateNewPlayer", playerDetails !== null);
  return newPlayer;
}

async function testCreatePlayerMovement(player) {
  // Create a movement for the new player
  const newMovement = await player.createPlayerMovement({
    frame: 1,
    game_id: 1, // Assume game_id 1 exists
    team_id: player.teamId,
    x: 100,
    y: 150,
    z: 0, // Optional, can be omitted
    fitness: 100,
    injured: false,
    hasBall: false,
    isOffside: false,
    game_running: true,
    phase: 1, // Assume phase 1 exists
  });

  logTestResult("testCreatePlayerMovement", newMovement !== null);
  return newMovement;
}

async function testGetPlayerDetails(player) {
  // Fetch player details
  const playerDetails = await player.getPlayerDetails();
  logTestResult(
    "testGetPlayerDetails",
    playerDetails !== null && playerDetails.name === player.name
  );
}

async function testGetPlayerMovements(player) {
  // Fetch player movements
  const playerMovements = await player.getPlayerMovements();
  logTestResult(
    "testGetPlayerMovements",
    Array.isArray(playerMovements) && playerMovements.length > 0
  );
  return playerMovements;
}

async function testUpdatePlayerMovement(player, movement) {
  // Update player movement
  const updatedMovement = await player.updatePlayerMovement(movement.id, {
    x: 200,
    y: 250,
    fitness: 95,
    injured: true,
    hasBall: true,
    isOffside: true,
  });

  logTestResult(
    "testUpdatePlayerMovement",
    updatedMovement.x === 200 &&
      updatedMovement.y === 250 &&
      updatedMovement.fitness === 95 &&
      updatedMovement.injured === true &&
      updatedMovement.hasBall === true &&
      updatedMovement.isOffside === true
  );
}

function testSetPosition(player) {
  const newPosition = { x: 300, y: 400 };
  player.setPosition(newPosition);
  logTestResult(
    "testSetPosition",
    player.currentPosition !== null &&
      player.currentPosition.x === newPosition.x &&
      player.currentPosition.y === newPosition.y
  );
}

const runTests = async () => {
  try {
    await syncDatabase();

    const newPlayer = await testCreateNewPlayer();
    const newMovement = await testCreatePlayerMovement(newPlayer);
    await testGetPlayerDetails(newPlayer);
    const playerMovements = await testGetPlayerMovements(newPlayer);
    await testUpdatePlayerMovement(newPlayer, playerMovements[0]);

    // Test the setPosition method
    testSetPosition(newPlayer);

    console.log(`Test Completed. ${failedTests}/${totalTests} tests failed.`);
  } catch (error) {
    console.error("Error during tests:", error);
  } finally {
    await sequelize.close();
  }
};

runTests();
