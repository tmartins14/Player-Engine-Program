const Team = require("./Team");
const Ball = require("./Ball");
const Field = require("./Field");

class Match {
  constructor(homeTeam, awayTeam) {
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.field = new Field(11); // 11v11 field
    this.ball = new Ball(this.field);
    this.matchTime = 0; // Start time in minutes
    this.maxTime = 90; // Match duration in minutes (standard)
    this.homeScore = 0;
    this.awayScore = 0;
    this.isPlaying = false; // Indicates if the match is currently ongoing
  }

  // Start the match
  startMatch() {
    this.isPlaying = true;
    this.kickOff();

    while (this.matchTime < this.maxTime) {
      this.updateMatch(); // Simulate the match in increments
      this.matchTime += 1; // Increment match time by 1 minute per loop iteration
    }

    this.endMatch(); // Conclude the match after 90 minutes
  }

  // Handle the kickoff
  kickOff() {
    console.log("Kickoff!");
    this.ball.resetBall();
    this.possession(this.homeTeam); // Assuming home team starts with the ball
  }

  // Update match simulation per minute
  updateMatch() {
    // Simulate actions for each team
    this.simulateTeamActions(this.homeTeam, this.awayTeam);
    this.simulateTeamActions(this.awayTeam, this.homeTeam);

    // Check for goals or significant events
    this.checkForGoal();
  }

  // Simulate actions for each team
  simulateTeamActions(team, opponentTeam) {
    team.players.forEach((player) => {
      player.decideAction(this.ball, opponentTeam.players, team.players);
    });
  }

  // Check if a goal is scored
  checkForGoal() {
    const goalPosition = this.field.getOpponentGoalPosition();

    if (this.ball.position.y >= goalPosition.y && this.ball.isShot) {
      // Goal scored logic
      if (this.ball.position.y > 0) {
        this.awayScore += 1;
        console.log(
          `Goal for ${this.awayTeam.name}! Score: ${this.homeScore} - ${this.awayScore}`
        );
      } else {
        this.homeScore += 1;
        console.log(
          `Goal for ${this.homeTeam.name}! Score: ${this.homeScore} - ${this.awayScore}`
        );
      }
      this.ball.resetBall(); // Reset ball for kickoff
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
    const playerWithBall =
      team.players[Math.floor(Math.random() * team.players.length)];
    playerWithBall.hasBall = true;
    this.ball.changeCarrier(playerWithBall);
    console.log(`${playerWithBall.name} of ${team.name} has the ball.`);
  }
}

module.exports = Match;
