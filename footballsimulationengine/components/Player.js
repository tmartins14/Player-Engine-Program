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
  decideAction(ball, opponents, team) {
    // console.log(this.field);
    console.log(`${this.name} hasBall: ${this.hasBall}`);

    if (this.hasBall) {
      // The player has the ball, so they need to decide what to do with it
      this.decideActionWithBall(ball, opponents, team);
    } else if (ball.carrier && ball.carrier.teamId === this.teamId) {
      // The player's team has possession, but this player does not have the ball
      this.decideActionWithoutBallInPossession(ball, opponents, team);
    } else if (!ball.carrier) {
      // No player has the ball: move the closest player to the ball to claim possession
      this.decideActionChaseBall(ball, team);
    } else if (ball.carrier.teamId !== this.teamId) {
      // The opponent has possession of the ball, so this player should respond accordingly
      this.decideActionWithoutBallOutOfPossession(ball, opponents, team);
    } else if (!ball.isInPlay) {
      // The ball is out of play (e.g., corner, free kick, etc.)
      this.decideActionDuringDeadBall(ball, opponents, team);
    } else {
      // Default fallback action if none of the above conditions are met
      this.actionHoldPosition();
    }
  }

  decideActionChaseBall(ball, team) {
    const closestTeammate = this.findClosestTeammateToBall(ball, team);

    // If this player is the closest, move toward the ball to claim it
    if (closestTeammate === this) {
      console.log(`${this.name} is chasing the ball to claim possession.`);
      this.actionMoveTowardsTarget(ball.position);
    } else {
      // If not the closest, perform a fallback action (e.g., find space, press)
      this.actionHoldPosition();
    }
  }

  decideActionWithBall(ball, opponents, team) {
    const { passingStyle = "default", tempo = "normal" } =
      this.teamInstructions || {};

    // Prioritize shooting if in a shooting position
    if (this.shouldShoot(ball, opponents, team)) {
      this.actionShoot(ball, opponents, team);
    }
    // Check if passing is a good option
    else if (this.shouldPass(ball, team, opponents)) {
      const targetTeammate = this.findBestTeammateToPass(team, opponents);

      // Only pass if a valid teammate is found
      if (targetTeammate) {
        this.actionPass(ball, targetTeammate);
      } else {
        this.actionDribble(ball, opponents, team); // If no pass target, dribble
      }
    }
    // If neither shooting nor passing is ideal, dribble
    else {
      this.actionDribble(ball, opponents, team);
    }
  }

  decideActionWithoutBallInPossession(ball, opponents, team) {
    const { offensiveRuns = "normal" } = this.teamInstructions || {};

    if (this.shouldMakeRun(opponents)) {
      this.actionMakeRun(opponents);
    } else {
      this.actionFindSpace(opponents);
    }
  }

  decideActionWithoutBallOutOfPossession(ball, opponents, team) {
    const { pressingIntensity = "normal" } = this.teamInstructions || {};

    if (this.shouldPress(ball, opponents, team)) {
      this.actionPress(ball, opponents, team);
    } else {
      this.actionDropIntoDefense();
    }
  }

  decideActionDuringDeadBall(ball, opponents, team) {
    const { setPieceFocus = "balanced" } = this.teamInstructions || {};

    if (this.isAttackingSetPiece()) {
      this.actionMoveToAttackingSetPiecePosition();
    } else {
      this.actionMoveToDefensiveSetPiecePosition();
    }
  }

  //4. "Should" Methods

  shouldDribbleOutOfPress(opponents) {
    // Calculate the pressure level around the player
    const pressureLevel = this.calculatePressure(opponents);

    // Define thresholds for pressure and player stats
    const pressureThreshold = 50; // Example threshold for pressure level to trigger dribbling out
    const dribblingThreshold = 70; // Minimum dribbling skill needed to attempt to dribble out
    const composureThreshold = 65; // Minimum composure needed to maintain control under pressure

    // Determine if the player should attempt to dribble out of the press
    return (
      pressureLevel > pressureThreshold && // High pressure level
      this.stats.dribbling >= dribblingThreshold && // Sufficient dribbling skill
      this.stats.composure >= composureThreshold // Sufficient composure
    );
  }

  shouldTakeOnDefender(opponents) {
    // Find the nearest opponent to the player
    const nearestOpponent = this.findNearestOpponent(opponents);

    // If there is no opponent nearby, return false
    if (!nearestOpponent) {
      return false;
    }

    // Calculate the distance to the nearest opponent
    const distanceToOpponent = this.calculateDistance(
      this.currentPosition,
      nearestOpponent.currentPosition
    );

    // Define a threshold for how close the opponent needs to be to consider taking them on
    const proximityThreshold = 5; // Example threshold in meters

    // Determine if the player's dribbling stat is higher than the opponent's defending stat
    const hasDribblingAdvantage =
      this.stats.dribbling > nearestOpponent.stats.defending;

    // Decide to take on the defender if the opponent is within proximity and the player has a dribbling advantage
    if (distanceToOpponent <= proximityThreshold && hasDribblingAdvantage) {
      return true;
    }

    return false;
  }

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

  shouldPass(ball, team, opponents) {
    const { passingStyle = "short" } = this.teamInstructions || {};

    // Find the best teammate to pass to
    const targetTeammate = this.findBestTeammateToPass(team, opponents);

    // If no valid teammate is found, return false
    if (!targetTeammate) {
      return false;
    }

    const distanceToTeammate = this.calculateDistance(
      this.currentPosition,
      targetTeammate.currentPosition
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

  shouldMakeRun(opponents) {
    const { offensiveRuns = "balanced" } = this.teamInstructions || {};

    // Decision logic based on team instructions, player's pace, positioning, and opponents
    if (
      offensiveRuns === "aggressive" &&
      this.stats.pace > 70 &&
      !this.isBeingMarked(opponents)
    ) {
      return true;
    } else if (
      offensiveRuns === "balanced" &&
      this.stats.pace > 60 &&
      !this.isOffside &&
      this.hasSpaceToRun(opponents)
    ) {
      return true;
    } else if (
      offensiveRuns === "conservative" &&
      this.stats.pace > 50 &&
      this.isInFormationPosition() &&
      !this.isBeingMarked(opponents)
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

  shouldDribbleIntoSpace(opponents) {
    // Find potential open space around the player
    const openSpace = this.actionFindSpace(opponents);

    // Determine if the player has the pace and dribbling skills to exploit the space
    if (openSpace) {
      const distanceToSpace = this.calculateDistance(
        this.currentPosition,
        openSpace
      );

      // Determine if the player should dribble into space based on their pace, dribbling, and the distance
      return (
        this.stats.pace > 60 && // Player has decent pace
        this.stats.dribbling > 65 && // Player has good dribbling
        distanceToSpace < 30 // The space is within a reasonable distance
      );
    }

    return false;
  }

  // 5. Ball Handling and Shooting
  actionShoot(ball) {
    // console.log(`${this.name} shoots the ball!`);

    // Determine the target position for the shot
    const opponentGoal = this.field.getOpponentGoalPosition(); // Assume this returns the opponent's goal center
    const shotAccuracy = this.stats.shooting; // Player's shooting accuracy
    const shotPower = this.stats.shooting; // Using shooting stat for both accuracy and power

    // Calculate the target with some randomness to simulate shot accuracy
    const accuracyOffset = (100 - shotAccuracy) / 10; // Higher accuracy results in a smaller offset
    const targetX = opponentGoal.x + (Math.random() * 2 - 1) * accuracyOffset; // Randomly offset the x-coordinate
    const targetY = opponentGoal.y; // Y-coordinate is the goal's y-position

    // Calculate the ball's new velocity to simulate the shot
    const direction = {
      x: targetX - ball.position.x,
      y: targetY - ball.position.y,
    };
    const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);
    const powerMultiplier = shotPower / 100; // Scale power to a factor (0-1)

    ball.setVelocity({
      x: (direction.x / magnitude) * powerMultiplier * 30, // 30 is an arbitrary max speed for the ball
      y: (direction.y / magnitude) * powerMultiplier * 30,
    });

    // Set the ball state to indicate a shot has been made
    ball.isShot = true;
    ball.carrier = null; // Ball is no longer with the player
    this.hasBall = false;

    // Update the ball's position towards the goal (invoking the ball's movement in the simulation loop)
    // console.log(
    //   `${this.name} shoots towards (${targetX.toFixed(2)}, ${targetY.toFixed(
    //     2
    //   )})`
    // );
  }

  actionPass(ball, targetTeammate) {
    if (!targetTeammate) {
      console.error(
        `${this.name} could not find a suitable teammate to pass to.`
      );
      return;
    }

    // Calculate the direction and velocity of the pass
    const direction = {
      x: targetTeammate.currentPosition.x - this.currentPosition.x,
      y: targetTeammate.currentPosition.y - this.currentPosition.y,
    };

    const distance = this.calculateDistance(
      this.currentPosition,
      targetTeammate.currentPosition
    );

    // Determine pass power based on player's passing stat
    const passPower = this.stats.passing; // Use player's passing stat
    const speed = (passPower / 100) * 20; // Scale speed based on passPower (20 is arbitrary max speed)

    // Normalize the direction and calculate velocity
    const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);
    ball.setVelocity({
      x: (direction.x / magnitude) * speed,
      y: (direction.y / magnitude) * speed,
    });

    // Set ball state to indicate it's in transit
    ball.isShot = false; // This is a pass, not a shot
    ball.carrier = null; // Ball is no longer with the player
    this.hasBall = false; // The player no longer has the ball

    console.log(
      `${this.name} passes the ball towards ${
        targetTeammate.name
      } at (${targetTeammate.currentPosition.x.toFixed(
        2
      )}, ${targetTeammate.currentPosition.y.toFixed(2)}).`
    );
  }

  actionDribble(ball, opponents, team) {
    let targetPosition;

    // Check if the player should dribble into space
    if (this.shouldDribbleIntoSpace(opponents)) {
      targetPosition = this.actionFindSpace(ball, opponents, team);
    }
    // Check if the player should take on a defender
    else if (this.shouldTakeOnDefender(opponents)) {
      targetPosition = this.actionTakeOnDefender(ball, opponents, team);
    }
    // Check if the player needs to dribble out of a press
    else if (this.shouldDribbleOutOfPress(opponents)) {
      targetPosition = this.actionEscapePress(ball, opponents, team);
    }
    // If none of the conditions are met, try to pass instead
    else {
      const targetTeammate = this.findBestTeammateToPass(team, opponents);
      if (targetTeammate) {
        this.actionPass(ball, targetTeammate);
      } else {
        // If no valid pass, default to holding position or another action
        this.actionHoldPosition();
      }
      return;
    }

    // Move towards the determined target position
    this.actionMoveTowardsTarget(targetPosition);
  }

  actionMoveTowardsTarget(targetPosition, isDribbling = false) {
    const direction = {
      x: targetPosition.x - this.currentPosition.x,
      y: targetPosition.y - this.currentPosition.y,
    };

    // Calculate magnitude (distance to target) and prevent division by zero
    const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);
    if (magnitude === 0) {
      // console.log(`${this.name} is already at the target position.`);
      return;
    }

    // Adjust speed based on whether this is a dribbling or non-dribbling action
    const speed = isDribbling
      ? this.stats.dribbling * 0.1
      : this.stats.pace * 0.05;

    // Update the player's position by moving towards the target
    const moveX = (direction.x / magnitude) * speed;
    const moveY = (direction.y / magnitude) * speed;
    this.currentPosition.x += moveX;
    this.currentPosition.y += moveY;

    // Calculate the remaining distance to the target after moving
    const distanceToTarget = this.calculateDistance(
      this.currentPosition,
      targetPosition
    );

    // If close enough to the target, snap to the target position
    if (distanceToTarget <= speed) {
      this.currentPosition = { ...targetPosition };
      // console.log(
      //   `${this.name} has reached the target position:`,
      //   this.currentPosition
      // );
    } else {
      // Continue moving towards the target in the next frame
      // console.log(`${this.name} is moving towards the target position.`);
    }
  }

  actionTakeOnDefender(ball, opponents, team) {
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

  actionEscapePress(ball, opponents, team) {
    const escapeRoute = {
      x: this.currentPosition.x,
      y: this.currentPosition.y + 10,
    };
    return this.field.isWithinBounds(escapeRoute)
      ? escapeRoute
      : this.currentPosition;
  }

  actionMakeRun(opponents) {
    // console.log(`${this.name} is making a run into space.`);

    // Find the best open space to run into
    const spaceToMoveInto = this.actionFindSpace(opponents);

    if (!spaceToMoveInto) {
      // console.log(`${this.name} could not find space to run into.`);
      return;
    }

    // Move towards the open space
    this.actionMoveTowardsTarget(spaceToMoveInto, false);

    // console.log(
    //   `${this.name} is running towards (${spaceToMoveInto.x.toFixed(
    //     2
    //   )}, ${spaceToMoveInto.y.toFixed(2)}).`
    // );
  }

  actionFindSpace(opponents) {
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

    // Move to the best space found
    if (bestSpace) {
      this.actionMoveTowardsTarget(bestSpace, false);
    } else {
      // No space found; fallback behavior
      // console.log(`${this.name} couldn't find space and is holding position.`);
    }
  }

  actionPress(ball, opponents, team) {
    // console.log(`${this.name} is pressing the opponent.`);

    // Find the opponent who currently has the ball
    const opponentWithBall = opponents.find((opponent) => opponent.hasBall);

    if (opponentWithBall) {
      // Move towards the opponent with the ball
      const targetPosition = opponentWithBall.currentPosition;

      // Move towards the opponent's position
      this.actionMoveTowardsTarget(targetPosition, false);

      // console.log(
      //   `${this.name} is pressing ${
      //     opponentWithBall.name
      //   } at (${targetPosition.x.toFixed(2)}, ${targetPosition.y.toFixed(2)}).`
      // );
    } else {
      // If no specific opponent has the ball, press the ball's current position
      this.actionMoveTowardsTarget(ball.position, false);
      // console.log(
      //   `${this.name} is pressing the ball at (${ball.position.x.toFixed(
      //     2
      //   )}, ${ball.position.y.toFixed(2)}).`
      // );
    }
  }

  actionDropIntoDefense() {
    // console.log(`${this.name} drops into a defensive position.`);

    // Retrieve the team's defensive depth from tactics (assume a range of 0-100, where 100 is the deepest)
    const { defensiveDepth = 50 } = this.team.tactics || {};

    // Defensive depth determines how far back the team plays:
    // 0 = highest line, 100 = deepest line
    const normalizedDefensiveDepth = defensiveDepth / 100; // Convert to 0-1 scale

    // Define the base defensive line position based on the team's side
    let baseDefensiveLineY;
    if (this.team.name === "Home Team") {
      baseDefensiveLineY = -this.field.length / 2; // Home team defends in the negative half
    } else {
      baseDefensiveLineY = this.field.length / 2; // Away team defends in the positive half
    }

    // Adjust defensive line based on tactics
    const defensiveLineY = baseDefensiveLineY * normalizedDefensiveDepth;

    // Adjust target position based on player's role and team's defensive line
    const formationPositions = this.team.getFormationPositions();
    const rolePosition = formationPositions[this.position];

    if (!rolePosition) {
      // console.error(`Position ${this.position} not found in the formation.`);
      return;
    }

    // Calculate the target defensive position based on team's defensive depth and player's role
    const targetPosition = {
      x: rolePosition.x * this.field.width, // Maintain the formation's x position
      y: defensiveLineY, // Adjust y position based on defensive line depth
    };

    // Move towards the defensive position

    this.actionMoveTowardsTarget(targetPosition, false);

    // console.log(
    //   `${this.name} moves to defensive line at (${targetPosition.x.toFixed(
    //     2
    //   )}, ${targetPosition.y.toFixed(2)}).`
    // );
  }

  actionHoldPosition() {
    // console.log(`${this.name} is holding position.`);

    // No movement is needed, but we can log the current position to provide feedback
    const { x, y } = this.currentPosition;
    // console.log(
    //   `${this.name} holds position at (${x.toFixed(2)}, ${y.toFixed(2)}).`
    // );
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
    // console.log(`${this.name} intercepts the ball.`);

    // Update the player's position to the ball's current position
    this.currentPosition = { ...ball.position };

    // Take possession of the ball
    this.hasBall = true;
    ball.changeCarrier(this); // Update the ball's carrier to this player

    // Stop the ball's movement
    ball.stop();

    // console.log(
    //   `${this.name} now has the ball at (${this.currentPosition.x.toFixed(
    //     2
    //   )}, ${this.currentPosition.y.toFixed(2)}).`
    // );
  }

  actionTackle(opponents, ball, isSlideTackle) {
    const foulProbability = 0.2;
    const isFoul = Math.random() < foulProbability;

    if (isFoul) {
      // console.log(`${this.name} commits a foul.`);
      return true;
    } else {
      // console.log(`${this.name} successfully tackles.`);
      return false;
    }
  }

  actionBlockShot(ball) {
    // console.log(`${this.name} blocks the shot!`);

    // Update player's position to the ball's current position, simulating the block
    this.currentPosition = { ...ball.position };

    // Stop the ball's movement to indicate it was blocked
    ball.stop();

    // Optionally, deflect the ball slightly to indicate a block (random small deflection)
    const deflectionAngle = Math.random() * Math.PI; // Random angle in radians
    const deflectionPower = 2; // Adjust this to simulate deflection power
    ball.setVelocity({
      x: Math.cos(deflectionAngle) * deflectionPower,
      y: Math.sin(deflectionAngle) * deflectionPower,
    });

    // Set the ball as "loose" after the block
    ball.isLoose = true;
    ball.carrier = null; // No one has control after the block

    //   console.log(
    //     `${this.name} deflects the ball to position (${ball.position.x.toFixed(
    //       2
    //     )}, ${ball.position.y.toFixed(2)}).`
    //   );
  }

  actionClearBall(ball) {
    // console.log(`${this.name} clears the ball.`);

    // Determine a direction to clear the ball (e.g., away from the player's goal)
    // For simplicity, let's assume the player clears the ball forward and to the side
    const clearDirection = Math.random() > 0.5 ? 1 : -1; // Randomly choose left or right
    const clearDistance = 30; // Distance in meters to clear the ball

    // Calculate the new position for the ball
    const targetPosition = {
      x: this.currentPosition.x + clearDirection * 10, // 10 meters to the side
      y: this.currentPosition.y + clearDistance, // 30 meters forward
    };

    // Check if the target position is within the field boundaries
    if (this.field.isWithinBounds(targetPosition)) {
      // Update the ball's position and velocity to simulate a clearance
      ball.position = targetPosition;
      ball.setVelocity({
        x: clearDirection * 20, // Adjust velocity values to match the direction and power
        y: clearDistance > 0 ? 30 : -30, // Positive or negative based on the direction
      });

      // Set the ball as loose after the clearance
      ball.isLoose = true;
      ball.carrier = null; // No one has control after the clearance

      // console.log(
      //   `${this.name} clears the ball to position (${ball.position.x.toFixed(
      //     2
      //   )}, ${ball.position.y.toFixed(2)}).`
      // );
    } else {
      // If the target position is out of bounds, clear the ball towards the field center
      // console.log(
      //   `${this.name}'s clearance goes out of bounds. Resetting ball to a safer position.`
      // );
      ball.resetBall();
    }
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

  findBestTeammateToPass(team, opponents) {
    let bestTeammate = null;
    let bestScore = -Infinity;

    team.forEach((teammate) => {
      // Skip if the teammate is the current player
      if (teammate === this) return;

      // Calculate the distance to the teammate
      const distance = this.calculateDistance(
        this.currentPosition,
        teammate.currentPosition
      );

      // Check if there is a clear passing lane
      const hasClearLane = this.hasClearPassingLane(teammate, opponents);

      // Calculate a score for this passing option
      let score = 0;

      // Prefer closer teammates if they have a clear lane
      if (hasClearLane) {
        score += 100 - distance; // Closer is better
      }

      // Adjust score based on teammate's position (e.g., closer to the goal)
      const goalPosition = this.field.getOpponentGoalPosition(this.team.name);
      const teammateDistanceToGoal = this.calculateDistance(
        teammate.currentPosition,
        goalPosition
      );
      score += (100 - teammateDistanceToGoal) / 2; // Closer to goal is better

      // Compare this teammate's score with the best score found so far
      if (score > bestScore) {
        bestScore = score;
        bestTeammate = teammate;
      }
    });

    return bestTeammate;
  }

  hasClearPassingLane(teammate, opponents) {
    // Simple logic: check if there's any opponent in a direct line between the player and the teammate
    const laneClearanceBuffer = 2; // How much space around the passing line to consider it "clear"

    // Define the passing line as a vector
    const direction = {
      x: teammate.currentPosition.x - this.currentPosition.x,
      y: teammate.currentPosition.y - this.currentPosition.y,
    };
    const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);
    const unitDirection = {
      x: direction.x / magnitude,
      y: direction.y / magnitude,
    };

    // Check each opponent to see if they are in the passing lane
    return !opponents.some((opponent) => {
      // Vector from player to opponent
      const playerToOpponent = {
        x: opponent.currentPosition.x - this.currentPosition.x,
        y: opponent.currentPosition.y - this.currentPosition.y,
      };
      const dotProduct =
        playerToOpponent.x * unitDirection.x +
        playerToOpponent.y * unitDirection.y;
      const projectionLength = dotProduct / magnitude;

      // Find the closest point on the passing line to the opponent
      const closestPointOnLine = {
        x: this.currentPosition.x + unitDirection.x * projectionLength,
        y: this.currentPosition.y + unitDirection.y * projectionLength,
      };

      // Calculate the distance from the opponent to this closest point
      const distanceToLine = this.calculateDistance(
        opponent.currentPosition,
        closestPointOnLine
      );

      // If the opponent is within the clearance buffer, they block the lane
      return distanceToLine < laneClearanceBuffer;
    });
  }

  isSpaceOccupied(position, opponents, radius) {
    // Check if any opponent is within the specified radius of the given position
    return opponents.some((opponent) => {
      const distanceToOpponent = this.calculateDistance(
        position,
        opponent.currentPosition
      );
      return distanceToOpponent < radius; // Returns true if any opponent is within the radius
    });
  }

  calculatePressure(opponents) {
    // Define the vicinity range within which opponents are considered to be applying pressure
    const vicinityRange = 5; // Example radius within which opponents are considered to apply pressure

    let pressure = 0;

    // Iterate through the opponents to calculate the pressure
    opponents.forEach((opponent) => {
      const distance = this.calculateDistance(
        this.currentPosition,
        opponent.currentPosition
      );

      // Check if the opponent is within the vicinity range
      if (distance < vicinityRange) {
        // Add to the pressure level for each opponent within range
        pressure += 20; // Each opponent adds a fixed amount of pressure
      }
    });

    return pressure; // Return the total pressure level
  }

  isBeingMarked(opponents) {
    const markingRadius = 5; // Distance to consider the player marked
    return opponents.some((opponent) => {
      const distance = this.calculateDistance(
        this.currentPosition,
        opponent.currentPosition
      );
      return distance < markingRadius;
    });
  }

  hasSpaceToRun(opponents) {
    const spaceRadius = 10; // Define how much space is needed to consider a run
    return !this.isSpaceOccupied(this.currentPosition, opponents, spaceRadius);
  }

  isInFormationPosition() {
    // Check if the player has a formation position defined by the team
    if (!this.formationPosition) {
      return false;
    }

    // Define a tolerance for how close the player should be to their formation position
    const positionTolerance = 5; // Distance tolerance in arbitrary units (e.g., meters)

    // Calculate the distance between the current position and the assigned formation position
    const distanceToFormationPosition = this.calculateDistance(
      this.currentPosition,
      this.formationPosition
    );

    // Check if the player is within the tolerance range of their formation position
    return distanceToFormationPosition <= positionTolerance;
  }

  // Set piece corner kick method
  setPieceCornerKick(ball, side) {
    console.log(`${this.name} is taking a corner kick from the ${side} side.`);

    // Determine the corner position based on the side of the field
    const cornerPosition = {
      x: side === "left" ? -this.field.width / 2 : this.field.width / 2,
      y:
        this.team.name === "Home Team"
          ? -this.field.length / 2
          : this.field.length / 2,
    };

    // Move the ball to the corner position
    ball.position = { ...cornerPosition };

    // Execute the corner kick by setting the ball's velocity towards the penalty box
    const targetX = 0; // Central area of the penalty box
    const targetY =
      this.team.name === "Home Team"
        ? -this.field.length / 4
        : this.field.length / 4;

    this.actionKick(ball, { x: targetX, y: targetY });
  }

  // Set piece free kick method
  setPieceFreeKick(ball, targetPosition) {
    console.log(`${this.name} is taking a free kick.`);

    // Free kick to a specified target position
    this.actionKick(ball, targetPosition);
  }

  // Set piece goal kick method
  setPieceGoalKick(ball) {
    console.log(`${this.name} is taking a goal kick.`);

    // Goal kick logic, usually towards the midfield or further
    const targetX = 0; // Kick towards the middle of the field
    const targetY =
      this.team.name === "Home Team"
        ? this.field.length / 4
        : -this.field.length / 4;

    this.actionKick(ball, { x: targetX, y: targetY });
  }

  // Set piece penalty kick method
  setPiecePenaltyKick(ball) {
    console.log(`${this.name} is taking a penalty kick.`);

    // Penalty kick aimed at the goal
    const targetX = 0; // Aim for the center of the goal
    const targetY =
      this.team.name === "Home Team"
        ? this.field.length / 2
        : -this.field.length / 2;

    this.actionKick(ball, { x: targetX, y: targetY });
  }

  // Helper method to kick the ball towards a target
  actionKick(ball, targetPosition) {
    const direction = {
      x: targetPosition.x - ball.position.x,
      y: targetPosition.y - ball.position.y,
    };

    const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);
    const power = 30; // Arbitrary power for the kick

    ball.setVelocity({
      x: (direction.x / magnitude) * power,
      y: (direction.y / magnitude) * power,
    });

    // Ball is now moving, not carried by any player
    ball.isShot = true;
    ball.carrier = null;
    this.hasBall = false;
  }

  findClosestTeammateToBall(ball, team) {
    // console.log(team);
    return team.reduce((closestPlayer, player) => {
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
}

module.exports = Player;
