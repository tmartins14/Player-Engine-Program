// Player class should have multiple states:
// 1. Ball is in play
//  a. Player has the ball
//  b. Player does not have the ball and team has the ball
//  c. Player does not have the ball and team does not have the ball

// 2. Dead ball state
//  a. Player has the ball
//  b. Player does not have the ball and team has the ball
//  c. Player does not have the ball and team does not have the ball

const PlayerModel = require("../models/player");
const PlayerMovement = require("../models/playerMovement");

class Player {
  constructor({
    name,
    teamId,
    position,
    rating,
    pace,
    shooting,
    dribbling,
    defending,
    passing,
    physical,
    saving,
    fitness = 100,
    injured = false,
    hasBall = false,
    isOffside = false,
  }) {
    this.name = name;
    this.teamId = teamId;
    this.position = position;
    this.rating = rating;
    this.pace = pace;
    this.shooting = shooting;
    this.dribbling = dribbling;
    this.defending = defending;
    this.passing = passing;
    this.physical = physical;
    this.saving = saving;
    this.fitness = fitness;
    this.injured = injured;
    this.hasBall = hasBall;
    this.isOffside = isOffside;
    this.currentPosition = null; // Will be set by the team
    this.createNewPlayer(); // automatically adds player to database when player instance is created
  }

  // Database Methods
  async createNewPlayer() {
    try {
      const playerData = {
        name: this.name,
        team_id: this.teamId,
        position: this.position,
        rating: this.rating,
        pace: this.pace,
        shooting: this.shooting,
        dribbling: this.dribbling,
        defending: this.defending,
        passing: this.passing,
        physical: this.physical,
        saving: this.saving,
      };
      const newPlayer = await PlayerModel.create(playerData);
      this.playerId = newPlayer.player_id;
      console.log("New Player Created:", newPlayer);
    } catch (error) {
      console.error("Error creating new player:", error);
      throw error;
    }
  }

  async createPlayerMovement(movementData) {
    try {
      const newMovement = await PlayerMovement.create({
        ...movementData,
        player_id: this.playerId,
      });
      return newMovement;
    } catch (error) {
      console.error("Error creating player movement:", error);
      throw error;
    }
  }

  async getPlayerDetails() {
    try {
      const playerDetails = await PlayerModel.findByPk(this.playerId);
      return playerDetails;
    } catch (error) {
      console.error("Error fetching player details:", error);
      throw error;
    }
  }

  async getPlayerMovements() {
    try {
      const playerMovements = await PlayerMovement.findAll({
        where: { player_id: this.playerId },
      });
      return playerMovements;
    } catch (error) {
      console.error("Error fetching player movements:", error);
      throw error;
    }
  }

  async updatePlayerMovement(movementId, updatedData) {
    try {
      const movement = await PlayerMovement.findByPk(movementId);
      if (movement) {
        await movement.update(updatedData);
        return movement;
      } else {
        throw new Error("Movement not found");
      }
    } catch (error) {
      console.error("Error updating player movement:", error);
      throw error;
    }
  }

  // Player Class Helper Methods
  calculateDefensiveVicinityRadius(field) {
    const fieldSize = Math.min(field.width, field.length);
    const vicinityPercentage = 0.01; // Vicinity covers 1% of the smaller field dimension
    const baseRadius = fieldSize * vicinityPercentage;
    const adjustedRadius = baseRadius * (this.defending / 100); // Adjust based on defending attribute
    return adjustedRadius;
  }

  calculateDistance(position1, position2) {
    return Math.sqrt(
      Math.pow(position2.x - position1.x, 2) +
        Math.pow(position2.y - position1.y, 2)
    );
  }

  // Player Class Action Methods

  // General Methods
  setPosition(position) {
    this.currentPosition = position;
  }

  // Defensive Action Methods

  performDefensiveAction(opponents, ball, field) {
    const vicinityRadius = this.calculateDefensiveVicinityRadius(field);
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

  isBallInPath(ball) {
    // Placeholder for checking if the ball is in the player's path
    return true;
  }

  isOpponentInVicinity(opponent, vicinityMultiplier) {
    const opponentDistance = this.calculateDistance(
      this.currentPosition,
      opponent.currentPosition
    );
    const vicinityRadius = this.calculateDefensiveVicinityRadius({
      width: 100,
      length: 100,
    }); // Assume field size for now
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

  isPassing() {
    // Placeholder for checking if the player is passing
    return false;
  }

  stopPassing() {
    // Placeholder for stopping a pass
  }

  isShooting() {
    // Placeholder for checking if the player is shooting
    return false;
  }

  stopShooting() {
    // Placeholder for stopping a shot
  }

  moveToFormationPosition() {
    if (this.formationPosition) {
      this.currentPosition = { ...this.formationPosition };
    }
  }

  moveToOnsidePosition() {
    // Placeholder for moving the player to an onside position
  }

  moveToWithinBoundaries(field) {
    // Placeholder for moving the player within the field boundaries
  }

  // Helper methods
  isWithinBoundaries(field) {
    return (
      0 <= this.currentPosition.x &&
      this.currentPosition.x <= field.width &&
      0 <= this.currentPosition.y &&
      this.currentPosition.y <= field.length
    );
  }

  isOffside(ball) {
    // Simplified offside logic
    if (
      this.position === "attacker" &&
      this.currentPosition.x > ball.position.x &&
      !this.hasBall
    ) {
      return true;
    }
    return false;
  }

  isTowardsOpponentGoal(ball) {
    // Placeholder for checking if the shot direction is towards the opponent's goal
    return true;
  }

  findNearestTeammate(players) {
    // Placeholder for finding the nearest teammate
    return players[0];
  }

  findNearestOpponent(opponents) {
    // Placeholder for finding the nearest opponent
    return opponents[0];
  }

  calculateAngle(position1, position2, position3) {
    // Placeholder for calculating the angle between three positions
    return 90;
  }

  hasDirectLine(teammate) {
    // Placeholder for checking if there is a direct line between the player and the teammate
    return true;
  }

  isInFormation(formation) {
    // Placeholder for checking if the player is in the correct formation position
    return (
      this.formationPosition &&
      this.currentPosition.x === this.formationPosition.x &&
      this.currentPosition.y === this.formationPosition.y
    );
  }

  // Competency enforcement methods
  enforceCompetencies(ball, team, field) {
    const ballState = ball.isInPlay ? BallState.IN_PLAY : BallState.DEAD;
    const playerState = this.hasBall
      ? PlayerState.HAS_BALL
      : ball.carrier && ball.carrier.teamId === this.teamId
      ? PlayerState.TEAM_HAS_BALL
      : PlayerState.OPPONENT_HAS_BALL;

    switch (ballState) {
      case BallState.IN_PLAY:
        this.handleInPlayState(playerState, ball, team, field);
        break;
      case BallState.DEAD:
        this.handleDeadBallState(playerState, ball, team, field);
        break;
    }
  }

  handleInPlayState(playerState, ball, team, field) {
    switch (playerState) {
      case PlayerState.HAS_BALL:
        this.handleHasBallState(ball, team, field);
        break;
      case PlayerState.TEAM_HAS_BALL:
        this.handleTeamHasBallState(ball, team, field);
        break;
      case PlayerState.OPPONENT_HAS_BALL:
        this.handleOpponentHasBallState(ball, team, field);
        break;
    }
  }

  handleDeadBallState(playerState, ball, team, field) {
    switch (playerState) {
      case PlayerState.HAS_BALL:
        this.handleDeadBallHasBallState(ball, team, field);
        break;
      case PlayerState.TEAM_HAS_BALL:
        this.handleDeadBallTeamHasBallState(ball, team, field);
        break;
      case PlayerState.OPPONENT_HAS_BALL:
        this.handleDeadBallOpponentHasBallState(ball, team, field);
        break;
    }
  }

  handleHasBallState(ball, team, field) {
    // Handle player actions when they have the ball
    this.checkShotCompetency(ball);
    this.checkPassCompetency();
    this.checkOutletCompetency(team);
  }

  handleTeamHasBallState(ball, team, field) {
    // Handle player actions when their team has the ball
    this.checkFormationCompetency(team);
    this.checkBoundariesCompetency(field);
  }

  handleOpponentHasBallState(ball, team, field) {
    // Handle player actions when the opponent has the ball
    this.checkDefensiveCompetency(ball);
    this.checkOffsideCompetency(ball);
    this.checkBoundariesCompetency(field);
  }

  handleDeadBallHasBallState(ball, team, field) {
    // Handle player actions when they have the ball during a dead ball situation
    this.moveToFormationPosition();
  }

  handleDeadBallTeamHasBallState(ball, team, field) {
    // Handle player actions when their team has the ball during a dead ball situation
    this.moveToFormationPosition();
  }

  handleDeadBallOpponentHasBallState(ball, team, field) {
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

  checkBoundariesCompetency(field) {
    if (!this.isWithinBoundaries(field)) {
      this.moveToWithinBoundaries(field);
    }
  }
}

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
