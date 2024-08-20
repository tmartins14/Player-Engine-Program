const Field = require("../components/Field");
const Ball = require("../components/Ball");

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

// Test 1: Ball Initialization
function testBallInitialization() {
  console.log("Test 1: Ball Initialization...");

  const field = new Field(11); // 11v11 field
  const ball = new Ball(field);

  logTestResult(
    "Initial Position",
    ball.position.x === field.width / 2 && ball.position.y === field.length / 2
  );
  logTestResult(
    "Initial Velocity",
    ball.velocity.x === 0 && ball.velocity.y === 0
  );
  logTestResult("Initial Carrier", ball.carrier === null);
  logTestResult("Initial Loose Ball", ball.isLoose === true);
  logTestResult("Initial Shot", ball.isShot === false);
}

// Test 2: Ball Reset
function testBallReset() {
  console.log("Test 2: Ball Reset...");

  const field = new Field(11);
  const ball = new Ball(field);
  ball.resetBall();

  logTestResult(
    "Reset Position",
    ball.position.x === field.width / 2 && ball.position.y === field.length / 2
  );
  logTestResult(
    "Reset Velocity",
    ball.velocity.x === 0 && ball.velocity.y === 0
  );
  logTestResult("Reset Carrier", ball.carrier === null);
  logTestResult("Reset Loose Ball", ball.isLoose === true);
  logTestResult("Reset Shot", ball.isShot === false);
}

// Test 3: Goal Kick Reset
function testGoalKickReset() {
  console.log("Test 3: Goal Kick Reset...");

  const field = new Field(11);
  const ball = new Ball(field);
  ball.resetForGoalKick("home");

  const boxEdge = field.length * 0.05;
  const boxWidth = field.width * 0.26;

  logTestResult("Goal Kick Position Y", ball.position.y === boxEdge);
  logTestResult(
    "Goal Kick Position X",
    ball.position.x >= (field.width - boxWidth) / 2 &&
      ball.position.x <= (field.width + boxWidth) / 2
  );
}

// Test 4: Corner Kick Reset
function testCornerKickReset() {
  console.log("Test 4: Corner Kick Reset...");

  const field = new Field(11);
  const ball = new Ball(field);
  ball.resetForCornerKick("home", "left");

  logTestResult(
    "Corner Kick Position",
    ball.position.x === 0 && ball.position.y === 0
  );

  ball.resetForCornerKick("away", "right");

  logTestResult(
    "Corner Kick Position Away",
    ball.position.x === field.width && ball.position.y === field.length
  );
}

// Test 5: Free Kick Reset
function testFreeKickReset() {
  console.log("Test 5: Free Kick Reset...");

  const field = new Field(11);
  const ball = new Ball(field);
  const freeKickPosition = { x: 30, y: 50 };
  ball.resetForFreeKick(freeKickPosition);

  logTestResult(
    "Free Kick Position",
    ball.position.x === freeKickPosition.x &&
      ball.position.y === freeKickPosition.y
  );
}

// Test 6: Throw-In Reset
function testThrowInReset() {
  console.log("Test 6: Throw-In Reset...");

  const field = new Field(11);
  const ball = new Ball(field);
  const throwInPosition = { x: 10, y: 70 };
  ball.resetForThrowIn(throwInPosition);

  logTestResult(
    "Throw-In Position",
    ball.position.x === throwInPosition.x &&
      ball.position.y === throwInPosition.y
  );
}

// Test 7: Ball Kick
function testBallKick() {
  console.log("Test 7: Ball Kick...");

  const field = new Field(11);
  const ball = new Ball(field);
  const targetPosition = { x: 80, y: 100 };
  const power = 50;

  ball.kick(targetPosition, power);

  const direction = {
    x: targetPosition.x - ball.position.x,
    y: targetPosition.y - ball.position.y,
  };
  const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);

  logTestResult(
    "Ball Kick Velocity X",
    ball.velocity.x === (direction.x / magnitude) * power
  );
  logTestResult(
    "Ball Kick Velocity Y",
    ball.velocity.y === (direction.y / magnitude) * power
  );
  logTestResult("Ball Loose After Kick", ball.isLoose === true);
  logTestResult("Ball No Carrier After Kick", ball.carrier === null);
}

// Test 8: Change Carrier
function testChangeCarrier() {
  console.log("Test 8: Change Carrier...");

  const field = new Field(11);
  const ball = new Ball(field);
  const player = { id: 1, name: "John Doe" };

  ball.changeCarrier(player);

  logTestResult("Ball Controlled by Player", ball.carrier === player);
  logTestResult("Ball Not Loose", ball.isLoose === false);

  ball.changeCarrier(null);

  logTestResult("Ball Not Controlled by Player", ball.carrier === null);
  logTestResult("Ball Loose After Release", ball.isLoose === true);
}

// Test 9: Stop Ball
function testStopBall() {
  console.log("Test 9: Stop Ball...");

  const field = new Field(11);
  const ball = new Ball(field);

  ball.setVelocity({ x: 30, y: 40 });
  ball.stop();

  logTestResult("Ball Velocity X After Stop", ball.velocity.x === 0);
  logTestResult("Ball Velocity Y After Stop", ball.velocity.y === 0);
}

// Run all tests
const runBallTests = () => {
  console.log("Starting Ball Class Tests...");

  try {
    testBallInitialization();
    testBallReset();
    testGoalKickReset();
    testCornerKickReset();
    testFreeKickReset();
    testThrowInReset();
    testBallKick();
    testChangeCarrier();
    testStopBall();

    console.log(
      `Ball Class Tests Completed. ${failedTests}/${totalTests} tests failed.`
    );
  } catch (error) {
    console.error("Error during ball tests:", error);
  }
};

runBallTests();
