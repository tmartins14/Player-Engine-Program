/*
 * Player Class
 * ------------
 * Represents an individual player on the field.
 * Players execute actions as instructed by their team.
 */

const Field = require("./Field");
const { calculateDistance } = require("../utilities/utils");

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
      tackling: stats.tackling || 50,
      aggression: stats.aggression || 50,
      discipline: stats.discipline || 50,
    };
    this.fitness = fitness;
    this.injured = injured;
    this.currentPosition = { x: 0, y: 0 };
    this.targetPosition = null; // For movement handling
    this.currentAction = null; // Current action the player is performing
    this.hasBall = false;
    this.isOffside = false;
    this.field = field;
    this.teamTactics = teamTactics;
    this.teamSide = null; // 'home' or 'away'
    this.stamina = 100; // Player's stamina (0 to 100)
    this.formationPosition = null; // Set based on team's formation

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

  // Add the setRoles method
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
      this.currentPosition = { ...position };
      return true;
    } else {
      console.error("Position is out of bounds or invalid.");
      return false;
    }
  }

  // Update the player's fitness
  updateFitness() {
    let fitnessReduction = 0.05; // Base fitness reduction

    if (this.hasBall) {
      fitnessReduction += 0.05; // Dribbling consumes more energy
    }

    // Additional fatigue based on actions can be added here

    this.fitness -= fitnessReduction;

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
    this.currentAction = action;

    switch (action.type) {
      case "move":
        this.targetPosition = action.targetPosition;
        break;
      case "pass":
        this.actionPass(action.targetPlayer, ball, action.passType);
        break;
      case "shoot":
        this.actionShoot(ball);
        break;
      case "dribble":
        this.targetPosition = action.targetPosition;
        break;
      case "hold":
        this.actionHoldPosition();
        break;
      case "mark":
        this.targetPosition = action.targetOpponent.currentPosition;
        break;
      case "press":
        this.targetPosition = action.targetPosition;
        break;
      case "tackle":
        this.actionTackle(action.targetOpponent, ball);
        break;
      case "defendZone":
        this.targetPosition = action.zone.center;
        break;
      case "receivePass":
        this.actionReceivePass(ball);
        break;
      default:
        this.actionHoldPosition();
        break;
    }
  }

  // Update player's state over time
  update(deltaTime, ball, opponentTeam) {
    // Handle movement
    if (this.currentAction && this.targetPosition) {
      if (
        ["move", "press", "mark", "defendZone", "receivePass"].includes(
          this.currentAction.type
        )
      ) {
        this.moveTowardsTarget(deltaTime);
      } else if (this.currentAction.type === "dribble") {
        this.dribbleTowardsTarget(deltaTime, ball);
      }
    }

    // Update player's stamina or other attributes
    this.updateStamina(deltaTime);

    // Additional logic for receiving passes
    if (
      this.currentAction &&
      this.currentAction.type === "receivePass" &&
      !this.hasBall
    ) {
      const distanceToBall = calculateDistance(
        this.currentPosition,
        ball.position
      );
      const controlRadius = this.calculateControlRadius();
      if (distanceToBall <= controlRadius) {
        // Player gains possession
        this.hasBall = true;
        ball.changeCarrier(this);
        ball.isMoving = false;
        console.log(`${this.name} has received the pass.`);
        // Decide next action after receiving the ball
        this.performAction({ type: "hold" }, ball); // Hold position or decide next action
      }
    }
  }

  // Method to move towards the target position
  moveTowardsTarget(deltaTime) {
    const dx = this.targetPosition.x - this.currentPosition.x;
    const dy = this.targetPosition.y - this.currentPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      // Normalize the direction vector
      const dirX = dx / distance;
      const dirY = dy / distance;

      // Calculate movement distance based on player's speed and deltaTime
      const speed = this.calculateSpeed(); // Adjusted speed calculation
      const moveDistance = speed * deltaTime;

      if (moveDistance >= distance) {
        // Arrive at target position
        this.currentPosition = { ...this.targetPosition };
        this.targetPosition = null;

        // For receivePass action, hold position until ball arrives
        if (this.currentAction.type === "receivePass") {
          console.log(`${this.name} is in position to receive the pass.`);
        } else {
          // console.log(`${this.name} has arrived at the target position.`);
        }
      } else {
        // Move towards the target position
        this.currentPosition.x += dirX * moveDistance;
        this.currentPosition.y += dirY * moveDistance;

        // Ensure player stays within field boundaries
        this.ensureWithinBoundaries();
      }
    }
  }

  // Method to dribble towards the target position
  dribbleTowardsTarget(deltaTime, ball) {
    if (!this.hasBall) {
      // If the player doesn't have the ball, attempt to regain possession
      return;
    }

    const dx = this.targetPosition.x - this.currentPosition.x;
    const dy = this.targetPosition.y - this.currentPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      // Normalize the direction vector
      const dirX = dx / distance;
      const dirY = dy / distance;

      // Calculate movement distance based on player's dribbling speed and deltaTime
      const speed = this.calculateDribbleSpeed(); // Adjusted speed calculation
      const moveDistance = speed * deltaTime;

      if (moveDistance >= distance) {
        // Arrive at target position
        this.currentPosition = { ...this.targetPosition };
        this.targetPosition = null;
        console.log(`${this.name} has dribbled to the target position.`);
      } else {
        // Move towards the target position
        this.currentPosition.x += dirX * moveDistance;
        this.currentPosition.y += dirY * moveDistance;

        // Move the ball with the player
        ball.position.x = this.currentPosition.x;
        ball.position.y = this.currentPosition.y;

        // Ensure player stays within field boundaries
        this.ensureWithinBoundaries();
      }
    }
  }

  // Calculate movement speed based on field size and player stats
  calculateSpeed() {
    // Standard maximum speed (e.g., 7 m/s)
    const maxSpeed = 7;

    // Adjust speed based on field scaling
    const fieldScalingFactor = this.calculateFieldScalingFactor();

    // Calculate base speed multiplier
    const baseSpeedMultiplier = maxSpeed * fieldScalingFactor;

    // Calculate speed
    const speed =
      (this.stats.pace / 100) * baseSpeedMultiplier * (this.stamina / 100);

    return speed;
  }

  // Calculate dribbling speed
  calculateDribbleSpeed() {
    // Standard maximum dribbling speed (e.g., 5 m/s)
    const maxDribbleSpeed = 5;

    // Adjust speed based on field scaling
    const fieldScalingFactor = this.calculateFieldScalingFactor();

    // Calculate base speed multiplier
    const baseDribbleSpeedMultiplier = maxDribbleSpeed * fieldScalingFactor;

    // Calculate speed
    const speed =
      (this.stats.dribbling / 100) *
      baseDribbleSpeedMultiplier *
      (this.stamina / 100);

    return speed;
  }

  // Calculate field scaling factor based on field dimensions
  calculateFieldScalingFactor() {
    const standardFieldLength = 105; // meters
    const standardFieldWidth = 68; // meters

    const lengthScalingFactor = this.field.length / standardFieldLength;
    const widthScalingFactor = this.field.width / standardFieldWidth;

    // Use the geometric mean to balance scaling
    const fieldScalingFactor = Math.sqrt(
      lengthScalingFactor * widthScalingFactor
    );

    return fieldScalingFactor;
  }

  // Method to update stamina or other attributes
  updateStamina(deltaTime) {
    // Reduce stamina based on activity
    const activityLevel =
      this.currentAction &&
      ["move", "dribble", "press", "receivePass"].includes(
        this.currentAction.type
      )
        ? 0.1
        : 0.05;
    this.stamina -= activityLevel * deltaTime;

    // Ensure stamina doesn't go below zero
    if (this.stamina < 0) {
      this.stamina = 0;
    }
  }

  // Action methods

  // Receive a pass from a teammate
  actionReceivePass(ball) {
    // Move towards the ball's target position if not already there
    if (!this.targetPosition) {
      this.targetPosition = { ...ball.destination };
    }

    // Once at the target position, hold until the ball arrives
    // This logic is handled in the update method
  }

  // Pass the ball to a teammate
  actionPass(targetPlayer, ball, passType = "toFeet") {
    if (!this.hasBall) {
      console.error(`${this.name} does not have the ball to pass.`);
      return;
    }

    const passingSkill = this.stats.passing;

    // Calculate direction and distance to target player
    let targetPosition;

    if (passType === "toFeet") {
      // Pass directly to the player's current position
      targetPosition = { ...targetPlayer.currentPosition };
    } else if (passType === "throughBall") {
      // Pass into space ahead of the player
      const leadDistance = this.calculateLeadDistance(); // Adjusted based on field size
      const playerDirection = targetPlayer.getMovementDirection();
      targetPosition = {
        x: targetPlayer.currentPosition.x + playerDirection.x * leadDistance,
        y: targetPlayer.currentPosition.y + playerDirection.y * leadDistance,
      };
    } else {
      console.error("Invalid pass type specified.");
      return;
    }

    // Calculate pass power and direction
    const dx = targetPosition.x - this.currentPosition.x;
    const dy = targetPosition.y - this.currentPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normalize the direction vector
    const dirX = dx / distance;
    const dirY = dy / distance;

    // Calculate pass speed based on passing skill and field size
    const passSpeed = this.calculatePassSpeed(passingSkill);

    // Apply possible error based on passing skill
    const errorMargin = (100 - passingSkill) / 100;
    const errorX = (Math.random() * 2 - 1) * errorMargin;
    const errorY = (Math.random() * 2 - 1) * errorMargin;

    const actualDirX = dirX + errorX;
    const actualDirY = dirY + errorY;

    // Set the ball's velocity and direction
    const direction = { x: actualDirX, y: actualDirY };

    ball.kick(targetPosition, passSpeed, this, targetPlayer);

    // Release the ball
    console.log(
      `${this.name} passes towards ${targetPlayer.name} (${passType}).`
    );
    this.hasBall = false;
    ball.carrier = null;
    ball.intendedReceiver = targetPlayer;
    ball.isMoving = true;
    ball.destination = { ...targetPosition };

    // Assign receivePass action to the target player
    targetPlayer.performAction({ type: "receivePass" }, ball);
  }

  // Calculate lead distance for through balls
  calculateLeadDistance() {
    // Standard lead distance (e.g., 10 meters)
    const standardLeadDistance = 10;

    // Adjust lead distance based on field scaling
    const fieldScalingFactor = this.calculateFieldScalingFactor();
    const leadDistance = standardLeadDistance * fieldScalingFactor;

    return leadDistance;
  }

  // Calculate pass speed based on passing skill and field size
  calculatePassSpeed(passingSkill) {
    // Standard maximum pass speed (e.g., 25 m/s)
    const maxPassSpeed = 25;

    // Adjust pass speed based on field scaling
    const fieldScalingFactor = this.calculateFieldScalingFactor();
    const basePassSpeed = maxPassSpeed * fieldScalingFactor;

    const passSpeed = (passingSkill / 100) * basePassSpeed;

    return passSpeed;
  }

  // Shoot the ball towards the goal
  actionShoot(ball) {
    if (!this.hasBall) {
      console.error(`${this.name} does not have the ball to shoot.`);
      return;
    }

    const opponentGoal = this.getOpponentGoalPosition();
    const shootingSkill = this.stats.shooting;
    const distanceToGoal = calculateDistance(
      this.currentPosition,
      opponentGoal
    );

    // Calculate shot power and direction
    const dx = opponentGoal.x - this.currentPosition.x;
    const dy = opponentGoal.y - this.currentPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normalize the direction vector
    const dirX = dx / distance;
    const dirY = dy / distance;

    // Calculate shot speed based on shooting skill and field size
    const shotSpeed = this.calculateShotSpeed(shootingSkill);

    // Apply possible error based on shooting skill and distance
    const errorMargin =
      ((100 - shootingSkill) / 100) * (distanceToGoal / this.field.length);
    const errorX = (Math.random() * 2 - 1) * errorMargin;
    const errorY = (Math.random() * 2 - 1) * errorMargin;

    const actualDirX = dirX + errorX;
    const actualDirY = dirY + errorY;

    // Set the ball's velocity and direction
    const direction = { x: actualDirX, y: actualDirY };

    ball.kick(opponentGoal, shotSpeed, this);
    ball.isShot = true;
    ball.isMoving = true;

    // Release the ball
    console.log(`${this.name} takes a shot at the goal!`);
    this.hasBall = false;
    ball.carrier = null;
  }

  // Calculate shot speed based on shooting skill and field size
  calculateShotSpeed(shootingSkill) {
    // Standard maximum shot speed (e.g., 30 m/s)
    const maxShotSpeed = 30;

    // Adjust shot speed based on field scaling
    const fieldScalingFactor = this.calculateFieldScalingFactor();
    const baseShotSpeed = maxShotSpeed * fieldScalingFactor;

    const shotSpeed = (shootingSkill / 100) * baseShotSpeed;

    return shotSpeed;
  }

  // Hold position (do nothing)
  actionHoldPosition() {
    // Player remains in current position
    this.targetPosition = null;
  }

  // Calculate the tackling range based on the player's tackling skill
  calculateTacklingRange() {
    // Base tackling range between 1 and 3 meters, scaled by tackling skill (0-100)
    const baseRange = 2 + (this.stats.tackling / 100) * 3; // Range from 1 to 3 meters
    const fieldScalingFactor = this.calculateFieldScalingFactor(); // Assuming this method exists
    return baseRange * fieldScalingFactor;
  }

  // Tackle an opponent player
  actionTackle(targetOpponent, ball, deltaTime) {
    if (this.hasBall) {
      console.error(`${this.name} already has the ball and cannot tackle.`);
      return;
    }
    if (!targetOpponent.hasBall) {
      console.error(`${targetOpponent.name} does not have the ball to tackle.`);
      return;
    }

    const distanceToOpponent = calculateDistance(
      this.currentPosition,
      targetOpponent.currentPosition
    );

    const tacklingRange = this.calculateTacklingRange(); // Adjusted based on field size

    if (distanceToOpponent <= tacklingRange) {
      // Calculate proximity factor (0 to 1), higher when closer
      const proximityFactor = Math.max(
        0,
        (tacklingRange - distanceToOpponent) / tacklingRange
      );

      // Calculate success probability
      const tacklingSkill = this.stats.tackling;
      const opponentDribbling = targetOpponent.stats.dribbling;

      const baseProbability =
        tacklingSkill / (tacklingSkill + opponentDribbling);

      const successProbability = baseProbability * proximityFactor;

      // Ensure that if the distance is very small, successProbability is significant
      // Optionally, set a minimum success probability if desired

      if (Math.random() < successProbability) {
        // Successful tackle
        targetOpponent.hasBall = false;
        this.hasBall = true;
        ball.changeCarrier(this);

        console.log(
          `${this.name} successfully tackled ${targetOpponent.name}.`
        );
      } else {
        // Failed tackle
        // console.log(`${this.name} failed to tackle ${targetOpponent.name}.`);
        // Possible foul handling can be added here
      }

      // Reduce stamina due to tackling effort
      this.stamina -= 1;
      if (this.stamina < 0) this.stamina = 0;
    } else {
      // Move closer to the opponent
      this.targetPosition = { ...targetOpponent.currentPosition };
      this.moveTowardsTarget(deltaTime);
    }
  }

  // Calculate control radius for receiving the ball
  calculateControlRadius() {
    // Standard control radius (e.g., 1 meter)
    const standardControlRadius = 1;

    // Adjust control radius based on field scaling
    const fieldScalingFactor = this.calculateFieldScalingFactor();
    const controlRadius = standardControlRadius * fieldScalingFactor;

    return controlRadius;
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

  // Get the player's movement direction
  getMovementDirection() {
    // If the player is moving towards a target position
    if (this.targetPosition) {
      const dx = this.targetPosition.x - this.currentPosition.x;
      const dy = this.targetPosition.y - this.currentPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance === 0) return { x: 0, y: 0 };

      return { x: dx / distance, y: dy / distance };
    } else {
      // If the player is stationary
      return { x: 0, y: 0 };
    }
  }
}

module.exports = Player;
