// Class to enfore the Minimum Football Competencies
class CompetencyEnforcer {
  constructor(field) {
    this.field = field;
  }

  isWithinBoundaries(player) {
    return (
      0 <= player.currentPosition.x &&
      player.currentPosition.x <= this.field.width &&
      0 <= player.currentPosition.y &&
      player.currentPosition.y <= this.field.length
    );
  }

  isOffside(player, ball) {
    // Simplified offside logic
    if (
      player.position === "attacker" &&
      player.currentPosition.x > ball.position.x &&
      !player.hasBall
    ) {
      return true;
    }
    return false;
  }

  isTowardsOpponentGoal(player, ball) {
    // Placeholder for checking if the shot direction is towards the opponent's goal
    return true;
  }

  findNearestTeammate(player, players) {
    // Placeholder for finding the nearest teammate
    return players[0];
  }

  findNearestOpponent(player, opponents) {
    // Placeholder for finding the nearest opponent
    return opponents[0];
  }

  calculateAngle(position1, position2, position3) {
    // Placeholder for calculating the angle between three positions
    return 90;
  }

  hasDirectLine(player, teammate) {
    // Placeholder for checking if there is a direct line between the player and the teammate
    return true;
  }

  isInFormation(player, formation) {
    // Placeholder for checking if the player is in the correct formation position
    return true;
  }

  enforceCompetencies(player, ball, team) {
    this.checkDefensiveCompetency(player, ball);
    this.checkPassCompetency(player);
    this.checkShotCompetency(player, ball);
    this.checkOutletCompetency(player, team);
    this.checkFormationCompetency(player, team);
    this.checkOffsideCompetency(player, ball);
    this.checkBoundariesCompetency(player);
  }

  checkDefensiveCompetency(player, ball) {
    if (
      player.teamId === ball.carrier.teamId &&
      player.isPerformingDefensiveAction()
    ) {
      player.stopDefensiveAction();
    }
  }

  checkPassCompetency(player) {
    if (player.isPassing() && player.passTarget.teamId !== player.teamId) {
      player.stopPassing();
    }
  }

  checkShotCompetency(player, ball) {
    if (player.isShooting() && !this.isTowardsOpponentGoal(player, ball)) {
      player.stopShooting();
    }
  }

  checkOutletCompetency(player, team) {
    if (player.hasBall) {
      const nearestTeammate = this.findNearestTeammate(player, team.players);
      const angle = this.calculateAngle(
        player.currentPosition,
        nearestTeammate.currentPosition,
        this.findNearestOpponent(player, opposingTeam.players).currentPosition
      );
      if (
        !(60 <= angle && angle <= 150) ||
        !this.hasDirectLine(player, nearestTeammate)
      ) {
        player.stopPassing();
      }
    }
  }

  checkFormationCompetency(player, team) {
    if (!this.isInFormation(player, team.formation)) {
      player.moveToFormationPosition();
    }
  }

  checkOffsideCompetency(player, ball) {
    player.isOffside = this.isOffside(player, ball);
    if (player.isOffside) {
      player.moveToOnsidePosition();
    }
  }

  checkBoundariesCompetency(player) {
    if (!this.isWithinBoundaries(player)) {
      player.moveToWithinBoundaries();
    }
  }
}
