const Player = require("./Player");
const Team = require("./Team");
const Field = require("./Field");
const Ball = require("./Ball");

class Match {
  constructor(homeTeam, awayTeam, field) {
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.field = field;
    this.ball = new Ball(field);
    this.timeElapsed = 0;
    this.maxTime = 90; // Assume 90 minutes for a standard match
    this.score = { home: 0, away: 0 };
  }

  startMatch() {
    console.log(
      `Match between ${this.homeTeam.name} and ${this.awayTeam.name} started!`
    );

    this.resetMatchState();

    while (this.timeElapsed < this.maxTime) {
      this.simulateMinute();
      this.timeElapsed += 1;
    }

    this.endMatch();
  }

  resetMatchState() {
    this.timeElapsed = 0;
    this.ball.resetBall();
    this.homeTeam.setFormationPositions(this.field);
    this.awayTeam.setFormationPositions(this.field);
  }

  simulateMinute() {
    // Simulate events that happen in a minute
    this.simulateBallMovement();
    this.simulatePlayerActions(this.homeTeam);
    this.simulatePlayerActions(this.awayTeam);
    this.checkForGoals();
  }

  simulateBallMovement() {
    // Move the ball according to its current velocity
    this.ball.updatePosition(1); // Update position over 1 minute
    this.checkBallOutOfBounds();
  }

  simulatePlayerActions(team) {
    team.players.forEach((player) => {
      player.decideAction(this.ball, this.getOpposingTeam(team).players);
    });
  }

  getOpposingTeam(team) {
    return team === this.homeTeam ? this.awayTeam : this.homeTeam;
  }

  checkForGoals() {
    // Check if the ball has crossed into the goal area
    if (this.isGoalScored(this.ball.position)) {
      const scoringTeam =
        this.ball.position.y > 0 ? this.homeTeam : this.awayTeam;
      this.scoreGoal(scoringTeam);
      this.resetAfterGoal(scoringTeam);
    }
  }

  isGoalScored(position) {
    const goalWidth = this.field.goalWidth / 2;
    return (
      Math.abs(position.x) <= goalWidth &&
      (position.y >= this.field.length / 2 ||
        position.y <= -this.field.length / 2)
    );
  }

  scoreGoal(team) {
    if (team === this.homeTeam) {
      this.score.home += 1;
    } else {
      this.score.away += 1;
    }
    console.log(`Goal scored by ${team.name}!`);
  }

  resetAfterGoal(scoringTeam) {
    this.ball.resetBall();
    this.homeTeam.setFormationPositions(this.field);
    this.awayTeam.setFormationPositions(this.field);
  }

  checkBallOutOfBounds() {
    if (!this.field.isWithinBounds(this.ball.position)) {
      if (
        this.ball.position.y > this.field.length / 2 ||
        this.ball.position.y < -this.field.length / 2
      ) {
        this.ball.resetForGoalKick(
          this.getOpposingTeam(this.ball.carrier.team).name
        );
      } else {
        // Assuming it's a throw-in for simplicity
        this.ball.resetForThrowIn(this.ball.position);
      }
    }
  }

  endMatch() {
    console.log(
      `Match ended! Final Score: ${this.homeTeam.name} ${this.score.home} - ${this.awayTeam.name} ${this.score.away}`
    );
  }
}

module.exports = Match;
