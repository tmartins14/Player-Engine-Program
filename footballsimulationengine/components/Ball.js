// Ball.js

const { calculateDistance } = require("../utilities/utils");

class Ball {
  constructor(field) {
    this.field = field;
    this.position = this.getCenterPosition();
    this.velocity = 0; // Speed at which the ball is moving
    this.direction = { x: 0, y: 0 }; // Normalized direction vector
    this.carrier = null; // Player currently controlling the ball
    this.isMoving = false; // Indicates if the ball is moving
    this.isInPlay = true; // Indicates if the ball is in play
    this.destination = null; // Target position for the ball
    this.lastTouchedBy = null; // Last player who touched the ball
    this.isShot = false; // Indicates if the ball is currently a shot towards the goal
    this.intendedReceiver = null; // Player intended to receive the ball
  }

  getCenterPosition() {
    // The center of the field is the origin (0, 0)
    return { x: 0, y: 0 };
  }

  resetBall() {
    // Reset the ball to the center of the field
    this.position = this.getCenterPosition();
    this.velocity = 0;
    this.direction = { x: 0, y: 0 };
    this.carrier = null;
    this.isMoving = false;
    this.isInPlay = true;
    this.destination = null;
    this.lastTouchedBy = null;
    this.isShot = false;
    this.intendedReceiver = null;
    console.log("Ball reset to center of the field.");
  }

  resetForGoalKick(position) {
    // Reset the ball for a goal kick at a specific position
    this.position = position;
    this.velocity = 0;
    this.direction = { x: 0, y: 0 };
    this.carrier = null;
    this.isMoving = false;
    this.isInPlay = false;
    this.destination = null;
    this.lastTouchedBy = null;
    this.isShot = false;
    this.intendedReceiver = null;
    console.log("Ball reset for a goal kick.");
  }

  resetForCornerKick(position) {
    // Reset the ball for a corner kick at a specific position
    this.position = position;
    this.velocity = 0;
    this.direction = { x: 0, y: 0 };
    this.carrier = null;
    this.isMoving = false;
    this.isInPlay = false;
    this.destination = null;
    this.lastTouchedBy = null;
    this.isShot = false;
    this.intendedReceiver = null;
    console.log("Ball reset for a corner kick.");
  }

  resetForFreeKick(position) {
    // Reset the ball for a free kick at a specific position
    this.position = position;
    this.velocity = 0;
    this.direction = { x: 0, y: 0 };
    this.carrier = null;
    this.isMoving = false;
    this.isInPlay = false;
    this.destination = null;
    this.lastTouchedBy = null;
    this.isShot = false;
    this.intendedReceiver = null;
    console.log("Ball reset for a free kick.");
  }

  resetForThrowIn(position) {
    // Reset the ball for a throw-in at a specific position
    this.position = position;
    this.velocity = 0;
    this.direction = { x: 0, y: 0 };
    this.carrier = null;
    this.isMoving = false;
    this.isInPlay = false;
    this.destination = null;
    this.lastTouchedBy = null;
    this.isShot = false;
    this.intendedReceiver = null;
    console.log("Ball reset for a throw-in.");
  }

  updatePosition(deltaTime) {
    if (this.isMoving) {
      // Apply deceleration
      const deceleration = this.deceleration * deltaTime;
      this.velocity = Math.max(this.velocity - deceleration, 0);

      // Update position
      this.position.x += this.direction.x * this.velocity * deltaTime;
      this.position.y += this.direction.y * this.velocity * deltaTime;

      // Check if the ball has reached or passed the destination or stopped
      const distanceToDestination = calculateDistance(
        this.position,
        this.destination
      );
      if (
        distanceToDestination <= this.velocity * deltaTime ||
        this.velocity === 0
      ) {
        // Ball has arrived or stopped
        this.position = { ...this.destination };
        this.velocity = 0;
        this.isMoving = false;
        this.direction = { x: 0, y: 0 };
        this.destination = null;

        // Handle ball arrival
        this.onArrival();
      }
    }
  }

  // Method called when the ball arrives at the destination
  onArrival() {
    if (this.intendedReceiver) {
      const distanceToReceiver = calculateDistance(
        this.position,
        this.intendedReceiver.currentPosition
      );
      const receiveThreshold = 2; // Units within which the player can receive the ball

      if (distanceToReceiver <= receiveThreshold) {
        // Intended receiver gains possession
        this.intendedReceiver.hasBall = true;
        this.carrier = this.intendedReceiver;

        console.log(`${this.intendedReceiver.name} receives the ball.`);
      } else {
        // Ball is loose; other players can attempt to reach it
        this.carrier = null;
        console.log(
          `Ball arrived at destination but ${this.intendedReceiver.name} was not there.`
        );
      }
    } else {
      // No intended receiver; ball is loose
      this.carrier = null;
      console.log(
        `Ball has come to rest at position (${this.position.x.toFixed(
          2
        )}, ${this.position.y.toFixed(2)}).`
      );
    }

    // Reset intended receiver after arrival
    this.intendedReceiver = null;
  }

  setVelocity(speed, direction) {
    // Set the ball's velocity and direction
    this.velocity = speed;
    this.direction = direction;
    this.isMoving = true;
  }

  changeCarrier(player) {
    // Change the player currently controlling the ball
    this.carrier = player;
    this.isMoving = false;
    this.velocity = 0;
    this.direction = { x: 0, y: 0 };
    this.destination = null;
    this.intendedReceiver = null;

    if (player) {
      console.log(`${player.name} is now carrying the ball.`);
    }
  }

  isControlled() {
    // Return whether the ball is controlled by a player
    return this.carrier !== null;
  }

  kick(targetPosition, power, kicker, intendedReceiver = null) {
    // Calculate direction and distance to target
    const dx = targetPosition.x - this.position.x;
    const dy = targetPosition.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normalize the direction vector
    const direction = { x: dx / distance, y: dy / distance };

    // Set the ball's velocity and direction
    this.velocity = power;
    this.direction = direction;
    this.isMoving = true;
    this.destination = targetPosition;
    this.carrier = null; // Ball is no longer controlled after a kick
    this.lastTouchedBy = kicker;
    this.intendedReceiver = intendedReceiver;

    // Calculate desired stopping distance
    const fieldDiagonal = Math.sqrt(
      this.field.width ** 2 + this.field.length ** 2
    );
    const desiredStoppingDistance = distance * 1.2; // Ball stops after 120% of the target distance

    // Calculate deceleration using physics formula
    this.deceleration = power ** 2 / (2 * desiredStoppingDistance);

    console.log(
      `${kicker.name} kicks the ball towards (${targetPosition.x.toFixed(
        2
      )}, ${targetPosition.y.toFixed(2)}).`
    );
  }

  stop() {
    // Stop the ball by setting its velocity to zero
    this.velocity = 0;
    this.direction = { x: 0, y: 0 };
    this.isMoving = false;
    this.destination = null;
  }
}

module.exports = Ball;
