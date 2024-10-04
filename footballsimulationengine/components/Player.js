/*
 * Table of Contents:
 * 1. Initialization and Setup
 * 2. Team Settings
 * 3. Role Assignment
 * 4. Decision Making
 * 5. Ball Handling and Shooting
 * 6. Defensive Actions
 * 7. Positioning and Movement
 * 8. Set Pieces
 * 9. Fitness and Injury Management
 * 10. Helper Methods
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
    teamTactics = {}, // Team instructions passed by the Team class
    roles = {}, // Player roles
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
    this.teamTactics = teamTactics; // Set the team tactics passed in
    this.teamSide = null; // Will store 'home' or 'away'
    this.formationPosition = null; // Will be set based on team's formation

    // 3. Role Assignment
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

  initializePosition(field) {
    // Initial position set to halfway on their side of the field
    return { x: 0, y: -field.length / 4 };
  }

  // 2. Team Settings
  setTeam(team) {
    // Store only necessary data from the team
    this.teamId = team.name;
    this.teamSide = team.side; // 'home' or 'away'
    this.teamTactics = team.tactics;
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

  updateTeamTactics(tactics) {
    this.teamTactics = tactics;
  }

  // 3. Role Assignment
  setRoles(roles) {
    // Update roles based on the input object
    for (let role in roles) {
      if (roles.hasOwnProperty(role) && this.roles.hasOwnProperty(role)) {
        this.roles[role] = roles[role];
      }
    }
  }

  // 4. Decision Making
  decideAction(ball, opponents, teammates) {
    const gameContext = this.determineGameContext();

    if (this.hasBall) {
      this.decideActionWithBall(ball, opponents, teammates, gameContext);
    } else if (ball.carrier && ball.carrier.teamId === this.teamId) {
      this.decideActionWithoutBallInPossession(
        ball,
        opponents,
        teammates,
        gameContext
      );
    } else if (!ball.carrier) {
      this.decideActionChaseBall(ball, teammates, gameContext);
    } else if (ball.carrier.teamId !== this.teamId) {
      this.decideActionWithoutBallOutOfPossession(
        ball,
        opponents,
        teammates,
        gameContext
      );
    } else if (!ball.isInPlay) {
      this.decideActionDuringDeadBall(ball, opponents, teammates, gameContext);
    } else {
      this.actionHoldPosition(teammates);
    }
  }

  determineGameContext() {
    const fieldLength = this.field.length;
    const positionY = this.currentPosition.y;
    const teamSideMultiplier = this.teamSide === "home" ? -1 : 1;
    const adjustedPositionY = positionY * teamSideMultiplier;

    if (this.field.isKickoff && this.hasBall) {
      return "kickoff";
    } else if (adjustedPositionY < -fieldLength / 3) {
      return "defensiveThird";
    } else if (adjustedPositionY > fieldLength / 3) {
      return "attackingThird";
    } else {
      return "openPlay";
    }
  }

  // Additional methods to enhance realism

  decideActionChaseBall(ball, teammates, gameContext) {
    const closestTeammate = this.findClosestTeammateToBall(ball, teammates);

    if (closestTeammate === this) {
      this.actionMoveTowardsTarget(ball.position);
    } else {
      this.actionHoldPosition(teammates);
    }
  }

  decideActionWithBall(ball, opponents, teammates, gameContext) {
    if (this.shouldShoot(ball, gameContext)) {
      this.actionShoot(ball);
    } else if (this.shouldPass(teammates, opponents, gameContext)) {
      const targetTeammate = this.findBestTeammateToPass(teammates, opponents);
      if (targetTeammate) {
        this.actionPass(ball, targetTeammate);
      } else {
        this.actionDribble(ball, opponents, teammates);
      }
    } else {
      this.actionDribble(ball, opponents, teammates);
    }
  }

  decideActionWithoutBallInPossession(ball, opponents, teammates, gameContext) {
    if (this.shouldMakeRun(opponents)) {
      this.actionMakeRun(opponents);
    } else {
      this.actionSupportBallCarrier(ball, teammates);
    }
  }

  decideActionWithoutBallOutOfPossession(
    ball,
    opponents,
    teammates,
    gameContext
  ) {
    if (this.shouldPress(ball, opponents)) {
      this.actionPress(ball, opponents);
    } else {
      this.actionDropIntoDefense();
    }
  }

  decideActionDuringDeadBall(ball, opponents, teammates, gameContext) {
    // Placeholder for set-piece positioning
    this.actionHoldPosition(teammates);
  }

  // 5. Ball Handling and Shooting
  actionShoot(ball) {
    const opponentGoal = this.getOpponentGoalPosition();
    const shotAccuracy = this.stats.shooting;
    const shotPower = this.stats.shooting;

    // Simulate shot accuracy
    const accuracyOffset = (100 - shotAccuracy) / 10;
    const targetX = opponentGoal.x + (Math.random() * 2 - 1) * accuracyOffset;
    const targetY = opponentGoal.y;

    // Calculate shot direction and power
    const direction = {
      x: targetX - ball.position.x,
      y: targetY - ball.position.y,
    };
    const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);
    const powerMultiplier = shotPower / 100;

    ball.setVelocity({
      x: (direction.x / magnitude) * powerMultiplier * 30,
      y: (direction.y / magnitude) * powerMultiplier * 30,
    });

    // Update ball and player state
    ball.isShot = true;
    ball.carrier = null;
    this.hasBall = false;

    console.log(`${this.name} takes a shot towards the goal!`);
  }

  actionPass(ball, targetTeammate) {
    if (!targetTeammate) {
      console.error(
        `${this.name} could not find a suitable teammate to pass to.`
      );
      return;
    }

    const passingSkill = this.stats.passing;

    // Calculate pass direction and distance
    const direction = {
      x: targetTeammate.currentPosition.x - this.currentPosition.x,
      y: targetTeammate.currentPosition.y - this.currentPosition.y,
    };
    const distance = this.calculateDistance(
      this.currentPosition,
      targetTeammate.currentPosition
    );

    // Simulate pass accuracy
    const maxInaccuracy =
      (distance / (this.field.length * 0.75)) * (100 - passingSkill);
    const accuracyOffsetX = (Math.random() * 2 - 1) * (maxInaccuracy / 10);
    const accuracyOffsetY = (Math.random() * 2 - 1) * (maxInaccuracy / 10);

    // Adjust target position based on pass accuracy
    const targetPosition = {
      x: targetTeammate.currentPosition.x + accuracyOffsetX,
      y: targetTeammate.currentPosition.y + accuracyOffsetY,
    };

    // Calculate new direction after accuracy adjustment
    const adjustedDirection = {
      x: targetPosition.x - this.currentPosition.x,
      y: targetPosition.y - this.currentPosition.y,
    };
    const magnitude = Math.sqrt(
      adjustedDirection.x ** 2 + adjustedDirection.y ** 2
    );

    // Set ball speed (you can adjust this based on passing skill or other factors)
    const speed = 20; // Adjust as needed

    // Set the ball's velocity and target position
    ball.setVelocity({
      x: (adjustedDirection.x / magnitude) * speed,
      y: (adjustedDirection.y / magnitude) * speed,
    });
    ball.targetPosition = targetPosition;

    // Update ball and player state
    ball.isShot = false;
    ball.carrier = null;
    this.hasBall = false;

    // Assign the ball to the target teammate upon arrival
    ball.onReachTarget = () => {
      ball.velocity = { x: 0, y: 0 };
      ball.position = { ...ball.targetPosition };
      ball.carrier = targetTeammate;
      targetTeammate.hasBall = true;
      console.log(
        `${targetTeammate.name} receives the ball from ${this.name}.`
      );
    };

    console.log(`${this.name} passes the ball towards ${targetTeammate.name}.`);
  }
  actionDribble(ball, opponents, teammates) {
    const targetPosition = this.findBestDribblePosition(opponents);

    if (targetPosition) {
      this.actionMoveTowardsTarget(targetPosition, true, ball);
    } else {
      // If no good dribble option, consider passing
      const targetTeammate = this.findBestTeammateToPass(teammates, opponents);
      if (targetTeammate) {
        this.actionPass(ball, targetTeammate);
      } else {
        // Hold position
        this.actionHoldPosition(teammates);
      }
    }
  }

  // 6. Defensive Actions
  actionPress(ball, opponents) {
    const opponentWithBall = opponents.find((opponent) => opponent.hasBall);

    if (opponentWithBall) {
      // Move towards the opponent with the ball
      this.actionMoveTowardsTarget(opponentWithBall.currentPosition);
    } else {
      // Move towards the ball's position
      this.actionMoveTowardsTarget(ball.position);
    }
  }

  actionDropIntoDefense() {
    const defensivePosition = this.getDefensivePosition();
    this.actionMoveTowardsTarget(defensivePosition);
  }

  actionPerformDefensiveAction(opponents, ball) {
    const ballDistance = this.calculateDistance(
      this.currentPosition,
      ball.position
    );

    if (ballDistance < 5 && this.stats.defending > 60) {
      this.attemptDefensivePlay(opponents, ball);
    } else {
      this.actionDropIntoDefense();
    }
  }

  // 7. Positioning and Movement
  actionMoveTowardsTarget(targetPosition, isDribbling = false, ball = null) {
    const direction = {
      x: targetPosition.x - this.currentPosition.x,
      y: targetPosition.y - this.currentPosition.y,
    };

    const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);
    if (magnitude === 0) return;

    const speed = isDribbling
      ? this.stats.dribbling * 0.1
      : this.stats.pace * 0.05;

    // Update player's position
    this.currentPosition.x += (direction.x / magnitude) * speed;
    this.currentPosition.y += (direction.y / magnitude) * speed;

    // If dribbling, update the ball's position to match the player's position
    if (isDribbling && ball) {
      ball.position.x = this.currentPosition.x;
      ball.position.y = this.currentPosition.y;
      ball.carrier = this; // Ensure the ball knows who is carrying it
    }

    // Ensure player stays within field boundaries
    this.actionMoveToWithinBoundaries();
  }

  actionHoldPosition(teammates) {
    // Updated method to maintain formation and move as a unit
    if (!this.formationPosition) {
      // If no formation position is set, hold current position
      return;
    }

    // Calculate target position based on formation position and team tactics
    const targetPosition = this.getFormationAdjustedPosition(teammates);

    // Move towards the target position
    this.actionMoveTowardsTarget(targetPosition);
  }

  getFormationAdjustedPosition(teammates) {
    // Base position from formation
    let targetX = this.formationPosition.x;
    let targetY = this.formationPosition.y;

    // Adjust position based on team tactics
    const tactics = this.teamTactics;

    // Width adjustment
    if (tactics && tactics.attackingWidth !== undefined) {
      const widthMultiplier = tactics.attackingWidth / 50; // Assuming tactics.attackingWidth ranges from 0 to 100
      targetX *= widthMultiplier;
    }

    // Depth adjustment (defensive line)
    if (tactics && tactics.defensiveLine !== undefined) {
      const depthMultiplier = tactics.defensiveLine / 50; // Assuming tactics.defensiveLine ranges from 0 to 100
      targetY *= depthMultiplier;
    }

    // Team movement based on ball position
    // Example: Shift up if team is in possession and attacking
    if (tactics && tactics.pressure !== undefined) {
      const ballCarrier = teammates.find((player) => player.hasBall);
      const ballPositionY = ballCarrier ? ballCarrier.currentPosition.y : 0;

      const pressureMultiplier = tactics.pressure / 100; // 0 (low) to 1 (high)
      targetY += ballPositionY * pressureMultiplier * 0.1;
    }

    // Return the adjusted position
    return {
      x: targetX,
      y: targetY,
    };
  }

  actionMakeRun(opponents) {
    const space = this.findOpenSpace(opponents);
    if (space) {
      this.actionMoveTowardsTarget(space);
    } else {
      this.actionHoldPosition();
    }
  }

  actionSupportBallCarrier(ball, teammates) {
    const ballCarrier = teammates.find((player) => player.hasBall);
    if (ballCarrier) {
      const offset = 10;
      const direction = {
        x: this.currentPosition.x - ballCarrier.currentPosition.x,
        y: this.currentPosition.y - ballCarrier.currentPosition.y,
      };
      const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);
      const targetPosition = {
        x: ballCarrier.currentPosition.x + (direction.x / magnitude) * offset,
        y: ballCarrier.currentPosition.y + (direction.y / magnitude) * offset,
      };
      this.actionMoveTowardsTarget(targetPosition);
    } else {
      this.actionHoldPosition(teammates);
    }
  }

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

  // 8. Set Pieces
  // Set piece corner kick method
  setPieceCornerKick(ball, side, teammates, opponents) {
    console.log(`${this.name} is taking a corner kick from the ${side} side.`);

    // Determine the corner position based on the side of the field
    const cornerPosition = {
      x: side === "left" ? -this.field.width / 2 : this.field.width / 2,
      y:
        this.teamSide === "home"
          ? -this.field.length / 2
          : this.field.length / 2,
    };

    // Move the ball to the corner position
    ball.position = { ...cornerPosition };

    // Decide the best target for the corner kick
    // For simplicity, target the teammate with the best heading ability
    let bestTarget = teammates.reduce((best, teammate) => {
      if (
        teammate !== this &&
        (best === null ||
          (teammate.stats.heading || 0) > (best.stats.heading || 0))
      ) {
        return teammate;
      } else {
        return best;
      }
    }, null);

    if (!bestTarget) {
      // If no suitable teammate found, target the center of the penalty area
      bestTarget = {
        currentPosition: {
          x: 0,
          y:
            this.teamSide === "home"
              ? -this.field.length / 4
              : this.field.length / 4,
        },
      };
    }

    // Calculate the direction and power of the corner kick
    const direction = {
      x: bestTarget.currentPosition.x - ball.position.x,
      y: bestTarget.currentPosition.y - ball.position.y,
    };
    const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);

    const passPower = this.stats.passing;
    const speed = (passPower / 100) * 20;

    // Set the ball's velocity
    ball.setVelocity({
      x: (direction.x / magnitude) * speed,
      y: (direction.y / magnitude) * speed,
    });

    // Update ball and player state
    ball.isShot = false;
    ball.carrier = null;
    this.hasBall = false;

    console.log(
      `${this.name} delivers a corner kick towards ${
        bestTarget.name || "the penalty area"
      }.`
    );
  }

  // Set piece goal kick method
  setPieceGoalKick(ball, teammates, opponents) {
    console.log(`${this.name} is taking a goal kick.`);

    // Position the ball at the appropriate goal area
    const goalKickPosition = {
      x: 0,
      y:
        this.teamSide === "home"
          ? -this.field.length / 2 + 5
          : this.field.length / 2 - 5,
    };

    // Move the ball to the goal kick position
    ball.position = { ...goalKickPosition };

    // Decide the best target for the goal kick
    // For simplicity, aim for the midfielder with the best aerial ability
    let bestTarget = teammates.reduce((best, teammate) => {
      if (
        teammate.position.includes("CM") &&
        (best === null ||
          (teammate.stats.heading || 0) > (best.stats.heading || 0))
      ) {
        return teammate;
      } else {
        return best;
      }
    }, null);

    // If no midfielder found, target any teammate upfield
    if (!bestTarget) {
      bestTarget = teammates.find(
        (teammate) => teammate !== this && teammate.position !== "GK"
      );
    }

    // If still no target, aim for the center circle
    if (!bestTarget) {
      bestTarget = {
        currentPosition: {
          x: 0,
          y: 0,
        },
      };
    }

    // Calculate the direction and power of the goal kick
    const direction = {
      x: bestTarget.currentPosition.x - ball.position.x,
      y: bestTarget.currentPosition.y - ball.position.y,
    };
    const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);

    const kickPower = this.stats.kicking || this.stats.passing;
    const speed = (kickPower / 100) * 30; // Goal kicks are typically powerful

    // Set the ball's velocity
    ball.setVelocity({
      x: (direction.x / magnitude) * speed,
      y: (direction.y / magnitude) * speed,
    });

    // Update ball and player state
    ball.isShot = false;
    ball.carrier = null;
    this.hasBall = false;

    console.log(
      `${this.name} launches the ball towards ${
        bestTarget.name || "the midfield"
      }.`
    );
  }

  // Set piece free kick method (placeholder)
  setPieceFreeKick(ball, position, teammates, opponents) {
    console.log(`${this.name} is taking a free kick.`);

    // For simplicity, we'll have the player pass the ball to a teammate
    const targetTeammate = this.findBestTeammateToPass(teammates, opponents);

    if (targetTeammate) {
      this.actionPass(ball, targetTeammate);
    } else {
      // If no teammate to pass to, the player can dribble
      this.actionDribble(ball, opponents, teammates);
    }
  }

  // 9. Fitness and Injury Management
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

  update(ball, opponents, teammates) {
    if (this.injured) {
      this.actionHoldPosition(teammates);
    } else {
      this.decideAction(ball, opponents, teammates);
      this.updateFitness();
    }
  }

  // 10. Helper Methods
  shouldPass(teammates, opponents, gameContext) {
    const passingSkill = this.stats.passing;
    const dribblingSkill = this.stats.dribbling;
    const pressureFromOpponents =
      this.calculatePressureFromOpponents(opponents);
    const teamPassingPreference = this.teamTactics.passingPreference || 50; // 0 (prefer dribbling), 100 (prefer passing)

    // Calculate base pass and dribble tendencies
    let passTendency =
      (pressureFromOpponents / 100) * 40 + // More pressure increases passing tendency
      (teamPassingPreference / 100) * 30 + // Team tactics influence
      (passingSkill / 100) * 20 + // Passing skill influence
      ((100 - dribblingSkill) / 100) * 10; // Less dribbling skill favors passing

    let dribbleTendency =
      ((100 - pressureFromOpponents) / 100) * 40 + // Less pressure increases dribbling tendency
      ((100 - teamPassingPreference) / 100) * 30 + // Team tactics influence
      (dribblingSkill / 100) * 20 + // Dribbling skill influence
      ((100 - passingSkill) / 100) * 10; // Less passing skill favors dribbling

    // Adjust tendencies based on game context
    switch (gameContext) {
      case "kickoff":
        passTendency += 50; // Significantly favor passing at kickoff
        break;
      case "defensiveThird":
        passTendency += 20; // Encourage safer play in defensive third
        dribbleTendency -= 20;
        break;
      case "attackingThird":
        dribbleTendency += 20; // Encourage taking on opponents in attacking third
        break;
      case "setPiece":
        // Additional context-specific adjustments can be made here
        break;
      case "openPlay":
      default:
        // No adjustment needed
        break;
    }

    // Decide to pass if pass tendency is higher than dribble tendency
    return (
      passTendency > dribbleTendency &&
      this.findBestTeammateToPass(teammates, opponents)
    );
  }

  calculatePressureFromOpponents(opponents) {
    // Calculate the cumulative pressure from nearby opponents
    const pressureRadius = 15; // Units
    let pressure = 0;

    opponents.forEach((opponent) => {
      const distance = this.calculateDistance(
        this.currentPosition,
        opponent.currentPosition
      );
      if (distance < pressureRadius) {
        // Closer opponents contribute more to pressure
        pressure += ((pressureRadius - distance) / pressureRadius) * 100;
      }
    });

    // Normalize pressure to a value between 0 and 100
    return Math.min(pressure, 100);
  }

  shouldShoot(ball, gameContext) {
    const distanceToGoal = this.calculateDistance(
      this.currentPosition,
      this.getOpponentGoalPosition()
    );
    const shootingSkill = this.stats.shooting;

    let shootTendency = (shootingSkill / 100) * 50;

    // Adjust shoot tendency based on game context
    if (gameContext === "attackingThird") {
      shootTendency += 30; // Encourage shooting in attacking third
    } else if (gameContext === "defensiveThird") {
      shootTendency -= 50; // Discourage shooting from defensive third
    }

    // Decide to shoot if tendency is high and within shooting range
    return shootTendency > 50 && distanceToGoal < 30; // Adjust distance as needed
  }

  shouldMakeRun(opponents) {
    return (
      this.hasSpaceToRun(opponents) &&
      !this.isBeingMarked(opponents) &&
      this.stats.pace > 60
    );
  }

  shouldPress(ball, opponents) {
    const distanceToBall = this.calculateDistance(
      this.currentPosition,
      ball.position
    );
    return distanceToBall < 20 && this.stats.defending > 50;
  }

  findBestTeammateToPass(teammates, opponents) {
    let bestTeammate = null;
    let highestScore = -Infinity;

    teammates.forEach((teammate) => {
      if (teammate === this) return;

      const distance = this.calculateDistance(
        this.currentPosition,
        teammate.currentPosition
      );

      const opponentProximity = opponents.reduce((minDistance, opponent) => {
        const dist = this.calculateDistance(
          teammate.currentPosition,
          opponent.currentPosition
        );
        return dist < minDistance ? dist : minDistance;
      }, Infinity);

      // Calculate a score based on distance to teammate and distance from opponents
      const score =
        (opponentProximity / 100) * 70 - // Teammates further from opponents are preferred
        (distance / 100) * 30; // Closer teammates are preferred

      if (score > highestScore) {
        highestScore = score;
        bestTeammate = teammate;
      }
    });

    return bestTeammate;
  }

  // Method to find the closest teammate
  findClosestTeammate(teammates, opponents) {
    let closestTeammate = null;
    let shortestDistance = Infinity;

    teammates.forEach((teammate) => {
      if (teammate !== this) {
        const distance = this.calculateDistance(
          this.currentPosition,
          teammate.currentPosition
        );

        // Check for a clear passing lane
        if (this.hasClearPassingLane(teammate, opponents)) {
          if (distance < shortestDistance) {
            shortestDistance = distance;
            closestTeammate = teammate;
          }
        }
      }
    });

    return closestTeammate;
  }

  hasClearPassingLane(teammate, opponents) {
    const laneClearanceBuffer = 2; // Units of clearance
    const direction = {
      x: teammate.currentPosition.x - this.currentPosition.x,
      y: teammate.currentPosition.y - this.currentPosition.y,
    };
    const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);
    const unitDirection = {
      x: direction.x / magnitude,
      y: direction.y / magnitude,
    };

    return !opponents.some((opponent) => {
      const playerToOpponent = {
        x: opponent.currentPosition.x - this.currentPosition.x,
        y: opponent.currentPosition.y - this.currentPosition.y,
      };
      const dotProduct =
        playerToOpponent.x * unitDirection.x +
        playerToOpponent.y * unitDirection.y;
      const projectionLength = dotProduct / magnitude;
      const closestPointOnLine = {
        x: this.currentPosition.x + unitDirection.x * projectionLength,
        y: this.currentPosition.y + unitDirection.y * projectionLength,
      };
      const distanceToLine = this.calculateDistance(
        opponent.currentPosition,
        closestPointOnLine
      );
      return distanceToLine < laneClearanceBuffer;
    });
  }

  calculateDistance(position1, position2) {
    return Math.sqrt(
      (position2.x - position1.x) ** 2 + (position2.y - position1.y) ** 2
    );
  }

  calculateAngleTo(fromPosition, toPosition) {
    const dx = toPosition.x - fromPosition.x;
    const dy = toPosition.y - fromPosition.y;
    const angleInRadians = Math.atan2(dy, dx);
    const angleInDegrees = (angleInRadians * 180) / Math.PI;
    return angleInDegrees;
  }

  isWithinBoundaries() {
    return (
      this.currentPosition.x >= -this.field.width / 2 &&
      this.currentPosition.x <= this.field.width / 2 &&
      this.currentPosition.y >= -this.field.length / 2 &&
      this.currentPosition.y <= this.field.length / 2
    );
  }

  isBeingMarked(opponents) {
    const markingRadius = 5; // Units
    return opponents.some((opponent) => {
      const distance = this.calculateDistance(
        this.currentPosition,
        opponent.currentPosition
      );
      return distance < markingRadius;
    });
  }

  hasSpaceToRun(opponents) {
    const spaceRadius = 10; // Units
    return !opponents.some((opponent) => {
      const distance = this.calculateDistance(
        this.currentPosition,
        opponent.currentPosition
      );
      return distance < spaceRadius;
    });
  }

  findClosestTeammateToBall(ball, teammates) {
    return teammates.reduce((closestPlayer, player) => {
      const distanceToBall = this.calculateDistance(
        player.currentPosition,
        ball.position
      );
      const closestDistance = closestPlayer
        ? this.calculateDistance(closestPlayer.currentPosition, ball.position)
        : Infinity;

      return distanceToBall < closestDistance ? player : closestPlayer;
    }, null);
  }

  getOpponentGoalPosition() {
    const { opponentGoal } = this.getOwnAndOpponentGoals();
    const centerX = (opponentGoal.leftPost.x + opponentGoal.rightPost.x) / 2;
    const centerY = (opponentGoal.leftPost.y + opponentGoal.rightPost.y) / 2;
    return { x: centerX, y: centerY };
  }

  getOwnGoalPosition() {
    const { ownGoal } = this.getOwnAndOpponentGoals();
    const centerX = (ownGoal.leftPost.x + ownGoal.rightPost.x) / 2;
    const centerY = (ownGoal.leftPost.y + ownGoal.rightPost.y) / 2;
    return { x: centerX, y: centerY };
  }

  getOwnAndOpponentGoals() {
    if (!this.field) {
      throw new Error("Field data is required to determine goal positions.");
    }

    const isHomeTeam = this.teamSide === "home";

    const ownGoal = isHomeTeam
      ? {
          leftPost: { x: -this.field.width / 4, y: -this.field.length / 2 },
          rightPost: { x: this.field.width / 4, y: -this.field.length / 2 },
        }
      : {
          leftPost: { x: -this.field.width / 4, y: this.field.length / 2 },
          rightPost: { x: this.field.width / 4, y: this.field.length / 2 },
        };

    const opponentGoal = isHomeTeam
      ? {
          leftPost: { x: -this.field.width / 4, y: this.field.length / 2 },
          rightPost: { x: this.field.width / 4, y: this.field.length / 2 },
        }
      : {
          leftPost: { x: -this.field.width / 4, y: -this.field.length / 2 },
          rightPost: { x: this.field.width / 4, y: -this.field.length / 2 },
        };

    return { ownGoal, opponentGoal };
  }

  getDirectionToOpponentGoal() {
    const opponentGoal = this.getOpponentGoalPosition();
    const direction = {
      x: opponentGoal.x - this.currentPosition.x,
      y: opponentGoal.y - this.currentPosition.y,
    };
    const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);
    return {
      x: direction.x / magnitude,
      y: direction.y / magnitude,
    };
  }

  isSpaceOccupied(position, opponents, radius) {
    return opponents.some((opponent) => {
      const distance = this.calculateDistance(
        position,
        opponent.currentPosition
      );
      return distance < radius;
    });
  }

  // Method to attempt a defensive play (intercept or tackle)
  attemptDefensivePlay(opponents, ball) {
    const opponentWithBall = opponents.find((opponent) => opponent.hasBall);
    if (!opponentWithBall) return;

    const tackleProbability =
      this.stats.defending /
      (this.stats.defending + opponentWithBall.stats.dribbling);

    if (Math.random() < tackleProbability) {
      // Successful tackle
      this.hasBall = true;
      ball.carrier = this;
      opponentWithBall.hasBall = false;
      console.log(
        `${this.name} successfully tackles ${opponentWithBall.name} and gains possession.`
      );
    } else {
      // Unsuccessful tackle; possible foul
      if (Math.random() < 0.2) {
        // Foul committed
        console.log(`${this.name} commits a foul on ${opponentWithBall.name}.`);
        // Handle foul logic...
      } else {
        console.log(`${this.name} fails to tackle ${opponentWithBall.name}.`);
      }
    }
  }

  getDefensivePosition() {
    // Calculate defensive position based on formation and tactics
    const ownGoal = this.getOwnGoalPosition();
    const offset = 30; // Units away from own goal
    const directionAwayFromGoal = {
      x: this.currentPosition.x - ownGoal.x,
      y: this.currentPosition.y - ownGoal.y,
    };
    const magnitude = Math.sqrt(
      directionAwayFromGoal.x ** 2 + directionAwayFromGoal.y ** 2
    );
    const targetPosition = {
      x: ownGoal.x + (directionAwayFromGoal.x / magnitude) * offset,
      y: ownGoal.y + (directionAwayFromGoal.y / magnitude) * offset,
    };
    return targetPosition;
  }

  // Method to find open space
  findOpenSpace(opponents) {
    const searchRadius = 20; // Units
    const angleIncrement = 15; // Degrees
    let bestSpace = null;
    let maxDistance = 0;

    for (let angle = -90; angle <= 90; angle += angleIncrement) {
      const radian = (angle * Math.PI) / 180;
      const potentialSpace = {
        x: this.currentPosition.x + searchRadius * Math.cos(radian),
        y: this.currentPosition.y + searchRadius * Math.sin(radian),
      };

      if (
        this.field.isWithinBounds(potentialSpace) &&
        !this.isSpaceOccupied(potentialSpace, opponents, 5)
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
    return bestSpace;
  }

  findBestDribblePosition(opponents) {
    const forwardDistance = 10; // Units to move forward
    const directionToGoal = this.getDirectionToOpponentGoal();
    const potentialPosition = {
      x: this.currentPosition.x + directionToGoal.x * forwardDistance,
      y: this.currentPosition.y + directionToGoal.y * forwardDistance,
    };

    if (
      this.field.isWithinBounds(potentialPosition) &&
      !this.isSpaceOccupied(potentialPosition, opponents, 5)
    ) {
      return potentialPosition;
    } else {
      // Try moving slightly to the left or right
      const angles = [-15, 15];
      for (let angle of angles) {
        const rad = (angle * Math.PI) / 180;
        const newDirection = {
          x:
            directionToGoal.x * Math.cos(rad) -
            directionToGoal.y * Math.sin(rad),
          y:
            directionToGoal.x * Math.sin(rad) +
            directionToGoal.y * Math.cos(rad),
        };
        const newPosition = {
          x: this.currentPosition.x + newDirection.x * forwardDistance,
          y: this.currentPosition.y + newDirection.y * forwardDistance,
        };
        if (
          this.field.isWithinBounds(newPosition) &&
          !this.isSpaceOccupied(newPosition, opponents, 5)
        ) {
          return newPosition;
        }
      }
    }
    return null;
  }
}

module.exports = Player;
