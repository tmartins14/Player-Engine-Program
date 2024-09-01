const Field = require("../components/Field");
const Player = require("../components/Player");

// const { logTestResult } = require("../utilities/testFunctions");
const {
  logClassMethods,
  logObjectMethods,
} = require("../utilities/classInspection");

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
    stats: {
      rating: 85,
      pace: 70,
      shooting: 60,
      dribbling: 50,
      defending: 80,
      passing: 70,
      physical: 75,
      saving: 0,
    },
    fitness: 100,
    injured: false,
    field: field,
  });

  const newPosition = { x: field.width / 2 - 1, y: field.length / 2 - 1 };

  player.setPosition(newPosition);
  logTestResult(
    "testSetPositionWithinBounds",
    player.currentPosition.x === newPosition.x &&
      player.currentPosition.y === newPosition.y &&
      player.isWithinBoundaries()
  );
}

// Test 2: Player Positioning Outside Field Boundaries
function testSetPositionOutsideBounds() {
  const field = new Field(11);
  const player = new Player({
    name: "John Doe",
    teamId: 1,
    position: "ST",
    stats: {
      rating: 85,
      pace: 70,
      shooting: 60,
      dribbling: 50,
      defending: 80,
      passing: 70,
      physical: 75,
      saving: 0,
    },
    fitness: 100,
    injured: false,
    field: field,
  });

  const newPosition = { x: field.width / 2 + 10, y: field.length / 2 + 10 };

  logTestResult(
    "testSetPositionOutsideBounds",
    player.setPosition(newPosition) === false
  );
}

// Test 3: Defensive Action within Vicinity
function testPerformDefensiveActionWithinVicinity() {
  const field = new Field(11);
  const player = new Player({
    name: "John Doe",
    teamId: 1,
    position: "CB",
    stats: {
      rating: 85,
      pace: 70,
      shooting: 60,
      dribbling: 50,
      defending: 90, // High defending skill
      passing: 70,
      physical: 75,
      saving: 0,
    },
    fitness: 100,
    injured: false,
    field: field,
  });

  const ball = { position: { x: 0, y: 0 }, isShot: false, isLoose: true };
  const opponents = [{ currentPosition: { x: 2, y: 2 }, hasBall: true }];

  const foul = player.performDefensiveAction(opponents, ball);
  logTestResult("testPerformDefensiveActionWithinVicinity", !foul);
}

// Test 4: Defensive Action outside Vicinity
function testPerformDefensiveActionOutsideVicinity() {
  const field = new Field(11);
  const player = new Player({
    name: "John Doe",
    teamId: 1,
    position: "CB",
    stats: {
      rating: 85,
      pace: 70,
      shooting: 60,
      dribbling: 50,
      defending: 50, // Lower defending skill
      passing: 70,
      physical: 75,
      saving: 0,
    },
    fitness: 100,
    injured: false,
    field: field,
  });

  const ball = { position: { x: 50, y: 50 }, isShot: false, isLoose: true };
  const opponents = [{ currentPosition: { x: 50, y: 50 }, hasBall: true }];

  const foul = player.performDefensiveAction(opponents, ball);
  logTestResult("testPerformDefensiveActionOutsideVicinity", !foul);
}

// Test 5: Player Offside Check
function testPlayerOffside() {
  const field = new Field(11);
  const player = new Player({
    name: "John Doe",
    teamId: 1,
    position: "ST",
    stats: {
      rating: 85,
      pace: 70,
      shooting: 60,
      dribbling: 50,
      defending: 80,
      passing: 70,
      physical: 75,
      saving: 0,
    },
    fitness: 100,
    injured: false,
    field: field,
  });

  const ball = { position: { x: -20, y: -1 }, isShot: false };
  const lastDefenderPosition = { x: 0, y: 0 };
  player.setPosition({ x: 0, y: 10 }); // Position ahead of the ball and last defender (offside)

  logTestResult(
    "testPlayerOffside",
    player.checkOffside(ball, lastDefenderPosition)
  );
}

// Test 6: Player Not Offside
function testPlayerNotOffside() {
  const field = new Field(11);
  const player = new Player({
    name: "John Doe",
    teamId: 1,
    position: "ST",
    stats: {
      rating: 85,
      pace: 70,
      shooting: 60,
      dribbling: 50,
      defending: 80,
      passing: 70,
      physical: 75,
      saving: 0,
    },
    fitness: 100,
    injured: false,
    field: field,
  });

  const ball = { position: { x: 20, y: 0 }, isShot: false };
  const lastDefenderPosition = { x: 30, y: 0 };
  player.setPosition({ x: 10, y: 0 }); // Position behind the ball and last defender (not offside)

  logTestResult(
    "testPlayerNotOffside",
    !player.checkOffside(ball, lastDefenderPosition)
  );
}

const runTests = async () => {
  try {
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
