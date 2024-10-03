const Team = require("./Team");
const Ball = require("./Ball");
const Field = require("./Field");

class Match {
  constructor(homeTeam, awayTeam) {
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.field = new Field(11); // 11v11 field
    this.ball = new Ball(this.field);
    this.matchTime = 0; // Start time in seconds
    this.maxTime = 2 * 60; // Match duration in seconds (2 minutes)
    this.homeScore = 0;
    this.awayScore = 0;
    this.isPlaying = false; // Indicates if the match is currently ongoing
    this.isHomeTeamKickingOff = null; // Will be set in initializePositions
  }

  // Initialize player positions for both teams
  initializePositions(isSecondHalf = false) {
    // Randomly choose which team kicks off first
    this.isHomeTeamKickingOff = Math.random() > 0.5;

    // Set the positions for home and away teams using their formations
    if (!isSecondHalf) {
      // First half: home team at the bottom and away team at the top
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
      this.homeTeam.goalPosition = this.field.getGoalPosition(true); // Home team's goal at the bottom
      this.awayTeam.goalPosition = this.field.getGoalPosition(false); // Away team's goal at the top
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

      // Set goals for the second half (switch sides)
      this.homeTeam.goalPosition = this.field.getGoalPosition(false); // Home team's goal at the top
      this.awayTeam.goalPosition = this.field.getGoalPosition(true); // Away team's goal at the bottom
    }

    console.log(
      `Player positions initialized for both teams. ${
        this.isHomeTeamKickingOff ? "Home team" : "Away team"
      } is kicking off.`
    );
  }

  // Play or update the match based on matchDetails
  playMatch(onUpdatePositions) {
    this.isPlaying = true;

    // Use setInterval to simulate the match frame by frame
    const matchInterval = setInterval(() => {
      if (this.matchTime >= this.maxTime || !this.isPlaying) {
        clearInterval(matchInterval); // Stop the match after maxTime
        this.endMatch();
        return;
      }

      this.updateMatch(1); // Simulate the match in 1-second increments
      this.matchTime += 1; // Increment match time by 1 second

      // Get current positions
      const currentPositions = this.getCurrentPositions();

      // Execute the callback with the current positions
      if (typeof onUpdatePositions === "function") {
        onUpdatePositions(currentPositions);
      }
    }, 3000); // Update every 1 second (1000 milliseconds)
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

    // Find the player assigned to kick off (e.g., striker or midfielder)
    let playerWithBall = kickingOffTeam.players.find(
      (player) => player.position === "ST1" || player.position === "ST2"
    );

    // If no striker found, pick any midfielder
    if (!playerWithBall) {
      playerWithBall = kickingOffTeam.players.find((player) =>
        ["CAM", "CM", "CDM"].includes(player.position)
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

    // Find the nearest teammate to pass the ball to
    const targetTeammate = playerWithBall.findBestTeammateToPass(
      kickingOffTeam.players,
      opponentTeam.players
    );

    if (targetTeammate) {
      // Player with the ball attempts to pass to the nearest teammate
      playerWithBall.actionPass(this.ball, targetTeammate);
      console.log(
        `${playerWithBall.name} passes to ${targetTeammate.name} at kickoff.`
      );
    } else {
      // If no teammate found, the player holds the ball or performs a fallback action
      playerWithBall.actionHoldPosition(kickingOffTeam.players);
      console.log(`${playerWithBall.name} is holding the ball after kickoff.`);
    }
  }

  // Update match simulation per second
  updateMatch(timeDelta) {
    // Simulate actions for each team
    this.simulateTeamActions(this.homeTeam, this.awayTeam);
    this.simulateTeamActions(this.awayTeam, this.homeTeam);

    // Update ball's position
    this.ball.updatePosition(timeDelta);

    // Check if the ball has gone out of bounds or near the goal
    if (this.isBallNearBoundary()) {
      this.checkForOutOfBounds();
    }

    if (this.isBallNearGoal()) {
      this.checkForGoal();
    }
  }

  // Simulate actions for each team
  simulateTeamActions(team, opponentTeam) {
    team.players.forEach((player) => {
      // Pass explicit lists of teammates and opponents
      player.decideAction(this.ball, opponentTeam.players, team.players);
    });
  }

  // Check if a goal is scored
  checkForGoal() {
    const homeGoal = this.field.getGoalPosition(true); // Home team's goal
    const awayGoal = this.field.getGoalPosition(false); // Away team's goal

    const { x, y } = this.ball.position;

    // Check if the ball crosses the home team's goal line
    if (
      y <= homeGoal.leftPost.y && // Ball crosses the goal line at home goal
      x >= homeGoal.leftPost.x && // Between the left post
      x <= homeGoal.rightPost.x // And the right post
    ) {
      // Goal for away team
      this.awayScore += 1;
      console.log("Goal for the away team!");
      this.afterGoal();
      return;
    }

    // Check if the ball crosses the away team's goal line
    if (
      y >= awayGoal.leftPost.y && // Ball crosses the goal line at away goal
      x >= awayGoal.leftPost.x && // Between the left post
      x <= awayGoal.rightPost.x // And the right post
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
    this.kickOff();
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
          lastTouchedByTeam === this.homeTeam.teamId
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
    const team = this.ball.position.x > 0 ? this.awayTeam : this.homeTeam;
    const throwInPosition = {
      x:
        this.ball.position.x > 0 ? this.field.width / 2 : -this.field.width / 2,
      y: this.ball.position.y,
    };

    // Reset ball position
    this.ball.resetForThrowIn(throwInPosition);

    // Choose a player to take the throw-in (nearest player)
    const playerTakingThrowIn = team.players.reduce((closestPlayer, player) => {
      const distance = player.calculateDistance(
        player.currentPosition,
        throwInPosition
      );
      if (
        !player.injured &&
        (!closestPlayer || distance < closestPlayer.distance)
      ) {
        return { player, distance };
      }
      return closestPlayer;
    }, null)?.player;

    if (playerTakingThrowIn) {
      playerTakingThrowIn.setPosition(throwInPosition);
      playerTakingThrowIn.hasBall = true;
      this.ball.changeCarrier(playerTakingThrowIn);
      console.log(`${playerTakingThrowIn.name} is taking the throw-in.`);
    }

    this.possession(team);
  }

  // Reset the ball for a goal kick
  resetForGoalKick(team) {
    // Find the goalkeeper or assigned goal kick taker
    const playerTakingGoalKick = team.players.find(
      (player) => player.position === "GK"
    );

    if (playerTakingGoalKick) {
      this.ball.resetForGoalKick(team.teamSide);

      // Player takes the goal kick
      playerTakingGoalKick.setPieceGoalKick(
        this.ball,
        team.players,
        this.getOpponentTeam(team).players
      );

      this.possession(team);
    }
  }

  // Reset the ball for a corner kick
  resetForCornerKick(attackingTeam) {
    const defendingTeam = this.getOpponentTeam(attackingTeam);

    // Determine the side of the corner kick
    const side = this.ball.position.x < 0 ? "left" : "right";

    // Choose a player to take the corner kick based on roles
    let playerTakingCornerKick = attackingTeam.players.find(
      (player) =>
        (side === "left" && player.roles.leftCornerTaker) ||
        (side === "right" && player.roles.rightCornerTaker)
    );

    // If no player assigned, choose any suitable player
    if (!playerTakingCornerKick) {
      playerTakingCornerKick = attackingTeam.players.find(
        (player) => player.position === "LM" || player.position === "RM"
      );
    }

    // If still no player found, pick any midfielder
    if (!playerTakingCornerKick) {
      playerTakingCornerKick = attackingTeam.players.find((player) =>
        ["CM", "CAM", "CDM"].includes(player.position)
      );
    }

    // If still no player found, pick any player
    if (!playerTakingCornerKick) {
      playerTakingCornerKick = attackingTeam.players[0];
    }

    if (playerTakingCornerKick) {
      // Reset ball position for corner kick
      this.ball.resetForCornerKick(attackingTeam.teamSide, side);

      // Move players into position for corner kick
      this.positionPlayersForCornerKick(attackingTeam, defendingTeam, side);

      // Player takes the corner kick
      playerTakingCornerKick.setPieceCornerKick(
        this.ball,
        side,
        attackingTeam.players,
        defendingTeam.players
      );

      // Set possession to the attacking team
      this.possession(attackingTeam);
    }
  }

  // Position players for corner kick
  positionPlayersForCornerKick(attackingTeam, defendingTeam, side) {
    // Implementation of positioning logic
    // For simplicity, not fully implemented here
  }

  // Reset the ball for a free kick
  resetForFreeKick(player) {
    console.log("Free kick awarded.");

    const team =
      player.teamId === this.homeTeam.teamId ? this.homeTeam : this.awayTeam;
    const opponents = this.getOpponentTeam(team).players;

    // Find the assigned free-kick taker
    const freeKickTaker = team.players.find(
      (p) => p.roles.freeKickTaker && !p.injured
    );

    const playerTakingFreeKick = freeKickTaker || player;

    const freeKickPosition = {
      x: playerTakingFreeKick.currentPosition.x,
      y: playerTakingFreeKick.currentPosition.y,
    };

    // Reset the ball and let the player take the free kick
    this.ball.resetForFreeKick(freeKickPosition);
    playerTakingFreeKick.setPieceFreeKick(
      this.ball,
      freeKickPosition,
      team.players,
      opponents
    );
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

  // Helper method to get the opponent team
  getOpponentTeam(team) {
    return team === this.homeTeam ? this.awayTeam : this.homeTeam;
  }

  // Helper methods to get teammates and opponents of a player
  getTeammates(player) {
    const team =
      player.teamId === this.homeTeam.teamId ? this.homeTeam : this.awayTeam;
    return team.players.filter((p) => p !== player);
  }

  getOpponents(player) {
    const opponentTeam =
      player.teamId === this.homeTeam.teamId ? this.awayTeam : this.homeTeam;
    return opponentTeam.players;
  }
}

module.exports = Match;
