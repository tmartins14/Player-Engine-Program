const Field = require("../components/Field");
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

// Test 1: Player Positioning Within Field Boundaries
function testSetPositionWithinBounds() {
  const field = new Field(11);
  const player = new Player({
    name: "John Doe",
    teamId: 1,
    position: "ST",
    rating: 85,
    pace: 70,
    shooting: 60,
    dribbling: 50,
    defending: 80,
    passing: 70,
    physical: 75,
  });

  const newPosition = { x: field.width / 2 - 1, y: field.length / 2 - 1 };
  player.setPosition(newPosition);
  logTestResult(
    "testSetPositionWithinBounds",
    player.currentPosition.x === newPosition.x &&
      player.currentPosition.y === newPosition.y &&
      player.isWithinBoundaries(field)
  );
}

// Test 2: Player Positioning Outside Field Boundaries
function testSetPositionOutsideBounds() {
  const field = new Field(11);
  const player = new Player({
    name: "John Doe",
    teamId: 1,
    position: "ST",
    rating: 85,
    pace: 70,
    shooting: 60,
    dribbling: 50,
    defending: 80,
    passing: 70,
    physical: 75,
  });

  const newPosition = { x: field.width / 2 + 10, y: field.length / 2 + 10 };
  player.setPosition(newPosition);
  logTestResult(
    "testSetPositionOutsideBounds",
    player.currentPosition.x === newPosition.x &&
      player.currentPosition.y === newPosition.y &&
      !player.isWithinBoundaries(field)
  );
}

// Test 3: Defensive Action within Vicinity
function testPerformDefensiveActionWithinVicinity() {
  const field = new Field(11);
  const player = new Player({
    name: "John Doe",
    teamId: 1,
    position: "CB",
    rating: 85,
    pace: 70,
    shooting: 60,
    dribbling: 50,
    defending: 90, // High defending skill
    passing: 70,
    physical: 75,
  });

  const ball = { position: { x: 0, y: 0 }, isShot: false, isLoose: true };
  const opponents = [{ currentPosition: { x: 2, y: 2 }, hasBall: true }];

  const foul = player.performDefensiveAction(opponents, ball, field);
  logTestResult("testPerformDefensiveActionWithinVicinity", !foul);
}

// Test 4: Defensive Action outside Vicinity
function testPerformDefensiveActionOutsideVicinity() {
  const field = new Field(11);
  const player = new Player({
    name: "John Doe",
    teamId: 1,
    position: "CB",
    rating: 85,
    pace: 70,
    shooting: 60,
    dribbling: 50,
    defending: 50, // Lower defending skill
    passing: 70,
    physical: 75,
  });

  const ball = { position: { x: 50, y: 50 }, isShot: false, isLoose: true };
  const opponents = [{ currentPosition: { x: 50, y: 50 }, hasBall: true }];

  const foul = player.performDefensiveAction(opponents, ball, field);
  logTestResult("testPerformDefensiveActionOutsideVicinity", !foul);
}

// Test 5: Player Offside Check
function testPlayerOffside() {
  const field = new Field(11);
  const player = new Player({
    name: "John Doe",
    teamId: 1,
    position: "ST",
    rating: 85,
    pace: 70,
    shooting: 60,
    dribbling: 50,
    defending: 80,
    passing: 70,
    physical: 75,
  });

  const ball = { position: { x: -20, y: 0 }, isShot: false };
  player.setPosition({ x: 10, y: 0 }); // Position ahead of the ball (offside)

  logTestResult("testPlayerOffside", player.isOffside(ball));
}

// Test 6: Player Not Offside
function testPlayerNotOffside() {
  const field = new Field(11);
  const player = new Player({
    name: "John Doe",
    teamId: 1,
    position: "ST",
    rating: 85,
    pace: 70,
    shooting: 60,
    dribbling: 50,
    defending: 80,
    passing: 70,
    physical: 75,
  });

  const ball = { position: { x: 20, y: 0 }, isShot: false };
  player.setPosition({ x: 10, y: 0 }); // Position behind the ball (not offside)

  logTestResult("testPlayerNotOffside", !player.isOffside(ball));
}

const runTests = async () => {
  try {
    // Database sync is commented out since we're not testing database interactions
    // await syncDatabase();

    testSetPositionWithinBounds();
    testSetPositionOutsideBounds();
    testPerformDefensiveActionWithinVicinity();
    testPerformDefensiveActionOutsideVicinity();
    testPlayerOffside();
    testPlayerNotOffside();

    console.log(`Test Completed. ${failedTests}/${totalTests} tests failed.`);
  } catch (error) {
    console.error("Error during tests:", error);
  }
};

runTests();
