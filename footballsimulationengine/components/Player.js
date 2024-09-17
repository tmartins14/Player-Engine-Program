/*
 * Table of Contents:
 * 1. Initialization and Setup
 * 2. Team Settings
 * 3. Decision Making
 * 4. Ball Handling and Shooting
 * 5. Defensive Actions
 * 6. Positioning and Movement
 * 7. Competency Checks
 * 8. Helper Methods
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
    return { x: 0, y: -field.length / 4 }; // Example: halfway on their side of the field
  }

  // 2. Team Settings
  setTeam(team) {
    this.team = team;
  }

  setPosition(position) {
    if (position && this.field.isWithinBounds(position)) {
      this.currentPosition = position;
      return true;
    } else {
      console.error("Position is out of bounds or invalid.");
      return false;
    }
  }

  updateTeamInstructions(instructions) {
    this.teamInstructions = instructions;
  }

  // 3. Decision Making
  decideAction(ball, opponents) {
    if (this.hasBall) {
      this.decideActionWithBall(ball, opponents);
    } else if (ball.carrier && ball.carrier.teamId === this.teamId) {
      this.decideActionWithoutBallInPossession();
    } else if (!ball.carrier || ball.carrier.teamId !== this.teamId) {
      this.decideActionWithoutBallOutOfPossession(ball, opponents);
    } else if (!ball.isInPlay) {
      this.decideActionDuringDeadBall();
    } else {
      this.actionHoldPosition();
    }
  }
  decideActionWithBall(ball, opponents) {
    const { passingStyle = "default", tempo = "normal" } =
      this.teamInstructions || {};

    if (this.shouldShoot(ball)) {
      this.actionShoot(ball);
    } else if (this.shouldPass(ball, opponents)) {
      this.actionPass();
    } else {
      this.actionDribble(ball, opponents);
    }
  }

  decideActionWithoutBallInPossession() {
    const { offensiveRuns = "normal" } = this.teamInstructions || {};

    if (this.shouldMakeRun()) {
      this.actionMakeRun();
    } else {
      this.actionFindSpace();
    }
  }

  decideActionWithoutBallOutOfPossession(ball, opponents) {
    const { pressingIntensity = "normal" } = this.teamInstructions || {};

    if (this.shouldPress(ball)) {
      this.actionPress(ball);
    } else {
      this.actionDropIntoDefense();
    }
  }

  decideActionDuringDeadBall() {
    const { setPieceFocus = "balanced" } = this.teamInstructions || {};

    if (this.isAttackingSetPiece()) {
      this.actionMoveToAttackingSetPiecePosition();
    } else {
      this.actionMoveToDefensiveSetPiecePosition();
    }
  }

  //4. "Should" Methods
  shouldShoot(ball) {
    const { shootingPreference = "balanced" } = this.teamInstructions || {};

    // Use the player's team to find the opponent's goal position
    const opponentGoalPosition = this.field.getOpponentGoalPosition(
      this.team.name
    );

    const distanceToGoal = this.calculateDistance(
      this.currentPosition,
      opponentGoalPosition
    );

    // Decision logic based on team instructions and player's shooting stats
    if (shootingPreference === "aggressive" && distanceToGoal < 25) {
      return true;
    } else if (
      shootingPreference === "balanced" &&
      distanceToGoal < 20 &&
      this.stats.shooting > 70
    ) {
      return true;
    } else if (
      shootingPreference === "conservative" &&
      distanceToGoal < 15 &&
      this.stats.shooting > 80
    ) {
      return true;
    }

    return false;
  }

  shouldPass(ball, opponents) {
    const { passingStyle = "short" } = this.teamInstructions || {};

    const nearestTeammate = this.findBestTeammateToPass(this.team.players);
    if (!nearestTeammate) return false;

    const distanceToTeammate = this.calculateDistance(
      this.currentPosition,
      nearestTeammate.currentPosition
    );

    // Decision logic based on team instructions and player's passing stats
    if (
      passingStyle === "short" &&
      distanceToTeammate < 20 &&
      this.stats.passing > 60
    ) {
      return true;
    } else if (
      passingStyle === "direct" &&
      distanceToTeammate < 40 &&
      this.stats.passing > 70
    ) {
      return true;
    } else if (
      passingStyle === "long" &&
      distanceToTeammate < 50 &&
      this.stats.passing > 80
    ) {
      return true;
    }

    return false;
  }

  shouldMakeRun() {
    const { offensiveRuns = "balanced" } = this.teamInstructions || {};

    // Decision logic based on team instructions and player's pace and positioning
    if (offensiveRuns === "aggressive" && this.stats.pace > 70) {
      return true;
    } else if (
      offensiveRuns === "balanced" &&
      this.stats.pace > 60 &&
      !this.isOffside
    ) {
      return true;
    } else if (
      offensiveRuns === "conservative" &&
      this.stats.pace > 50 &&
      this.isInFormationPosition()
    ) {
      return true;
    }

    return false;
  }

  shouldPress(ball) {
    const { pressingIntensity = "medium" } = this.teamInstructions || {};

    const distanceToBall = this.calculateDistance(
      this.currentPosition,
      ball.position
    );

    // Decision logic based on team instructions and player's defending skill
    if (
      pressingIntensity === "high" &&
      distanceToBall < 15 &&
      this.stats.defending > 70
    ) {
      return true;
    } else if (
      pressingIntensity === "medium" &&
      distanceToBall < 20 &&
      this.stats.defending > 60
    ) {
      return true;
    } else if (
      pressingIntensity === "low" &&
      distanceToBall < 25 &&
      this.stats.defending > 50
    ) {
      return true;
    }

    return false;
  }

  // 5. Ball Handling and Shooting
  actionShoot(ball) {
    console.log(`${this.name} shoots the ball!`);
  }

  actionPass() {
    console.log(`${this.name} passes the ball.`);
  }

  actionDribble(ball, opponents) {
    let targetPosition;

    if (this.shouldDribbleIntoSpace(opponents)) {
      targetPosition = this.findSpace(opponents);
    } else if (this.shouldTakeOnDefender(opponents)) {
      targetPosition = this.actionTakeOnDefender(opponents);
    } else if (this.shouldDribbleOutOfPress(opponents)) {
      targetPosition = this.actionEscapePress(opponents);
    } else {
      this.actionPass();
      return;
    }

    this.actionMoveTowardsTarget(targetPosition);
  }

  actionMoveTowardsTarget(targetPosition) {
    const direction = {
      x: targetPosition.x - this.currentPosition.x,
      y: targetPosition.y - this.currentPosition.y,
    };

    const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);
    const speed = this.stats.dribbling * 0.1;

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

  actionTakeOnDefender(opponents) {
    const defender = this.findNearestOpponent(opponents);
    const offset = 2;
    const targetPosition = {
      x: defender.currentPosition.x + offset,
      y: defender.currentPosition.y,
    };
    return this.field.isWithinBounds(targetPosition)
      ? targetPosition
      : this.currentPosition;
  }

  actionEscapePress(opponents) {
    const escapeRoute = {
      x: this.currentPosition.x,
      y: this.currentPosition.y + 10,
    };
    return this.field.isWithinBounds(escapeRoute)
      ? escapeRoute
      : this.currentPosition;
  }

  actionMakeRun() {
    console.log(`${this.name} makes a run into space.`);
  }

  actionFindSpace() {
    console.log(`${this.name} finds space and offers support.`);
  }

  actionPress(ball) {
    console.log(`${this.name} is pressing the opponent.`);
  }

  actionDropIntoDefense() {
    console.log(`${this.name} drops into a defensive position.`);
  }

  actionHoldPosition() {
    console.log(`${this.name} is holding position.`);
  }

  // 6. Defensive Actions
  actionPerformDefensiveAction(opponents, ball) {
    const vicinityRadius = this.calculateDefensiveVicinityRadius(this.field);
    const ballDistance = this.calculateDistance(
      this.currentPosition,
      ball.position
    );

    if (ballDistance <= vicinityRadius) {
      if (this.canIntercept(ball)) {
        this.actionIntercept(ball);
      } else if (this.canSlideTackle(opponents, ball)) {
        const isFoul = this.actionTackle(opponents, ball, true);
        if (isFoul) return true;
      } else if (this.canStandingTackle(opponents, ball)) {
        const isFoul = this.actionTackle(opponents, ball, false);
        if (isFoul) return true;
      } else if (this.canBlockShot(ball)) {
        this.actionBlockShot(ball);
      } else if (this.canClear(ball)) {
        this.actionClearBall(ball);
      }
    }
    return false;
  }

  actionIntercept(ball) {
    console.log(`${this.name} intercepts the ball.`);
  }

  actionTackle(opponents, ball, isSlideTackle) {
    const foulProbability = 0.2;
    const isFoul = Math.random() < foulProbability;

    if (isFoul) {
      console.log(`${this.name} commits a foul.`);
      return true;
    } else {
      console.log(`${this.name} successfully tackles.`);
      return false;
    }
  }

  actionBlockShot(ball) {
    console.log(`${this.name} blocks the shot!`);
  }

  actionClearBall(ball) {
    console.log(`${this.name} clears the ball.`);
  }

  // 7. Positioning and Movement
  actionMoveToWithinBoundaries() {
    if (!this.isWithinBoundaries()) {
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

  // 8. Competency Checks
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
        this.actionHoldPosition();
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
        this.actionHoldPosition();
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
    // Handle player actions during a dead ball situation
    this.actionMoveToFormationPosition();
  }

  handleDeadBallTeamHasBallState(ball, team) {
    // Handle team actions during a dead ball situation
    this.actionMoveToFormationPosition();
  }

  handleDeadBallOpponentHasBallState(ball, team) {
    // Handle opponent actions during a dead ball situation
    this.actionMoveToFormationPosition();
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
      this.actionMoveToFormationPosition();
    }
  }

  checkOffsideCompetency(ball) {
    this.isOffside = this.isOffside(ball);
    if (this.isOffside) {
      this.actionMoveToOnsidePosition();
    }
  }

  checkBoundariesCompetency() {
    if (!this.isWithinBoundaries()) {
      this.actionMoveToWithinBoundaries();
    }
  }

  // 9. Helper Methods
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
    return true; // Placeholder for checking if the ball is in the player's path
  }

  isOpponentInVicinity(opponent, vicinityMultiplier) {
    const opponentDistance = this.calculateDistance(
      this.currentPosition,
      opponent.currentPosition
    );
    const vicinityRadius = this.calculateDefensiveVicinityRadius(this.field);
    return opponentDistance <= vicinityRadius * vicinityMultiplier;
  }

  isInFormation(formation) {
    // Placeholder for checking if the player is in the right formation position
    return true;
  }

  isTowardsOpponentGoal(ball) {
    // Placeholder logic for determining if the shot is towards the opponent's goal
    return true;
  }

  findNearestTeammate(teammates) {
    // Placeholder for finding the nearest teammate
    return teammates[0]; // Example: return the first teammate
  }

  findNearestOpponent(opponents) {
    // Placeholder for finding the nearest opponent
    return opponents[0]; // Example: return the first opponent
  }

  calculateAngle(position1, position2, opponentPosition) {
    // Placeholder for calculating the angle between players and opponents
    return 90; // Example: return a fixed angle for simplicity
  }

  hasDirectLine(teammate) {
    // Placeholder logic for checking if there's a direct line to the teammate
    return true;
  }

  stopPassing() {
    console.log(`${this.name} stops passing.`);
  }

  stopShooting() {
    console.log(`${this.name} stops shooting.`);
  }

  stopDefensiveAction() {
    console.log(`${this.name} stops defending.`);
  }

  isWithinBoundaries() {
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
    return (
      this.position === "attacker" &&
      this.currentPosition.x > ball.position.x &&
      !this.hasBall
    );
  }
}

module.exports = Player;
