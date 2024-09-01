const Field = require("./Field");

class Player {
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

  // Method to set the player's position on the field
  setPosition(position) {
    if (position && this.field.isWithinBounds(position)) {
      this.currentPosition = position;
      return true; // Indicate that the position was successfully set
    } else {
      console.error("Position is out of bounds or invalid.");
      return false; // Indicate that the position was not set
    }
  }

  // Method to check if the player is offside
  checkOffside(ball, lastDefenderPosition) {
    if (
      this.currentPosition.y > ball.position.y && // Player is ahead of the ball
      this.currentPosition.y > lastDefenderPosition.y && // Player is ahead of the last defender
      this.currentPosition.y > 0 // Player is in the opponent's half
    ) {
      return true;
    }
    return false;
  }

  setTeam(team) {
    this.team = team;
  }

  updateTeamInstructions(instructions) {
    this.teamInstructions = instructions;
  }

  decideAction(ball, opponents) {
    const { role, aggression, passingStrategy } = this.teamInstructions;

    if (role === "attacker" && this.hasBall) {
      this.shootOrPass(ball, passingStrategy);
    } else if (role === "defender" && !this.hasBall) {
      this.performDefensiveAction(opponents, ball);
    } else if (role === "midfielder") {
      this.midfielderAction(ball, opponents, aggression, passingStrategy);
    } else {
      this.defaultAction();
    }
  }

  shootOrPass(ball, passingStrategy) {
    if (passingStrategy === "direct") {
      this.shoot(ball);
    } else if (passingStrategy === "possession") {
      this.passBall();
    }
  }

  midfielderAction(ball, opponents, aggression, passingStrategy) {
    if (aggression > 50) {
      this.performDefensiveAction(opponents, ball);
    } else {
      this.shootOrPass(ball, passingStrategy);
    }
  }

  defaultAction() {
    console.log(`${this.name} is holding position.`);
  }

  shoot(ball) {
    console.log(`${this.name} takes a shot!`);
    // Placeholder logic for shooting
  }

  passBall() {
    console.log(`${this.name} makes a pass!`);
    // Placeholder logic for passing
  }

  // Defensive Action Methods
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
    console.log(`${this.name} intercepts the ball!`);
    // Logic to perform interception
  }

  canSlideTackle(opponents, ball) {
    const opponentWithBall = opponents.find((opponent) => opponent.hasBall);
    return opponentWithBall && this.isOpponentInVicinity(opponentWithBall, 1.0); // Full vicinity
  }

  canStandingTackle(opponents, ball) {
    const opponentWithBall = opponents.find((opponent) => opponent.hasBall);
    return opponentWithBall && this.isOpponentInVicinity(opponentWithBall, 0.1); // 10% vicinity
  }

  tackle(opponents, ball, isSlideTackle) {
    const foulProbability = 0.2; // 20% chance that a tackle results in a foul
    const isFoul = Math.random() < foulProbability;

    if (isFoul) {
      console.log(
        `${this.name} commits a foul during a ${
          isSlideTackle ? "slide" : "standing"
        } tackle!`
      );
      return true; // Indicate that a foul occurred
    } else {
      console.log(
        `${this.name} successfully performs a ${
          isSlideTackle ? "slide" : "standing"
        } tackle!`
      );
      // Logic for successful tackle
      return false;
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

  // Helper Methods
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

  // Other methods
  moveToFormationPosition() {
    if (this.formationPosition) {
      this.currentPosition = { ...this.formationPosition };
    }
  }

  moveToOnsidePosition() {
    // Placeholder for moving the player to an onside position
  }

  moveToWithinBoundaries() {
    if (!this.isWithinBoundaries()) {
      // Placeholder for moving the player within the field boundaries
    }
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
}

// Enum-like objects for ball and player states
const BallState = {
  IN_PLAY: "in_play",
  DEAD: "dead",
};

const PlayerState = {
  HAS_BALL: "has_ball",
  TEAM_HAS_BALL: "team_has_ball",
  OPPONENT_HAS_BALL: "opponent_has_ball",
};

module.exports = Player;
