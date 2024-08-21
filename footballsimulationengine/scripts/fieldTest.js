const Field = require("../components/Field");

// Utility function for logging test results
let failedTests = 0;
let totalTests = 0;

function logTestResult(testName, condition) {
  totalTests++;
  if (!condition) {
    console.log(`${testName}: FAIL`);
    failedTests++;
  }
}

// Test 1: Field Dimensions Based on Player Count
function testFieldDimensions() {
  console.log("Test 1: Field Dimensions Based on Player Count...");

  const field11v11 = new Field(11);
  logTestResult(
    "11v11 Field Dimensions",
    field11v11.width === 100 && field11v11.length === 132
  );

  const field7v7 = new Field(7);
  logTestResult(
    "7v7 Field Dimensions",
    field7v7.width === 65 && field7v7.length === 82
  );

  const field6v6 = new Field(6);
  logTestResult(
    "6v6 Field Dimensions",
    field6v6.width === 55 && field6v6.length === 72
  );
}

// Test 2: Center Position
function testCenterPosition() {
  console.log("Test 2: Center Position...");

  const field = new Field(11);
  const centerPosition = field.getCenterPosition();
  logTestResult(
    "Center Position",
    centerPosition.x === 0 && centerPosition.y === 0
  );
}

// Test 3: Coordinate System Boundaries
function testCoordinateSystem() {
  console.log("Test 3: Coordinate System Boundaries...");

  const field = new Field(11);
  const coordinateSystem = field.getCoordinateSystem();
  logTestResult(
    "Coordinate System Origin",
    coordinateSystem.origin.x === 0 && coordinateSystem.origin.y === 0
  );
  logTestResult(
    "Top-Left Coordinate",
    coordinateSystem.topLeft.x === -field.width / 2 &&
      coordinateSystem.topLeft.y === field.length / 2
  );
  logTestResult(
    "Bottom-Right Coordinate",
    coordinateSystem.bottomRight.x === field.width / 2 &&
      coordinateSystem.bottomRight.y === -field.length / 2
  );
}

// Test 4: Field Zones
function testFieldZones() {
  console.log("Test 4: Field Zones...");

  const field = new Field(11);
  const zones = field.getZones();
  const thirdLength = field.length / 3;

  logTestResult(
    "Defensive Zone Start",
    zones.defensiveZone.start === -field.length / 2
  );
  logTestResult(
    "Defensive Zone End",
    zones.defensiveZone.end === zones.defensiveZone.start + thirdLength
  );
  logTestResult(
    "Attacking Zone Start",
    zones.attackingZone.start === zones.attackingZone.end - thirdLength
  );
  logTestResult(
    "Attacking Zone End",
    zones.attackingZone.end === field.length / 2
  );
  logTestResult(
    "Neutral Zone Start",
    zones.neutralZone.start === zones.defensiveZone.end
  );
  logTestResult(
    "Neutral Zone End",
    zones.neutralZone.end === zones.attackingZone.start
  );
}

// Test 5: Penalty Areas - Symmetry Checks
function testPenaltyAreas() {
  console.log("Test 5: Penalty Areas - Symmetry Checks...");

  const field = new Field(11);
  const homePenaltyArea = field.getPenaltyArea("home");
  const awayPenaltyArea = field.getPenaltyArea("away");

  // Symmetry Checks
  logTestResult(
    "Symmetry Test Top-Left",
    homePenaltyArea.topLeft.x === awayPenaltyArea.bottomLeft.x &&
      homePenaltyArea.topLeft.y === -awayPenaltyArea.bottomLeft.y
  );
  logTestResult(
    "Symmetry Test Top-Right",
    homePenaltyArea.topRight.x === awayPenaltyArea.bottomRight.x &&
      homePenaltyArea.topRight.y === -awayPenaltyArea.bottomRight.y
  );
  logTestResult(
    "Symmetry Test Bottom-Left",
    homePenaltyArea.bottomLeft.x === awayPenaltyArea.topLeft.x &&
      homePenaltyArea.bottomLeft.y === -awayPenaltyArea.topLeft.y
  );
  logTestResult(
    "Symmetry Test Bottom-Right",
    homePenaltyArea.bottomRight.x === awayPenaltyArea.topRight.x &&
      homePenaltyArea.bottomRight.y === -awayPenaltyArea.topRight.y
  );
}

// Test 6: Six-Yard Box - Symmetry Checks
function testSixYardBoxSymmetry() {
  console.log("Test 6: Six-Yard Box - Symmetry Checks...");

  const field = new Field(11);
  const homeSixYardBox = field.getSixYardBox("home");
  const awaySixYardBox = field.getSixYardBox("away");

  // Symmetry Checks
  logTestResult(
    "Symmetry Test Top-Left",
    homeSixYardBox.topLeft.x === awaySixYardBox.bottomLeft.x &&
      homeSixYardBox.topLeft.y === -awaySixYardBox.bottomLeft.y
  );
  logTestResult(
    "Symmetry Test Top-Right",
    homeSixYardBox.topRight.x === awaySixYardBox.bottomRight.x &&
      homeSixYardBox.topRight.y === -awaySixYardBox.bottomRight.y
  );
  logTestResult(
    "Symmetry Test Bottom-Left",
    homeSixYardBox.bottomLeft.x === awaySixYardBox.topLeft.x &&
      homeSixYardBox.bottomLeft.y === -awaySixYardBox.topLeft.y
  );
  logTestResult(
    "Symmetry Test Bottom-Right",
    homeSixYardBox.bottomRight.x === awaySixYardBox.topRight.x &&
      homeSixYardBox.bottomRight.y === -awaySixYardBox.topRight.y
  );
}

// Test 7: Center Circle
function testCenterCircle() {
  console.log("Test 7: Center Circle...");

  const field = new Field(11);
  const centerCircle = field.getCenterCircle();
  logTestResult(
    "Center Circle",
    centerCircle.center.x === 0 &&
      centerCircle.center.y === 0 &&
      centerCircle.radius === field.centerCircleRadius
  );
}

// Test 8: Penalty Semi-Circle
function testPenaltySemiCircle() {
  console.log("Test 8: Penalty Semi-Circle...");

  const field = new Field(11);
  const homePenaltySemiCircle = field.getPenaltySemiCircle("home");
  const awayPenaltySemiCircle = field.getPenaltySemiCircle("away");

  logTestResult(
    "Home Penalty Semi-Circle",
    homePenaltySemiCircle.center.y ===
      -field.length / 2 + field.penaltyBoxLength
  );
  logTestResult(
    "Away Penalty Semi-Circle",
    awayPenaltySemiCircle.center.y === field.length / 2 - field.penaltyBoxLength
  );
}

// Test 9: Penalty Spot
function testPenaltySpot() {
  console.log("Test 9: Penalty Spot...");

  const field = new Field(11);
  const homePenaltySpot = field.getPenaltySpot("home");
  const awayPenaltySpot = field.getPenaltySpot("away");

  logTestResult(
    "Home Penalty Spot",
    homePenaltySpot.y === -field.length / 2 + field.penaltyBoxLength
  );
  logTestResult(
    "Away Penalty Spot",
    awayPenaltySpot.y === field.length / 2 - field.penaltyBoxLength
  );
}

// Test 10: Corner Circle
function testCornerCircle() {
  console.log("Test 10: Corner Circle...");

  const field = new Field(11);
  const topLeftCornerCircle = field.getCornerCircle("left", "top");
  const bottomRightCornerCircle = field.getCornerCircle("right", "bottom");
  const bottomLeftCornerCircle = field.getCornerCircle("left", "bottom");
  const topRightCornerCircle = field.getCornerCircle("right", "top");

  logTestResult(
    "Top-Left Corner Circle",
    topLeftCornerCircle.center.x === -field.width / 2 &&
      topLeftCornerCircle.center.y === field.length / 2
  );
  logTestResult(
    "Bottom-Right Corner Circle",
    bottomRightCornerCircle.center.x === field.width / 2 &&
      bottomRightCornerCircle.center.y === -field.length / 2
  );
  logTestResult(
    "Bottom-Left Corner Circle",
    bottomLeftCornerCircle.center.x === -field.width / 2 &&
      bottomLeftCornerCircle.center.y === -field.length / 2
  );
  logTestResult(
    "Top-Right Corner Circle",
    topRightCornerCircle.center.x === field.width / 2 &&
      topRightCornerCircle.center.y === field.length / 2
  );
  logTestResult(
    "Corner Circle Radius",
    topLeftCornerCircle.radius === field.cornerCircleRadius &&
      bottomRightCornerCircle.radius === field.cornerCircleRadius &&
      bottomLeftCornerCircle.radius === field.cornerCircleRadius &&
      topRightCornerCircle.radius === field.cornerCircleRadius
  );
}

// Run all tests
const runFieldTests = async () => {
  console.log("Starting Field Class Tests...");

  try {
    testFieldDimensions();
    testCenterPosition();
    testCoordinateSystem();
    testFieldZones();
    testPenaltyAreas();
    testSixYardBoxSymmetry();
    testCenterCircle();
    testPenaltySemiCircle();
    testPenaltySpot();
    testCornerCircle();

    console.log(
      `Field Class Tests Completed. ${failedTests}/${totalTests} tests failed.`
    );
  } catch (error) {
    console.error("Error during field tests: ", error);
  }
};

runFieldTests();
