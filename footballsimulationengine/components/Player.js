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
  decideAction(ball, opponents) {}

  // Might be redundant depending on what decideAction becomes
  shootOrPass(ball, passingStrategy) {}

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

  dribbleBall(targetPosition) {
    // Calculate the direction towards the target position
    const direction = {
      x: targetPosition.x - this.currentPosition.x,
      y: targetPosition.y - this.currentPosition.y,
    };

    const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);

    // Adjust the player's position towards the target position based on dribbling pace
    const speed = this.stats.dribbling * 0.1; // Dribbling speed as a factor of dribbling stat

    this.currentPosition.x += (direction.x / magnitude) * speed;
    this.currentPosition.y += (direction.y / magnitude) * speed;

    // Check if the player has reached the target position
    const distanceToTarget = this.calculateDistance(
      this.currentPosition,
      targetPosition
    );
    if (distanceToTarget < speed) {
      this.currentPosition = { ...targetPosition };
      console.log(
        `${this.name} has successfully dribbled to the target position.`
      );
    } else {
      console.log(`${this.name} is dribbling towards the target position.`);
    }
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
