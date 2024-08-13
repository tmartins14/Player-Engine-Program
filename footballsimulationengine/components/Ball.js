class Ball {
  constructor(field) {
    this.field = field;
    this.position = this.getCenterPosition();
    this.velocity = { x: 0, y: 0 };
    this.carrier = null; // Player currently controlling the ball
    this.isLoose = true; // Indicates if the ball is not controlled by any player
    this.isShot = false; // Indicates if the ball is currently a shot towards the goal
  }

  getCenterPosition() {
    // Calculate the center of the field
    return { x: this.field.width / 2, y: this.field.length / 2 };
  }

  resetBall() {
    // Reset the ball to the center of the field
    this.position = this.getCenterPosition();
    this.velocity = { x: 0, y: 0 };
    this.carrier = null;
    this.isLoose = true;
    this.isShot = false;
    console.log("Ball reset to center of the field.");
  }

  resetForGoalKick(team) {
    // Reset the ball for a goal kick, position based on the team
    const goalKickPosition = {
      x: this.field.width / 2,
      y: team === "home" ? this.field.length * 0.1 : this.field.length * 0.9,
    };
    this.position = goalKickPosition;
    this.velocity = { x: 0, y: 0 };
    this.carrier = null;
    this.isLoose = true;
    this.isShot = false;
    console.log("Ball reset for a goal kick.");
  }

  resetForCornerKick(team, side) {
    // Reset the ball for a corner kick, position based on team and side
    const cornerKickPosition = {
      x: side === "left" ? 0 : this.field.width,
      y: team === "home" ? 0 : this.field.length,
    };
    this.position = cornerKickPosition;
    this.velocity = { x: 0, y: 0 };
    this.carrier = null;
    this.isLoose = true;
    this.isShot = false;
    console.log("Ball reset for a corner kick.");
  }

  resetForFreeKick(position) {
    // Reset the ball for a free kick at a specific position
    this.position = position;
    this.velocity = { x: 0, y: 0 };
    this.carrier = null;
    this.isLoose = true;
    this.isShot = false;
    console.log("Ball reset for a free kick.");
  }

  resetForThrowIn(position) {
    // Reset the ball for a throw-in at a specific position
    this.position = position;
    this.velocity = { x: 0, y: 0 };
    this.carrier = null;
    this.isLoose = true;
    this.isShot = false;
    console.log("Ball reset for a throw-in.");
  }

  updatePosition(timeDelta) {
    // Update the ball's position based on its velocity and the time delta
    this.position.x += this.velocity.x * timeDelta;
    this.position.y += this.velocity.y * timeDelta;
  }

  setVelocity(newVelocity) {
    // Set the ball's velocity
    this.velocity = newVelocity;
  }

  changeCarrier(player) {
    // Change the player currently controlling the ball
    this.carrier = player;
    this.isLoose = player === null;
  }

  isControlled() {
    // Return whether the ball is controlled by a player
    return this.carrier !== null;
  }

  kick(targetPosition, power) {
    // Calculate new velocity for the ball when it is kicked
    const direction = {
      x: targetPosition.x - this.position.x,
      y: targetPosition.y - this.position.y,
    };
    const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);
    this.velocity = {
      x: (direction.x / magnitude) * power,
      y: (direction.y / magnitude) * power,
    };
    this.carrier = null; // Ball is no longer controlled after a kick
    this.isLoose = true;
  }

  stop() {
    // Stop the ball by setting its velocity to zero
    this.velocity = { x: 0, y: 0 };
  }
}

module.exports = Ball;
