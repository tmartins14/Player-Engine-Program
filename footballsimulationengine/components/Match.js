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
  }

  getTeamGoalSide(team) {
    const goalPosition = getGoalPosition();

    if (team === "home") {
      homeGoalPosition.leftPost.y = -homeGoalPosition.leftPost.y;
    }
    return goalPosition;
  }

  // Initialize player positions for both teams
  initializePositions(isSecondHalf = false) {
    // Randomly choose which team kicks off first
    const isHomeTeamKickingOff = Math.random() > 0.5;

    // Set the positions for home and away teams using their formations
    if (!isSecondHalf) {
      // First half: home team at the bottom and away team at the top
      this.homeTeam.setFormationPositions(
        this.field,
        false,
        isHomeTeamKickingOff
      );
      this.awayTeam.setFormationPositions(
        this.field,
        true,
        !isHomeTeamKickingOff
      );

      // Set goals for the first half
      this.homeTeam.goalPosition = this.field.getGoalPosition(true); // Home team's goal at the bottom
      this.awayTeam.goalPosition = this.field.getGoalPosition(false); // Away team's goal at the top
    } else {
      // Second half: switch sides
      this.homeTeam.setFormationPositions(
        this.field,
        true,
        !isHomeTeamKickingOff
      );
      this.awayTeam.setFormationPositions(
        this.field,
        false,
        isHomeTeamKickingOff
      );

      // Set goals for the second half (switch sides)
      this.homeTeam.goalPosition = this.field.getGoalPosition(false); // Home team's goal at the top
      this.awayTeam.goalPosition = this.field.getGoalPosition(true); // Away team's goal at the bottom
    }

    console.log(
      `Player positions initialized for both teams. ${
        isHomeTeamKickingOff ? "Home team" : "Away team"
      } is kicking off.`
    );
  }

  switchSides() {}

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
    }, 1000); // Update every 1 second (1000 milliseconds)
  }

  // Handle the kickoff
  kickOff() {
    console.log("Kickoff!");

    // Reset the ball to the center of the field
    this.ball.resetBall();

    // Assuming the home team starts with the ball
    const playerWithBall = this.homeTeam.players.find(
      (player) => player.position === "ST1" || player.position === "ST2"
    );

    if (!playerWithBall) {
      console.error("No player found to kick off.");
      return;
    }

    playerWithBall.hasBall = true; // Set the player to have the ball
    this.ball.changeCarrier(playerWithBall); // Change ball carrier to the kickoff player

    // Find the nearest teammate to pass the ball to
    const targetTeammate = playerWithBall.findBestTeammateToPass(
      this.homeTeam.getPlayers(),
      this.awayTeam.getPlayers()
    );

    if (targetTeammate) {
      // Player with the ball attempts to pass to the nearest teammate
      playerWithBall.actionPass(this.ball, targetTeammate);
      console.log(
        `${playerWithBall.name} passes to ${targetTeammate.name} at kickoff.`
      );
    } else {
      // If no teammate found, the player holds the ball or performs a fallback action
      playerWithBall.actionHoldPosition();
      console.log(`${playerWithBall.name} is holding the ball after kickoff.`);
    }
  }

  // Update match simulation per second
  updateMatch(timeDelta) {
    // Simulate actions for each team
    this.simulateTeamActions(this.homeTeam, this.awayTeam);
    this.simulateTeamActions(this.awayTeam, this.homeTeam);

    // Update ball's position
    this.ball.updatePosition(timeDelta); // Use the given timeDelta for updating

    // FIX - Can this part be made more efficient?
    //      i.e. check only when the ball is close to the line?
    // Check if the ball has gone out of bounds
    this.checkForOutOfBounds();
    // Check for goals or significant events
    this.checkForGoal();
  }

  // Simulate actions for each team
  simulateTeamActions(team, opponentTeam) {
    team.players.forEach((player) => {
      // Pass explicit lists of teammates and opponents, avoiding circular references
      player.decideAction(
        this.ball,
        opponentTeam.getPlayers(),
        team.getPlayers()
      );
    });
  }

  // Check if a goal is scored
  checkForGoal() {
    const homeGoal = this.field.getGoalPosition(true); // Home team's goal
    const awayGoal = this.field.getGoalPosition(false); // Away team's goal

    // Check if the ball crosses the home team's goal line (at the top of the pitch)
    if (
      Math.abs(this.ball.position.y) > Math.abs(homeGoal.leftPost.y) && // Ball crosses the goal line
      this.ball.position.x >= homeGoal.leftPost.x && // Between the left post
      this.ball.position.x <= homeGoal.rightPost.x // And the right post
    ) {
      // Goal for away team
      this.awayScore += 1;
      this.kickOff(); // Reset ball for kickoff
      return;
    }

    // Check if the ball crosses the away team's goal line (at the bottom of the pitch)
    if (
      Math.abs(this.ball.position.y) > Math.abs(awayGoal.leftPost.y) && // Ball crosses the goal line
      this.ball.position.x >= awayGoal.leftPost.x && // Between the left post
      this.ball.position.x <= awayGoal.rightPost.x // And the right post
    ) {
      // Goal for home team
      this.homeScore += 1;
      this.kickOff(); // Reset ball for kickoff
      return;
    }
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
      //   Fix this IF Statement
      if (this.ball.isShot) {
        // Ball went out from a shot, it could be a goal kick
        console.log("Ball went out for a goal kick.");
        this.resetForGoalKick();
      } else {
        // Otherwise, it could be a corner kick
        console.log("Ball went out for a corner kick.");
        this.resetForCornerKick();
      }
    }
  }

  // Reset the ball for a throw-in
  resetForThrowIn() {
    const team = this.ball.position.x > 0 ? this.awayTeam : this.homeTeam;
    const throwInPosition = {
      x: this.ball.position.x,
      y: this.field.length / 2,
    };

    this.ball.resetForThrowIn(throwInPosition);
    this.possession(team);
  }

  // Reset the ball for a goal kick and have a player take the goal kick
  resetForGoalKick() {
    const team = this.ball.position.y > 0 ? this.awayTeam : this.homeTeam;
    const playerTakingGoalKick = team.players.find(
      (player) => player.position === "GK"
    );

    if (playerTakingGoalKick) {
      this.ball.resetForGoalKick(
        team.name === this.homeTeam.name ? "home" : "away"
      );
      playerTakingGoalKick.setPieceGoalKick(this.ball);
      this.possession(team);
    }
  }

  // Reset the ball for a corner kick and have a player take the corner kick
  resetForCornerKick() {
    const team = this.ball.position.y > 0 ? this.awayTeam : this.homeTeam;
    const side = this.ball.position.x < 0 ? "left" : "right";
    const playerTakingCornerKick = team.players.find(
      (player) => player.position === "RM" || player.position === "LM"
    );

    if (playerTakingCornerKick) {
      this.ball.resetForCornerKick(
        team.name === this.homeTeam.name ? "home" : "away",
        side
      );
      playerTakingCornerKick.setPieceCornerKick(this.ball, side);
      this.possession(team);
    }
  }

  // Reset the ball for a free kick
  resetForFreeKick(player) {
    console.log("Free kick awarded.");
    const freeKickPosition = {
      x: player.currentPosition.x,
      y: player.currentPosition.y,
    };

    // Reset the ball and let the player take the free kick
    this.ball.resetForFreeKick(freeKickPosition);
    player.setPieceFreeKick(this.ball, freeKickPosition);
  }

  // End the match
  endMatch() {
    this.isPlaying = false;
    // console.log("Full Time!");
    console
      .log
      //   `Final Score: ${this.homeTeam.name} ${this.homeScore} - ${this.awayScore} ${this.awayTeam.name}`
      ();
  }

  // Manage ball possession
  possession(team) {
    // Randomly assign ball possession to one of the players in the team
    const playerWithBall =
      team.players[Math.floor(Math.random() * team.players.length)];
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
}

module.exports = Match;
