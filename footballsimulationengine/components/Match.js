/*
 * Match Class
 * -----------
 * Manages the game flow, timekeeping, and interactions between teams.
 * Coordinates the simulation of the match, including updating player positions, handling events, and updating the ball.
 */

const Ball = require("./Ball");
const Field = require("./Field");
const { calculateDistance } = require("../utilities/utils");

class Match {
  constructor(homeTeam, awayTeam) {
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.field = new Field(11); // 11v11 field
    this.ball = new Ball(this.field);
    this.matchTime = 0; // Start time in seconds
    this.maxTime = 2 * 45 * 60; // Match duration in seconds (90 minutes)
    this.homeScore = 0;
    this.awayScore = 0;
    this.isPlaying = false; // Indicates if the match is currently ongoing
    this.isHomeTeamKickingOff = null; // Will be set in initializePositions
    this.isReset = true;
  }

  // Initialize player positions for both teams
  initializePositions(isSecondHalf = false) {
    // Randomly choose which team kicks off first if not already set
    if (this.isHomeTeamKickingOff === null) {
      this.isHomeTeamKickingOff = Math.random() > 0.5;
    }

    // Set the positions for home and away teams using their formations
    if (!isSecondHalf) {
      // First half: home team defends the bottom goal, away team defends the top goal
      this.homeTeam.setFormationPositions(
        this.field,
        false,
        this.isHomeTeamKickingOff
      );
      this.awayTeam.setFormationPositions(
        this.field,
        true,
        !this.isHomeTeamKickingOff
      );

      // Set goals for the first half
      this.homeTeam.goalPosition = this.field.getGoalPosition(false); // Home team's goal at the bottom
      this.awayTeam.goalPosition = this.field.getGoalPosition(true); // Away team's goal at the top
    } else {
      // Second half: switch sides
      this.homeTeam.setFormationPositions(
        this.field,
        true,
        !this.isHomeTeamKickingOff
      );
      this.awayTeam.setFormationPositions(
        this.field,
        false,
        this.isHomeTeamKickingOff
      );

      // Switch goal positions
      this.homeTeam.goalPosition = this.field.getGoalPosition(true); // Home team's goal at the top
      this.awayTeam.goalPosition = this.field.getGoalPosition(false); // Away team's goal at the bottom
    }

    console.log(
      `Player positions initialized for both teams. ${
        this.isHomeTeamKickingOff ? this.homeTeam.name : this.awayTeam.name
      } is kicking off.`
    );
  }

  // Start or resume the match
  playMatch() {
    if (this.isReset) {
      this.initializePositions(); // Ensure positions are set
      this.kickOff();
      this.isReset = false;
    }

    this.isPlaying = true;
  }

  // Handle the kickoff
  kickOff() {
    console.log("Kickoff!");

    // Reset the ball to the center of the field
    this.ball.resetBall();

    // Determine which team is kicking off
    const kickingOffTeam = this.isHomeTeamKickingOff
      ? this.homeTeam
      : this.awayTeam;

    // Find the player positioned at (0, 0)
    let playerAtCenter = kickingOffTeam.players.find(
      (player) =>
        player.currentPosition.x === 0 && player.currentPosition.y === 0
    );

    if (!playerAtCenter) {
      console.error("No player found at position (0, 0) for kickoff.");
      return;
    }

    // Assign the ball to the player at (0, 0)
    playerAtCenter.hasBall = true;
    this.ball.changeCarrier(playerAtCenter);
    this.ball.position = { x: 0, y: 0 };

    console.log(`${playerAtCenter.name} is kicking off.`);

    // Find the closest teammate to the player at center (excluding themselves)
    let closestTeammate = null;
    let shortestDistance = Infinity;

    kickingOffTeam.players.forEach((player) => {
      if (player !== playerAtCenter) {
        const distance = calculateDistance(
          playerAtCenter.currentPosition,
          player.currentPosition
        );
        if (distance < shortestDistance) {
          shortestDistance = distance;
          closestTeammate = player;
        }
      }
    });

    if (!closestTeammate) {
      console.error("No teammate found to receive the kickoff pass.");
      return;
    }

    console.log(`${playerAtCenter.name} will pass to ${closestTeammate.name}.`);

    // Have playerAtCenter perform a pass action
    const action = {
      type: "pass",
      targetPlayer: closestTeammate,
      passType: "toFeet",
    };
    playerAtCenter.performAction(action, this.ball);

    // Assign a receivePass action to the closest teammate
    closestTeammate.performAction({ type: "receivePass" }, this.ball);
  }

  // Update match simulation per time step
  updateMatch(deltaTime) {
    if (!this.isPlaying) {
      return;
    }

    if (this.matchTime >= this.maxTime) {
      this.endMatch();
      return;
    }

    // Update match time
    this.matchTime += deltaTime;

    // Compute game context
    const gameContext = this.determineGameContext();

    // Update ball's position
    this.ball.updatePosition(deltaTime);

    // Check for ball possession changes (e.g., players gaining possession of a moving ball)
    this.checkForBallPossession();

    // Simulate actions for each team, passing gameContext
    this.homeTeam.decideTeamActions(this.ball, this.awayTeam, gameContext);
    this.awayTeam.decideTeamActions(this.ball, this.homeTeam, gameContext);

    // Update player positions based on their actions
    this.homeTeam.updatePlayers(deltaTime, this.ball, this.awayTeam);
    this.awayTeam.updatePlayers(deltaTime, this.ball, this.homeTeam);

    // Check for events
    if (this.isBallNearBoundary()) {
      this.checkForOutOfBounds();
    }

    if (this.isBallNearGoal()) {
      this.checkForGoal();
    }
  }

  // Method to check if any player can gain possession of the ball
  checkForBallPossession() {
    if (this.ball.carrier) {
      // Ball is already in possession
      return;
    }

    // Iterate over all players
    const allPlayers = [...this.homeTeam.players, ...this.awayTeam.players];

    allPlayers.forEach((player) => {
      if (!player.hasBall) {
        const distanceToBall = calculateDistance(
          player.currentPosition,
          this.ball.position
        );

        const controlRadius = player.calculateControlRadius(); // Adjusted based on field size

        if (distanceToBall <= controlRadius) {
          // Player gains possession
          player.hasBall = true;
          this.ball.changeCarrier(player);
          this.ball.velocity = 0;
          this.ball.isMoving = false;
          this.ball.direction = { x: 0, y: 0 };
          this.ball.destination = null;

          console.log(`${player.name} gains possession of the ball.`);

          // Decide next action after gaining possession
          player.performAction({ type: "hold" }, this.ball);
        }
      }
    });
  }

  // Check if a goal is scored
  checkForGoal() {
    const homeGoal = this.field.getGoalPosition(false); // Home team's goal at the bottom
    const awayGoal = this.field.getGoalPosition(true); // Away team's goal at the top

    const { x, y } = this.ball.position;

    // Adjust goal dimensions based on field size
    const goalWidth = this.field.goalWidth; // Use field's goal width
    const halfGoalWidth = goalWidth / 2;

    // Check if the ball crosses the home team's goal line
    if (
      y <= -this.field.length / 2 &&
      x >= -halfGoalWidth &&
      x <= halfGoalWidth
    ) {
      // Goal for away team
      this.awayScore += 1;
      console.log("Goal for the away team!");
      this.afterGoal();
      return;
    }

    // Check if the ball crosses the away team's goal line
    if (
      y >= this.field.length / 2 &&
      x >= -halfGoalWidth &&
      x <= halfGoalWidth
    ) {
      // Goal for home team
      this.homeScore += 1;
      console.log("Goal for the home team!");
      this.afterGoal();
      return;
    }
  }

  // Handle events after a goal is scored
  afterGoal() {
    // Switch the kicking off team
    this.isHomeTeamKickingOff = !this.isHomeTeamKickingOff;

    // Reset player positions
    this.initializePositions();

    // Reset the ball and kickoff
    this.isReset = true;
    this.playMatch();
  }

  // Check if the ball goes out of bounds
  checkForOutOfBounds() {
    const { x, y } = this.ball.position;

    const halfFieldWidth = this.field.width / 2;
    const halfFieldLength = this.field.length / 2;

    // Out on the sides for throw-ins
    if (x < -halfFieldWidth || x > halfFieldWidth) {
      console.log("Ball went out for a throw-in.");
      this.resetForThrowIn();
    }

    // Out on the goal lines for corner kicks or goal kicks
    if (y < -halfFieldLength || y > halfFieldLength) {
      if (this.ball.lastTouchedBy) {
        const lastTouchedByTeam = this.ball.lastTouchedBy.teamId;
        const attackingTeam =
          lastTouchedByTeam === this.homeTeam.name
            ? this.homeTeam
            : this.awayTeam;
        const defendingTeam = this.getOpponentTeam(attackingTeam);

        if (this.ball.isShot) {
          // Ball went out from a shot, it could be a goal kick
          console.log("Ball went out for a goal kick.");
          this.resetForGoalKick(defendingTeam);
        } else {
          // Otherwise, it could be a corner kick
          console.log("Ball went out for a corner kick.");
          this.resetForCornerKick(attackingTeam);
        }
      } else {
        // Default to goal kick if last touched by unknown
        console.log("Ball went out for a goal kick.");
        const team = y > 0 ? this.awayTeam : this.homeTeam;
        this.resetForGoalKick(team);
      }
    }
  }

  // Check if the ball is near the boundary to optimize checks
  isBallNearBoundary(margin = 5) {
    const { x, y } = this.ball.position;
    const halfFieldWidth = this.field.width / 2;
    const halfFieldLength = this.field.length / 2;
    return (
      Math.abs(x) > halfFieldWidth - margin ||
      Math.abs(y) > halfFieldLength - margin
    );
  }

  // Check if the ball is near the goal area
  isBallNearGoal(margin = 5) {
    const { y } = this.ball.position;
    const halfFieldLength = this.field.length / 2;
    return Math.abs(y) > halfFieldLength - margin;
  }

  // Reset the ball for a throw-in
  resetForThrowIn() {
    const halfFieldWidth = this.field.width / 2;

    // Determine which team takes the throw-in
    const team = this.ball.position.x > 0 ? this.awayTeam : this.homeTeam;
    const opponentTeam = this.getOpponentTeam(team);

    // Set the throw-in position
    const throwInPosition = {
      x: this.ball.position.x > 0 ? halfFieldWidth : -halfFieldWidth,
      y: this.ball.position.y,
    };

    // Ensure throw-in position is within field boundaries
    throwInPosition.y = Math.max(
      -this.field.length / 2,
      Math.min(this.field.length / 2, throwInPosition.y)
    );

    // Reset ball position
    this.ball.resetForThrowIn(throwInPosition);

    // Choose a player to take the throw-in (nearest player)
    const playerTakingThrowIn = team.players.reduce((closest, player) => {
      if (player.injured) return closest;
      const distance = calculateDistance(
        player.currentPosition,
        throwInPosition
      );
      if (!closest || distance < closest.distance) {
        return { player, distance };
      }
      return closest;
    }, null)?.player;

    if (playerTakingThrowIn) {
      // Move the player to the throw-in position
      playerTakingThrowIn.setPosition(throwInPosition);
      // The ball is out of play until the throw-in is taken
      this.ball.isInPlay = false;

      console.log(`${playerTakingThrowIn.name} is taking the throw-in.`);

      // The team decides how to handle the throw-in
      team.decideSetPiece(
        playerTakingThrowIn,
        this.ball,
        opponentTeam,
        "throwIn"
      );

      // Ball is now in play after the throw-in
      this.ball.isInPlay = true;
    } else {
      console.error("No player available to take the throw-in.");
    }
  }

  // Reset the ball for a goal kick
  resetForGoalKick(team) {
    const fieldScalingFactor = this.calculateFieldScalingFactor();
    const goalAreaY = 5 * fieldScalingFactor; // Adjusted distance from goal line

    // Find the goalkeeper or assigned goal kick taker
    const playerTakingGoalKick = team.players.find(
      (player) => player.position === "GK"
    );

    if (playerTakingGoalKick) {
      // Reset ball position for goal kick
      const goalKickPosition = {
        x: 0,
        y:
          team.teamSide === "home"
            ? -this.field.length / 2 + goalAreaY
            : this.field.length / 2 - goalAreaY,
      };
      this.ball.resetForGoalKick(goalKickPosition);

      console.log(`${playerTakingGoalKick.name} is taking the goal kick.`);

      // The team decides how to handle the goal kick
      team.decideSetPiece(
        playerTakingGoalKick,
        this.ball,
        this.getOpponentTeam(team),
        "goalKick"
      );

      // Set possession to the team taking the goal kick
      this.possession(team);
    }
  }

  // Reset the ball for a corner kick
  resetForCornerKick(attackingTeam) {
    const defendingTeam = this.getOpponentTeam(attackingTeam);

    // Determine the side of the corner kick
    const side = this.ball.position.x < 0 ? "left" : "right";

    // Choose a player to take the corner kick
    const playerTakingCornerKick = attackingTeam.chooseCornerTaker(side);

    if (playerTakingCornerKick) {
      // Reset ball position for corner kick
      const cornerKickPosition = {
        x: side === "left" ? -this.field.width / 2 : this.field.width / 2,
        y:
          attackingTeam.teamSide === "home"
            ? this.field.length / 2
            : -this.field.length / 2,
      };
      this.ball.resetForCornerKick(cornerKickPosition);

      console.log(
        `${playerTakingCornerKick.name} is taking the corner kick from the ${side} side.`
      );

      // The team decides how to handle the corner kick
      attackingTeam.decideSetPiece(
        playerTakingCornerKick,
        this.ball,
        defendingTeam,
        "cornerKick",
        side
      );

      // Set possession to the attacking team
      this.possession(attackingTeam);
    }
  }

  // End the match
  endMatch() {
    this.isPlaying = false;
    console.log("Full Time!");
    console.log(
      `Final Score: ${this.homeTeam.name} ${this.homeScore} - ${this.awayScore} ${this.awayTeam.name}`
    );
  }

  // Manage ball possession
  possession(team) {
    // Randomly assign ball possession to one of the players in the team
    const availablePlayers = team.players.filter((player) => !player.injured);
    if (availablePlayers.length === 0) return;

    const playerWithBall =
      availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
    playerWithBall.hasBall = true;
    this.ball.changeCarrier(playerWithBall);
    console.log(`${playerWithBall.name} of ${team.name} has the ball.`);
  }

  // Get current x, y positions of all players and the ball
  getCurrentPositions() {
    const positions = [];

    // Home team players
    this.homeTeam.players.forEach((player) => {
      positions.push(player.currentPosition.x); // Even index
      positions.push(player.currentPosition.y); // Odd index
    });

    // Away team players
    this.awayTeam.players.forEach((player) => {
      positions.push(player.currentPosition.x); // Even index
      positions.push(player.currentPosition.y); // Odd index
    });

    // Ball position (add at the end)
    positions.push(this.ball.position.x); // Even index
    positions.push(this.ball.position.y); // Odd index

    return positions; // Return positions for this frame
  }

  // Determine the game context for AI decision-making
  determineGameContext() {
    const fieldLength = this.field.length;
    const ballPositionY = this.ball.position.y;

    // Determine the field zone
    let fieldZone;
    if (Math.abs(ballPositionY) > (2 * fieldLength) / 6) {
      fieldZone = ballPositionY > 0 ? "attackingThird" : "defensiveThird";
    } else {
      fieldZone = "middleThird";
    }

    // Time context
    const timeRemaining = this.maxTime - this.matchTime;
    const isLateGame = timeRemaining <= 15 * 60; // Last 15 minutes

    // Score context
    const goalDifference = this.homeScore - this.awayScore;

    // Game phase
    const isSetPiece = !this.ball.isInPlay;

    return {
      fieldZone,
      timeRemaining,
      isLateGame,
      goalDifference,
      isSetPiece,
    };
  }

  // Helper method to get the opponent team
  getOpponentTeam(team) {
    return team === this.homeTeam ? this.awayTeam : this.homeTeam;
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
}

module.exports = Match;
