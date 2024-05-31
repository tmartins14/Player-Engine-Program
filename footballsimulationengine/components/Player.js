// Player class should have multiple states:
// 1. Ball is in play
//  a. Player has the ball
//  b. Player does not have the ball and team has the ball
//  c. Player does not have the ball and team does not have the ball

// 2. Dead ball state
//  a. Player has the ball
//  b. Player does not have the ball and team has the ball
//  c. Player does not have the ball and team does not have the ball

class Player {
  constructor(
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
    fitness,
    injured = false,
    hasBall = false,
    isOffside = false
  ) {
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
    this.fitness = fitness;
    this.injured = injured;
    this.hasBall = hasBall;
    this.isOffside = isOffside;
    this.currentPosition = null; // Will be set by the team
  }

  setPosition(position) {
    this.currentPosition = position;
  }

  isPerformingDefensiveAction() {
    // Placeholder for checking if the player is performing a defensive action
    return false;
  }

  stopDefensiveAction() {
    // Placeholder for stopping a defensive action
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
      this.moveToWithinBoundaries();
    }
  }
}
