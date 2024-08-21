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
    // The center of the field is the origin (0, 0)
    return { x: 0, y: 0 };
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
    // Reset the ball for a goal kick on the edge of the 6-yard box
    const boxEdge = this.field.length * 0.05; // Edge of the 6-yard box is 5% of the field length
    const boxWidth = this.field.width * 0.26; // Width of the 6-yard box is 26% of the field width
    const randomXOffset = Math.random() * boxWidth - boxWidth / 2; // Random position along the 6-yard box width

    const goalKickPosition = {
      x: randomXOffset,
      y:
        team === "home"
          ? -this.field.length / 2 + boxEdge
          : this.field.length / 2 - boxEdge,
    };

    this.position = goalKickPosition;
    this.velocity = { x: 0, y: 0 };
    this.carrier = null;
    this.isLoose = true;
    this.isShot = false;
    console.log(`Ball reset for a goal kick for ${team} team.`);
  }

  resetForCornerKick(team, side) {
    // Reset the ball for a corner kick, position based on team and side
    const cornerKickPosition = {
      x: side === "left" ? -this.field.width / 2 : this.field.width / 2,
      y: team === "home" ? -this.field.length / 2 : this.field.length / 2,
    };
    this.position = cornerKickPosition;
    this.velocity = { x: 0, y: 0 };
    this.carrier = null;
    this.isLoose = true;
    this.isShot = false;
    console.log(
      `Ball reset for a corner kick on the ${side} side for the ${team} team.`
    );
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
