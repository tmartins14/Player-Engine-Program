/*
 * Player Class
 * ------------
 * Represents an individual player on the field.
 * Players execute actions as instructed by their team.
 */

const Field = require("./Field");

class Player {
  constructor({
    name,
    teamId,
    position,
    stats, // Player stats object
    fitness = 100,
    injured = false,
    field = new Field(11), // Default to an 11v11 field
    teamTactics = {}, // Team instructions passed by the Team class
    roles = {}, // Player roles
  }) {
    this.name = name;
    this.teamId = teamId;
    this.position = position;
    this.stats = {
      rating: stats.rating || 50,
      pace: stats.pace || 50,
      shooting: stats.shooting || 50,
      dribbling: stats.dribbling || 50,
      defending: stats.defending || 50,
      passing: stats.passing || 50,
      physical: stats.physical || 50,
      heading: stats.heading || 50,
      saving: stats.saving || 50,
    };
    this.fitness = fitness;
    this.injured = injured;
    this.currentPosition = { x: 0, y: 0 };
    this.formationPosition = null; // Set based on team's formation
    this.hasBall = false;
    this.isOffside = false;
    this.field = field;
    this.teamTactics = teamTactics;
    this.teamSide = null; // 'home' or 'away'

    // Player roles
    this.roles = {
      leftCornerTaker: roles.leftCornerTaker || false,
      rightCornerTaker: roles.rightCornerTaker || false,
      freeKickTaker: roles.freeKickTaker || false,
      penaltyTaker: roles.penaltyTaker || false,
      captain: roles.captain || false,
      viceCaptain: roles.viceCaptain || false,
    };
  }

  // **Add the setRoles method**
  setRoles(newRoles) {
    this.roles = { ...this.roles, ...newRoles };
  }

  // Set the player's team
  setTeam(team) {
    this.teamId = team.name;
    this.teamSide = team.teamSide; // Use teamSide set in the Team class
    this.teamTactics = team.tactics;
    this.field = team.field;
  }

  // Update team tactics
  updateTeamTactics(tactics) {
    this.teamTactics = tactics;
  }

  // Set the player's position on the field
  setPosition(position) {
    if (position && this.field.isWithinBounds(position)) {
      this.currentPosition = position;
      return true;
    } else {
      console.error("Position is out of bounds or invalid.");
      return false;
    }
  }

  // Update the player's fitness
  updateFitness() {
    if (this.hasBall) {
      this.fitness -= 0.1; // Dribbling consumes more energy
    } else {
      this.fitness -= 0.05; // General movement
    }

    if (this.fitness < 0) {
      this.fitness = 0;
    }

    if (this.fitness < 10 && Math.random() < 0.01) {
      this.injured = true;
      console.log(`${this.name} has been injured due to fatigue.`);
    }
  }

  // Perform the action assigned by the team
  performAction(action, ball) {
    switch (action.type) {
      case "move":
        this.actionMove(action.targetPosition);
        break;
      case "pass":
        this.actionPass(action.targetPlayer, ball);
        break;
      case "shoot":
        this.actionShoot(ball);
        break;
      case "dribble":
        this.actionDribble(action.targetPosition, ball);
        break;
      case "hold":
        this.actionHoldPosition();
        break;
      case "mark":
        this.actionMark(action.targetOpponent);
        break;
      case "press":
        this.actionPress(action.targetPosition);
        break;
      default:
        this.actionHoldPosition();
        break;
    }

    // Update fitness after performing an action
    this.updateFitness();
  }

  // Action methods

  // Move towards a target position
  actionMove(targetPosition) {
    const direction = {
      x: targetPosition.x - this.currentPosition.x,
      y: targetPosition.y - this.currentPosition.y,
    };

    const distance = Math.sqrt(direction.x ** 2 + direction.y ** 2);
    if (distance === 0) return;

    const speed = (this.stats.pace / 100) * 5; // Base speed
    const moveDistance = Math.min(speed, distance);

    // Normalize direction vector
    direction.x /= distance;
    direction.y /= distance;

    // Update position
    this.currentPosition.x += direction.x * moveDistance;
    this.currentPosition.y += direction.y * moveDistance;

    // Ensure player stays within field boundaries
    this.ensureWithinBoundaries();
  }

  // Pass the ball to a teammate
  actionPass(targetPlayer, ball) {
    if (!this.hasBall) {
      console.error(`${this.name} does not have the ball to pass.`);
      return;
    }

    // Calculate pass success probability
    const passingSkill = this.stats.passing;
    const distance = this.calculateDistance(
      this.currentPosition,
      targetPlayer.currentPosition
    );

    const passSuccessProbability = passingSkill / 100 - distance / 100;
    const passSuccessful = Math.random() < passSuccessProbability;

    if (passSuccessful) {
      console.log(`${this.name} successfully passes to ${targetPlayer.name}.`);
      this.hasBall = false;
      targetPlayer.hasBall = true;
      ball.changeCarrier(targetPlayer);
    } else {
      console.log(`${this.name} failed to pass to ${targetPlayer.name}.`);
      this.hasBall = false;
      ball.carrier = null;
      // Ball becomes loose at the target position
      ball.position = {
        x: targetPlayer.currentPosition.x,
        y: targetPlayer.currentPosition.y,
      };
    }
  }

  // Shoot the ball towards the goal
  actionShoot(ball) {
    if (!this.hasBall) {
      console.error(`${this.name} does not have the ball to shoot.`);
      return;
    }

    const opponentGoal = this.getOpponentGoalPosition();
    const shootingSkill = this.stats.shooting;
    const distanceToGoal = this.calculateDistance(
      this.currentPosition,
      opponentGoal
    );

    const shotSuccessProbability = shootingSkill / 100 - distanceToGoal / 100;
    const shotOnTarget = Math.random() < shotSuccessProbability;

    if (shotOnTarget) {
      console.log(`${this.name} takes a shot and scores!`);
      // Handle goal scoring in the Match class
      this.hasBall = false;
      ball.carrier = null;
      ball.position = opponentGoal; // Ball goes into the goal
    } else {
      console.log(`${this.name} takes a shot but misses.`);
      this.hasBall = false;
      ball.carrier = null;
      // Ball goes out of play or to the goalkeeper
      ball.position = {
        x: opponentGoal.x + (Math.random() * 20 - 10),
        y: opponentGoal.y + (Math.random() * 5 - 2.5),
      };
    }
  }

  // Dribble towards a target position
  actionDribble(targetPosition, ball) {
    if (!this.hasBall) {
      console.error(`${this.name} does not have the ball to dribble.`);
      return;
    }

    const direction = {
      x: targetPosition.x - this.currentPosition.x,
      y: targetPosition.y - this.currentPosition.y,
    };

    const distance = Math.sqrt(direction.x ** 2 + direction.y ** 2);
    if (distance === 0) return;

    const dribbleSpeed = (this.stats.dribbling / 100) * 4; // Slower than running
    const moveDistance = Math.min(dribbleSpeed, distance);

    // Normalize direction vector
    direction.x /= distance;
    direction.y /= distance;

    // Update position
    this.currentPosition.x += direction.x * moveDistance;
    this.currentPosition.y += direction.y * moveDistance;

    // Move the ball with the player
    ball.position = { ...this.currentPosition };

    // Ensure player stays within field boundaries
    this.ensureWithinBoundaries();
  }

  // Hold position (do nothing)
  actionHoldPosition() {
    // Player remains in current position
  }

  // Mark an opponent player
  actionMark(targetOpponent) {
    // Move towards the opponent player
    this.actionMove(targetOpponent.currentPosition);
  }

  // Press towards a target position (e.g., the ball)
  actionPress(targetPosition) {
    // Move towards the target position aggressively
    this.actionMove(targetPosition);
  }

  // Ensure the player stays within the field boundaries
  ensureWithinBoundaries() {
    const halfWidth = this.field.width / 2;
    const halfLength = this.field.length / 2;

    if (this.currentPosition.x < -halfWidth) {
      this.currentPosition.x = -halfWidth;
    } else if (this.currentPosition.x > halfWidth) {
      this.currentPosition.x = halfWidth;
    }

    if (this.currentPosition.y < -halfLength) {
      this.currentPosition.y = -halfLength;
    } else if (this.currentPosition.y > halfLength) {
      this.currentPosition.y = halfLength;
    }
  }

  // Helper methods

  // Calculate distance between two positions
  calculateDistance(pos1, pos2) {
    return Math.sqrt((pos2.x - pos1.x) ** 2 + (pos2.y - pos1.y) ** 2);
  }

  // Get the position of the opponent's goal
  getOpponentGoalPosition() {
    if (!this.field) {
      throw new Error("Field data is required to determine goal positions.");
    }

    const isHomeTeam = this.teamSide === "home";

    const opponentGoal = isHomeTeam
      ? {
          x: 0,
          y: this.field.length / 2,
        }
      : {
          x: 0,
          y: -this.field.length / 2,
        };

    return opponentGoal;
  }

  // Get the position of the own goal
  getOwnGoalPosition() {
    if (!this.field) {
      throw new Error("Field data is required to determine goal positions.");
    }

    const isHomeTeam = this.teamSide === "home";

    const ownGoal = isHomeTeam
      ? {
          x: 0,
          y: -this.field.length / 2,
        }
      : {
          x: 0,
          y: this.field.length / 2,
        };

    return ownGoal;
  }
}

module.exports = Player;
