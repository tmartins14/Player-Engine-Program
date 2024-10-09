/*
 * Match Class
 * -----------
 * Manages the game flow, timekeeping, and interactions between teams.
 * Coordinates the simulation of the match, including updating player positions, handling events, and updating the ball.
 */

const Ball = require("./Ball");
const Field = require("./Field");

class Match {
  constructor(homeTeam, awayTeam) {
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.field = new Field(11); // 11v11 field
    this.ball = new Ball(this.field);
    this.matchTime = 0; // Start time in seconds
    this.maxTime = 2 * 60; // Match duration in seconds (90 minutes)
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
        this.isHomeTeamKickingOff ? "Home team" : "Away team"
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
    const opponentTeam = this.getOpponentTeam(kickingOffTeam);

    // Find the player assigned to kick off (e.g., center forward)
    let playerWithBall = kickingOffTeam.players.find(
      (player) => player.position === "ST" || player.position === "ST1"
    );

    // If no specific player found, pick any available forward
    if (!playerWithBall) {
      playerWithBall = kickingOffTeam.players.find((player) =>
        ["CF", "CAM"].includes(player.position)
      );
    }

    // If still no player found, pick any available player
    if (!playerWithBall) {
      playerWithBall = kickingOffTeam.players[0];
    }

    if (!playerWithBall) {
      console.error("No player found to kick off.");
      return;
    }

    // Position the ball carrier at the center spot
    playerWithBall.setPosition({ x: 0, y: 0 });
    playerWithBall.hasBall = true;
    this.ball.changeCarrier(playerWithBall);

    console.log(`${playerWithBall.name} is kicking off.`);

    // Start the first action
    this.updateMatch(0); // Update immediately to process the first action
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

    // Simulate actions for each team, passing gameContext
    this.homeTeam.decideTeamActions(this.ball, this.awayTeam, gameContext);
    this.awayTeam.decideTeamActions(this.ball, this.homeTeam, gameContext);

    // Update ball's position
    this.ball.updatePosition(deltaTime);

    // Check for events
    if (this.isBallNearBoundary()) {
      this.checkForOutOfBounds();
    }

    if (this.isBallNearGoal()) {
      this.checkForGoal();
    }
  }

  // Check if a goal is scored
  checkForGoal() {
    const homeGoal = this.field.getGoalPosition(false); // Home team's goal at the bottom
    const awayGoal = this.field.getGoalPosition(true); // Away team's goal at the top

    const { x, y } = this.ball.position;

    // Check if the ball crosses the home team's goal line
    if (
      y <= -this.field.length / 2 &&
      x >= homeGoal.leftPost.x &&
      x <= homeGoal.rightPost.x
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
      x >= awayGoal.leftPost.x &&
      x <= awayGoal.rightPost.x
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

    // Out on the sides for throw-ins
    if (x < -this.field.width / 2 || x > this.field.width / 2) {
      console.log("Ball went out for a throw-in.");
      this.resetForThrowIn();
    }

    // Out on the goal lines for corner kicks or goal kicks
    if (y < -this.field.length / 2 || y > this.field.length / 2) {
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
    return (
      Math.abs(x) > this.field.width / 2 - margin ||
      Math.abs(y) > this.field.length / 2 - margin
    );
  }

  // Check if the ball is near the goal area
  isBallNearGoal(margin = 5) {
    const { y } = this.ball.position;
    return Math.abs(y) > this.field.length / 2 - margin;
  }

  // Reset the ball for a throw-in
  resetForThrowIn() {
    // Determine which team takes the throw-in
    const team = this.ball.position.x > 0 ? this.awayTeam : this.homeTeam;
    const opponentTeam = this.getOpponentTeam(team);

    // Set the throw-in position
    const throwInPosition = {
      x:
        this.ball.position.x > 0 ? this.field.width / 2 : -this.field.width / 2,
      y: this.ball.position.y,
    };

    // Reset ball position
    this.ball.resetForThrowIn(throwInPosition);

    // Choose a player to take the throw-in (nearest player)
    const playerTakingThrowIn = team.players.reduce((closest, player) => {
      if (player.injured) return closest;
      const distance = player.calculateDistance(
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
            ? -this.field.length / 2 + 5
            : this.field.length / 2 - 5,
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
}

module.exports = Match;
