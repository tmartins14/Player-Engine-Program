class Field {
  constructor(playerCount) {
    // Set dynamic field sizes based on the number of players
    const { width, length } = this.setFieldDimensions(playerCount);
    this.width = width; // Width of the field in meters (X-axis)
    this.length = length; // Length of the field in meters (Y-axis)

    // Goal and penalty box dimensions
    this.goalWidth = this.calculateGoalWidth(); // Calculate and set the goal width
    this.sixYardBoxLength = this.calculateSixYardBoxLength(); // Calculate and set the six-yard box length
    this.sixYardBoxWidth = this.calculateSixYardBoxWidth(); // Calculate and set the six-yard box width
    this.penaltyBoxLength = this.calculatePenaltyBoxLength(); // Calculate and set the penalty box length
    this.penaltyBoxWidth = this.calculatePenaltyBoxWidth(); // Calculate and set the penalty box width

    // Circle radii
    this.centerCircleRadius = this.calculateCenterCircleRadius();
    this.penaltySemiCircleRadius = this.calculatePenaltySemiCircleRadius();
    this.cornerCircleRadius = this.calculateCornerCircleRadius();
  }

  setFieldDimensions(playerCount) {
    // Set field dimensions based on the number of players
    switch (playerCount) {
      case 6: // 6v6
        return { width: 55, length: 72 };
      case 7: // 7v7
        return { width: 65, length: 82 };
      case 11: // 11v11
      default: // Default to full-size field
        return { width: 100, length: 132 };
    }
  }

  // Coordinate system with the origin at the center spot
  getCenterPosition() {
    // Return the center position of the field, which is the origin (0, 0)
    return { x: 0, y: 0 };
  }

  isWithinBounds(position) {
    // Check if a given position is within the field's boundaries
    const { x, y } = position;
    return (
      x >= -this.width / 2 &&
      x <= this.width / 2 &&
      y >= -this.length / 2 &&
      y <= this.length / 2
    );
  }

  getCoordinateSystem() {
    // Return the field's coordinate system boundaries with the center as origin
    return {
      origin: { x: 0, y: 0 }, // Center spot
      topLeft: { x: -this.width / 2, y: this.length / 2 }, // Top-left corner
      topRight: { x: this.width / 2, y: this.length / 2 }, // Top-right corner
      bottomLeft: { x: -this.width / 2, y: -this.length / 2 }, // Bottom-left corner
      bottomRight: { x: this.width / 2, y: -this.length / 2 }, // Bottom-right corner
    };
  }

  calculateGoalWidth() {
    // Calculate the width of the goal area, typically around 24% of the field width
    return this.width * 0.24;
  }

  calculateSixYardBoxLength() {
    // Calculate the length of the six-yard box
    return this.length * 0.05; // Example: 5% of the field length
  }

  calculateSixYardBoxWidth() {
    // Calculate the width of the six-yard box
    return this.width * 0.26; // Example: 26% of the field width
  }

  calculatePenaltyBoxLength() {
    // Calculate the length of the penalty box
    return this.length * 0.16; // Example: 16% of the field length
  }

  calculatePenaltyBoxWidth() {
    // Calculate the width of the penalty box
    return this.width * 0.44; // Example: 44% of the field width
  }

  calculateCenterCircleRadius() {
    // Calculate the radius of the center circle
    return this.width * 0.1; // Example: 10% of the field width
  }

  calculatePenaltySemiCircleRadius() {
    // Calculate the radius of the penalty semi-circle
    return this.width * 0.07; // Example: 7% of the field width
  }

  calculateCornerCircleRadius() {
    // Calculate the radius of the corner quarter circles
    return this.width * 0.015; // Example: 1.5% of the field width
  }

  // Define the field zones: Attacking, Neutral, Defensive
  getZones() {
    const thirdLength = this.length / 3;
    return {
      defensiveZone: {
        start: -this.length / 2,
        end: -thirdLength / 2,
      },
      neutralZone: {
        start: -thirdLength / 2,
        end: thirdLength / 2,
      },
      attackingZone: {
        start: thirdLength / 2,
        end: this.length / 2,
      },
    };
  }

  // Define the penalty areas relative to the center
  getPenaltyArea(team) {
    const penaltyBoxYStart = this.penaltyBoxLength - this.length / 2;
    const penaltyBoxYEnd = this.length / 2 - this.penaltyBoxLength;

    if (team === "home") {
      return {
        topLeft: { x: -this.penaltyBoxWidth / 2, y: penaltyBoxYStart },
        topRight: { x: this.penaltyBoxWidth / 2, y: penaltyBoxYStart },
        bottomLeft: { x: -this.penaltyBoxWidth / 2, y: -this.length / 2 },
        bottomRight: { x: this.penaltyBoxWidth / 2, y: -this.length / 2 },
      };
    } else {
      return {
        topLeft: {
          x: -this.penaltyBoxWidth / 2,
          y: this.length / 2,
        },
        topRight: { x: this.penaltyBoxWidth / 2, y: this.length / 2 },
        bottomLeft: { x: -this.penaltyBoxWidth / 2, y: penaltyBoxYEnd },
        bottomRight: { x: this.penaltyBoxWidth / 2, y: penaltyBoxYEnd },
      };
    }
  }

  // Define the center circle
  getCenterCircle() {
    // Return the coordinates and radius for drawing the center circle
    const center = this.getCenterPosition();
    return {
      center,
      radius: this.centerCircleRadius,
    };
  }

  // Define the penalty semi-circle
  getPenaltySemiCircle(team) {
    // Return the coordinates and radius for drawing the penalty semi-circle
    const penaltySpot =
      team === "home"
        ? { x: 0, y: -this.length / 2 + this.penaltyBoxLength }
        : { x: 0, y: this.length / 2 - this.penaltyBoxLength };
    return {
      center: penaltySpot,
      radius: this.penaltySemiCircleRadius,
    };
  }

  // Define the penalty spot
  getPenaltySpot(team) {
    // Return the coordinates for the penalty spot based on the team
    return {
      x: 0,
      y:
        team === "home"
          ? -this.length / 2 + this.penaltyBoxLength
          : this.length / 2 - this.penaltyBoxLength,
    };
  }

  // Define the corner circle
  getCornerCircle(xSide, ySide) {
    // Return the coordinates and radius for drawing the corner quarter circle based on the side (left or right)
    const x = xSide === "left" ? -this.width / 2 : this.width / 2;
    const y = ySide === "top" ? this.length / 2 : -this.length / 2;

    return {
      center: { x, y },
      radius: this.cornerCircleRadius,
    };
  }

  // Define the center spot
  getCenterSpot() {
    // Return the coordinates for the center spot
    return this.getCenterPosition();
  }
}

module.exports = Field;
