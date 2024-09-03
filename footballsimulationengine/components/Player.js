/*
 * Table of Contents:
 * 1. Initialization and Setup
 * 2. Team Instructions and Actions
 * 3. Ball Handling and Shooting
 * 4. Defensive Actions
 * 5. Positioning and Movement
 * 6. Competency Checks
 * 7. Helper Methods
 */

const Field = require("./Field");

class Player {
  // 1. Initialization and Setup
  constructor({
    name,
    teamId,
    position,
    stats, // Consolidated player stats object
    fitness = 100,
    injured = false,
    hasBall = false,
    isOffside = false,
    field = new Field(11), // Default to an 11v11 field
    team = null,
    teamInstructions = {}, // Team instructions passed by the Team class
  }) {
    this.name = name;
    this.teamId = teamId;
    this.position = position;
    this.stats = {
      rating: stats.rating,
      pace: stats.pace,
      shooting: stats.shooting,
      dribbling: stats.dribbling,
      defending: stats.defending,
      passing: stats.passing,
      physical: stats.physical,
      saving: stats.saving,
    };
    this.fitness = fitness;
    this.injured = injured;
    this.hasBall = hasBall;
    this.isOffside = isOffside;
    this.currentPosition = this.initializePosition(field); // Will be set by the Team class
    this.field = field; // The field on which the player is playing
    this.team = null; // Will be set by the Team class
    this.teamInstructions = null; // Will be set by the Team class
  }

  initializePosition(field) {
    // Initialize player to a default position based on the field
    // For simplicity, we can place the player at the center of their half
    return { x: 0, y: -field.length / 4 }; // For example, halfway on their side of the field
  }

  setTeam(team) {
    this.team = team;
  }

  setPosition(position) {
    if (position && this.field.isWithinBounds(position)) {
      this.currentPosition = position;
      return true; // Indicate that the position was successfully set
    } else {
      console.error("Position is out of bounds or invalid.");
      return false; // Indicate that the position was not set
    }
  }

  // 2. Team Instructions and Actions
  updateTeamInstructions(instructions) {
    this.teamInstructions = instructions;
  }

  // Probably the most important method in this class.
  decideAction(ball, opponents, teammates) {
    // Step 1: Assess the Current Situation
    const inShootingRange = this.isInShootingRange();
    const underPressure = this.isUnderPressure(opponents);
    const openSpace = this.findSpace(opponents);
    const teammateInBetterPosition = this.findBestTeammateToPass(teammates);

    // Step 2: Determine Possible Actions
    let action;

    if (inShootingRange && !underPressure) {
      action = "shoot";
    } else if (teammateInBetterPosition && !underPressure) {
      action = "pass";
    } else if (openSpace) {
      action = "dribble";
    } else {
      action = "holdPosition";
    }

    // Step 3: Adjust Action Based on Team Tactics and Instructions
    if (
      this.teamInstructions.passingStrategy === "possession" &&
      action !== "shoot"
    ) {
      action = "pass";
    } else if (this.teamInstructions.dribblingTactic && action === "dribble") {
      action = "dribble";
    } else if (this.teamInstructions.shootingTactic && action === "shoot") {
      action = "shoot";
    }

    // Step 4: Execute the Best Action
    switch (action) {
      case "shoot":
        this.shootBall(ball);
        break;
      case "pass":
        this.passBall(teammateInBetterPosition);
        break;
      case "dribble":
        this.dribbleBall(ball, opponents, openSpace);
        break;
      default:
        this.holdPosition();
        break;
    }
  }

  // Helper methods to assess the situation
  isInShootingRange() {
    // Determine if the player is in a good position to shoot
    // E.g., within a certain distance of the opponent's goal
    const goalDistance = this.calculateDistance(
      this.currentPosition,
      this.field.getOpponentGoalPosition()
    );
    return goalDistance < 20; // Example threshold for shooting range
  }

  isUnderPressure(opponents) {
    // Determine if the player is under pressure from opponents
    const pressureRadius = 5; // Example radius within which opponents are considered to apply pressure
    return opponents.some(
      (opponent) =>
        this.calculateDistance(this.currentPosition, opponent.currentPosition) <
        pressureRadius
    );
  }

  findBestTeammateToPass(teammates) {
    // Logic to find the best-positioned teammate to pass the ball
    // Consider proximity, angle, and team instructions (e.g., passing strategy)
    let bestTeammate = null;
    let bestPosition = Number.MAX_SAFE_INTEGER;

    teammates.forEach((teammate) => {
      const distanceToTeammate = this.calculateDistance(
        this.currentPosition,
        teammate.currentPosition
      );
      if (
        distanceToTeammate < bestPosition &&
        this.hasClearPassingLane(teammate)
      ) {
        bestTeammate = teammate;
        bestPosition = distanceToTeammate;
      }
    });

    return bestTeammate;
  }

  hasClearPassingLane(teammate) {
    // Logic to determine if there is a clear lane to pass to a teammate
    // Could involve checking for opponents in the path
    return !this.opponentInPath(teammate);
  }

  opponentInPath(teammate) {
    // Placeholder for checking if an opponent is in the passing lane
    return false;
  }

  dribbleBall(ball, opponents, space) {
    // Logic for dribbling into space
    this.moveTowardsTarget(space);
  }

  // Might be redundant depending on what decideAction becomes
  // shootOrPass(ball, passingStrategy) {}

  // Default action - hold position
  holdPosition() {
    console.log(`${this.name} is holding position.`);
  }

  // 3. Ball Handling and Shooting
  shootBall(ball) {
    // Placeholder logic for shooting
  }

  passBall() {
    // Placeholder logic for passing
  }

  // 3. Ball Handling and Shooting
  dribbleBall(ball, opponents) {
    let targetPosition;

    if (this.shouldDribbleIntoSpace(opponents)) {
      targetPosition = this.findSpace(opponents);
    } else if (this.shouldTakeOnDefender(opponents)) {
      targetPosition = this.takeOnDefender(opponents);
    } else if (this.shouldDribbleOutOfPress(opponents)) {
      targetPosition = this.escapePress(opponents);
    } else {
      // Default fallback action (e.g., pass the ball or hold position)
      this.passBall();
      return;
    }

    this.moveTowardsTarget(targetPosition);
  }

  moveTowardsTarget(targetPosition) {
    const direction = {
      x: targetPosition.x - this.currentPosition.x,
      y: targetPosition.y - this.currentPosition.y,
    };

    const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);
    const speed = this.stats.dribbling * 0.1; // Dribbling speed

    this.currentPosition.x += (direction.x / magnitude) * speed;
    this.currentPosition.y += (direction.y / magnitude) * speed;

    const distanceToTarget = this.calculateDistance(
      this.currentPosition,
      targetPosition
    );
    if (distanceToTarget < speed) {
      this.currentPosition = { ...targetPosition };
      console.log(`${this.name} has dribbled to the target position.`);
    } else {
      console.log(`${this.name} is dribbling towards the target position.`);
    }
  }

  // Additional logic for deciding when to dribble
  shouldDribble(opponents) {
    // Determine whether dribbling is the best option
    return (
      this.stats.dribbling > 50 &&
      this.teamInstructions.dribble === "encouraged"
    );
  }

  shouldDribbleIntoSpace(opponents) {
    // Logic to decide if the player should dribble into open space
    const space = this.findSpace();
    return space && this.stats.pace > 60; // High pace players exploit space better
  }

  shouldTakeOnDefender(opponents) {
    // Logic to decide if the player should take on a defender
    const nearbyOpponent = this.findNearestOpponent(opponents);
    return (
      nearbyOpponent && this.stats.dribbling > nearbyOpponent.stats.defending
    );
  }

  shouldDribbleOutOfPress(opponents) {
    // Logic to decide if the player should dribble out of a press
    const pressure = this.calculatePressure(opponents);
    return pressure > 50;
    // && this.stats.composure > 60; // High composure players can dribble under pressure
  }

  findSpace(opponents) {
    const searchRadius = 20; // The radius within which to search for open space (can be adjusted)
    const angleIncrement = 15; // How many degrees to increment per search step

    let bestSpace = null;
    let maxDistance = 0;

    // Scan forward in a semicircle in front of the player
    for (let angle = -90; angle <= 90; angle += angleIncrement) {
      const radian = (angle * Math.PI) / 180;
      const potentialSpace = {
        x: this.currentPosition.x + searchRadius * Math.cos(radian),
        y: this.currentPosition.y + searchRadius * Math.sin(radian),
      };

      if (
        this.field.isWithinBounds(potentialSpace) &&
        !this.isSpaceOccupied(potentialSpace, opponents)
      ) {
        const distance = this.calculateDistance(
          this.currentPosition,
          potentialSpace
        );
        if (distance > maxDistance) {
          bestSpace = potentialSpace;
          maxDistance = distance;
        }
      }
    }

    // Return the best space found, or the current position if no space is found
    return bestSpace || this.currentPosition;
  }

  // Helper method to check if a given space is occupied by an opponent
  isSpaceOccupied(position, opponents) {
    const vicinityRadius = 2; // Define a radius to consider the space occupied

    return opponents.some((opponent) => {
      return (
        this.calculateDistance(position, opponent.currentPosition) <
        vicinityRadius
      );
    });
  }

  takeOnDefender(opponents) {
    // Identify the nearest defender and decide on a dribbling move
    const defender = this.findNearestOpponent(opponents);
    const offset = 2; // Attempt to dribble around the defender
    const targetPosition = {
      x: defender.currentPosition.x + offset,
      y: defender.currentPosition.y,
    };
    return this.field.isWithinBounds(targetPosition)
      ? targetPosition
      : this.currentPosition;
  }

  escapePress(opponents) {
    // Dribble out of a press by moving to the least congested area
    const escapeRoute = {
      x: this.currentPosition.x,
      y: this.currentPosition.y + 10,
    }; // Placeholder logic
    return this.field.isWithinBounds(escapeRoute)
      ? escapeRoute
      : this.currentPosition;
  }

  calculatePressure(opponents) {
    // Evaluate how many opponents are close to the player
    const vicinity = 5; // Vicinity range to consider for pressure
    let pressure = 0;
    opponents.forEach((opponent) => {
      if (
        this.calculateDistance(this.currentPosition, opponent.currentPosition) <
        vicinity
      ) {
        pressure += 20; // Each opponent adds to the pressure
      }
    });
    return pressure;
  }

  // 4. Defensive Actions
  performDefensiveAction(opponents, ball) {
    const vicinityRadius = this.calculateDefensiveVicinityRadius(this.field);
    const successProbability = 0.8; // Fixed probability of successfully completing an action

    const ballDistance = this.calculateDistance(
      this.currentPosition,
      ball.position
    );

    // Check if the ball is within the player's vicinity
    if (ballDistance <= vicinityRadius) {
      const randomFactor = Math.random();

      if (randomFactor <= successProbability) {
        if (this.canIntercept(ball)) {
          this.intercept(ball);
        } else if (this.canSlideTackle(opponents, ball)) {
          const isFoul = this.tackle(opponents, ball, true);
          if (isFoul) return true;
        } else if (this.canStandingTackle(opponents, ball)) {
          const isFoul = this.tackle(opponents, ball, false);
          if (isFoul) return true;
        } else if (this.canBlockShot(ball)) {
          this.blockShot(ball);
        } else if (this.canClear(ball)) {
          this.clearBall(ball);
        }
      }
    }
    return false;
  }

  canIntercept(ball) {
    // Logic to determine if the player can intercept the ball
    return this.isBallInPath(ball) && !ball.carrier; // Example condition
  }

  intercept(ball) {
    // Logic to perform interception
    // Set playerState.HAS_BALL = true?
  }

  // Will need updating to account for velocity of player
  canSlideTackle(opponents, ball) {
    const opponentWithBall = opponents.find((opponent) => opponent.hasBall);
    return opponentWithBall && this.isOpponentInVicinity(opponentWithBall, 1.0); // Full vicinity
  }

  canStandingTackle(opponents, ball) {
    const opponentWithBall = opponents.find((opponent) => opponent.hasBall);
    return opponentWithBall && this.isOpponentInVicinity(opponentWithBall, 0.1); // 10% vicinity
  }

  // Needs updating
  tackle(opponents, ball, isSlideTackle) {
    const foulProbability = 0.2; // 20% chance that a tackle results in a foul
    const isFoul = Math.random() < foulProbability;

    if (isFoul) {
      playerState.HAS_BALL = false;
      ballState.DEAD = true;
      // return true; // Indicate that a foul occurred
    } else {
      playerState.HAS_BALL = true;
      ballState.IN_PLAY = true;
    }
  }

  canBlockShot(ball) {
    // Logic to determine if the player can block a shot
    return ball.isShot && this.isInFrontOfGoal(ball); // Example condition
  }

  blockShot(ball) {
    console.log(`${this.name} blocks the shot!`);
    // Logic to perform shot block
  }

  canClear(ball) {
    // Logic to determine if the player can clear the ball
    return ball.isLoose && this.isNearGoal(ball); // Example condition
  }

  clearBall(ball) {
    console.log(`${this.name} clears the ball!`);
    // Logic to perform clearance
  }

  // 5. Positioning and Movement
  moveToFormationPosition() {
    if (this.formationPosition) {
      this.currentPosition = { ...this.formationPosition };
    }
  }

  moveToOnsidePosition() {
    // Placeholder for moving the player to an onside position
    if (this.isOffside) {
      // Move the player to the last defender's position
      this.currentPosition.y = -1; // Example: move behind the last defender
    }
  }

  moveToWithinBoundaries() {
    if (!this.isWithinBoundaries()) {
      // Move the player within the field boundaries
      if (this.currentPosition.x < -this.field.width / 2) {
        this.currentPosition.x = -this.field.width / 2;
      } else if (this.currentPosition.x > this.field.width / 2) {
        this.currentPosition.x = this.field.width / 2;
      }
      if (this.currentPosition.y < -this.field.length / 2) {
        this.currentPosition.y = -this.field.length / 2;
      } else if (this.currentPosition.y > this.field.length / 2) {
        this.currentPosition.y = this.field.length / 2;
      }
    }
  }

  // 6. Competency Checks
  enforceCompetencies(ball, team) {
    const ballState = ball.isInPlay ? BallState.IN_PLAY : BallState.DEAD;
    const playerState = this.hasBall
      ? PlayerState.HAS_BALL
      : ball.carrier && ball.carrier.teamId === this.teamId
      ? PlayerState.TEAM_HAS_BALL
      : PlayerState.OPPONENT_HAS_BALL;

    switch (ballState) {
      case BallState.IN_PLAY:
        this.handleInPlayState(playerState, ball, team);
        break;
      case BallState.DEAD:
        this.handleDeadBallState(playerState, ball, team);
        break;
    }
  }

  handleInPlayState(playerState, ball, team) {
    switch (playerState) {
      case PlayerState.HAS_BALL:
        this.handleHasBallState(ball, team);
        break;
      case PlayerState.TEAM_HAS_BALL:
        this.handleTeamHasBallState(ball, team);
        break;
      case PlayerState.OPPONENT_HAS_BALL:
        this.handleOpponentHasBallState(ball, team);
        break;
      default:
        this.defaultAction();
        break;
    }
  }

  handleDeadBallState(playerState, ball, team) {
    switch (playerState) {
      case PlayerState.HAS_BALL:
        this.handleDeadBallHasBallState(ball, team);
        break;
      case PlayerState.TEAM_HAS_BALL:
        this.handleDeadBallTeamHasBallState(ball, team);
        break;
      case PlayerState.OPPONENT_HAS_BALL:
        this.handleDeadBallOpponentHasBallState(ball, team);
        break;
      default:
        this.defaultAction();
        break;
    }
  }

  handleHasBallState(ball, team) {
    // Handle player actions when they have the ball
    this.checkShotCompetency(ball);
    this.checkPassCompetency();
    this.checkOutletCompetency(team);
  }

  handleTeamHasBallState(ball, team) {
    // Handle player actions when their team has the ball
    this.checkFormationCompetency(team);
    this.checkBoundariesCompetency();
  }

  handleOpponentHasBallState(ball, team) {
    // Handle player actions when the opponent has the ball
    this.checkDefensiveCompetency(ball);
    this.checkOffsideCompetency(ball);
    this.checkBoundariesCompetency();
  }

  handleDeadBallHasBallState(ball, team) {
    // Handle player actions when they have the ball during a dead ball situation
    this.moveToFormationPosition();
  }

  handleDeadBallTeamHasBallState(ball, team) {
    // Handle player actions when their team has the ball during a dead ball situation
    this.moveToFormationPosition();
  }

  handleDeadBallOpponentHasBallState(ball, team) {
    // Handle player actions when the opponent has the ball during a dead ball situation
    this.moveToFormationPosition();
  }

  // Competency check methods
  checkDefensiveCompetency(ball) {
    if (
      this.teamId === ball.carrier.teamId &&
      this.isPerformingDefensiveAction()
    ) {
      this.stopDefensiveAction();
    }
  }

  checkPassCompetency() {
    if (this.isPassing() && this.passTarget.teamId !== this.teamId) {
      this.stopPassing();
    }
  }

  checkShotCompetency(ball) {
    if (this.isShooting() && !this.isTowardsOpponentGoal(ball)) {
      this.stopShooting();
    }
  }

  checkOutletCompetency(team) {
    if (this.hasBall) {
      const nearestTeammate = this.findNearestTeammate(team.players);
      const angle = this.calculateAngle(
        this.currentPosition,
        nearestTeammate.currentPosition,
        this.findNearestOpponent(team.opponents).currentPosition
      );
      if (
        !(60 <= angle && angle <= 150) ||
        !this.hasDirectLine(nearestTeammate)
      ) {
        this.stopPassing();
      }
    }
  }

  checkFormationCompetency(team) {
    if (!this.isInFormation(team.formation)) {
      this.moveToFormationPosition();
    }
  }

  checkOffsideCompetency(ball) {
    this.isOffside = this.isOffside(ball);
    if (this.isOffside) {
      this.moveToOnsidePosition();
    }
  }

  checkBoundariesCompetency() {
    if (!this.isWithinBoundaries()) {
      this.moveToWithinBoundaries();
    }
  }

  // 7. Helper Methods
  calculateDefensiveVicinityRadius(field) {
    const fieldSize = Math.min(field.width, field.length);
    const vicinityPercentage = 0.01; // Vicinity covers 1% of the smaller field dimension
    const baseRadius = fieldSize * vicinityPercentage;
    return baseRadius * (this.stats.defending / 100); // Adjust based on defending stat
  }

  calculateDistance(position1, position2) {
    return Math.sqrt(
      Math.pow(position2.x - position1.x, 2) +
        Math.pow(position2.y - position1.y, 2)
    );
  }

  isBallInPath(ball) {
    // Placeholder for checking if the ball is in the player's path
    return true;
  }

  isOpponentInVicinity(opponent, vicinityMultiplier) {
    const opponentDistance = this.calculateDistance(
      this.currentPosition,
      opponent.currentPosition
    );
    const vicinityRadius = this.calculateDefensiveVicinityRadius(this.field); // Use field size
    return opponentDistance <= vicinityRadius * vicinityMultiplier;
  }

  isInFrontOfGoal(ball) {
    // Placeholder logic for checking if the player is in front of the goal relative to the ball
    return true;
  }

  isNearGoal(ball) {
    // Placeholder logic for checking if the player is near the goal
    return true;
  }

  isWithinBoundaries() {
    // Handle case where currentPosition might still be null
    if (!this.currentPosition) {
      console.error("Current position is not set.");
      return false;
    }

    return (
      this.currentPosition.x >= -this.field.width / 2 &&
      this.currentPosition.x <= this.field.width / 2 &&
      this.currentPosition.y >= -this.field.length / 2 &&
      this.currentPosition.y <= this.field.length / 2
    );
  }

  isOffside(ball) {
    // Simplified offside logic
    return (
      this.position === "attacker" &&
      this.currentPosition.x > ball.position.x &&
      !this.hasBall
    );
  }
}

module.exports = Player;
