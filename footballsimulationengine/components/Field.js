/*
 * Field Class
 * -----------
 * Represents the soccer field, including dimensions and goal positions.
 * Provides methods to check if a position is within bounds and to get goal positions.
 */

class Field {
  constructor(playersPerTeam = 11) {
    // Default dimensions
    this.width = 68; // Default width in meters
    this.length = 105; // Default length in meters
    this.playersPerTeam = playersPerTeam;
    this.goalWidth = 7.32; // Standard goal width in meters
    this.goalDepth = 2.44; // Standard goal height in meters

    // Initialize goal positions
    this.homeGoal = this.getGoalPosition(false);
    this.awayGoal = this.getGoalPosition(true);
  }

  // Set field dimensions from pitch details
  setFieldDimensionsFromPitch(pitchDetails) {
    if (pitchDetails && pitchDetails.pitchWidth && pitchDetails.pitchHeight) {
      this.width = pitchDetails.pitchWidth;
      this.length = pitchDetails.pitchHeight;

      // Update goal dimensions based on new field dimensions
      // Assuming the pitch dimensions are in pixels or units, we'll scale the goal size accordingly
      const standardWidth = 68; // Standard field width in meters
      const standardLength = 105; // Standard field length in meters

      // Calculate scaling factors
      const widthScale = this.width / standardWidth;
      const lengthScale = this.length / standardLength;

      this.goalWidth = 7.32 * widthScale; // Scale goal width
      this.goalDepth = 2.44 * lengthScale; // Scale goal depth

      console.log(
        `Field dimensions set to width: ${this.width} units, length: ${this.length} units.`
      );
    } else {
      console.error("Invalid pitch details provided.");
    }
  }

  // Get the position of the goal
  // isAwayGoal: true for away team's goal (top), false for home team's goal (bottom)
  getGoalPosition(isAwayGoal) {
    const halfWidth = this.width / 2;
    const halfLength = this.length / 2;
    const goalHalfWidth = this.goalWidth / 2;

    const yPosition = isAwayGoal ? halfLength : -halfLength;

    const goalPosition = {
      leftPost: {
        x: -goalHalfWidth,
        y: yPosition,
      },
      rightPost: {
        x: goalHalfWidth,
        y: yPosition,
      },
      center: {
        x: 0,
        y: yPosition,
      },
    };

    return goalPosition;
  }

  // Check if a position is within the field boundaries
  isWithinBounds(position) {
    const halfWidth = this.width / 2;
    const halfLength = this.length / 2;

    return (
      position.x >= -halfWidth &&
      position.x <= halfWidth &&
      position.y >= -halfLength &&
      position.y <= halfLength
    );
  }

  // Get the closest point within the field boundaries to a given position
  constrainToBounds(position) {
    const halfWidth = this.width / 2;
    const halfLength = this.length / 2;

    return {
      x: Math.max(-halfWidth, Math.min(halfWidth, position.x)),
      y: Math.max(-halfLength, Math.min(halfLength, position.y)),
    };
  }

  // Get the center circle position and radius
  getCenterCircle() {
    // Adjust radius based on field scaling
    const standardRadius = 9.15; // Standard radius in meters
    const lengthScale = this.length / 105;
    const radius = standardRadius * lengthScale;

    return {
      center: { x: 0, y: 0 },
      radius: radius,
    };
  }

  // Get the penalty area positions for a given side
  getPenaltyArea(isAwaySide) {
    const standardPenaltyAreaWidth = 40.32; // Width of penalty area in meters
    const standardPenaltyAreaDepth = 16.5; // Depth of penalty area in meters
    const widthScale = this.width / 68;
    const lengthScale = this.length / 105;

    const penaltyAreaWidth = standardPenaltyAreaWidth * widthScale;
    const penaltyAreaDepth = standardPenaltyAreaDepth * lengthScale;

    const halfWidth = this.width / 2;
    const yPosition = isAwaySide
      ? this.length / 2 - penaltyAreaDepth
      : -this.length / 2 + penaltyAreaDepth;

    return {
      topLeft: { x: -penaltyAreaWidth / 2, y: yPosition },
      topRight: { x: penaltyAreaWidth / 2, y: yPosition },
      bottomLeft: {
        x: -penaltyAreaWidth / 2,
        y: isAwaySide ? this.length / 2 : -this.length / 2,
      },
      bottomRight: {
        x: penaltyAreaWidth / 2,
        y: isAwaySide ? this.length / 2 : -this.length / 2,
      },
    };
  }

  // Get the position of the corner flags
  getCornerPositions() {
    const halfWidth = this.width / 2;
    const halfLength = this.length / 2;

    return {
      topLeft: { x: -halfWidth, y: halfLength },
      topRight: { x: halfWidth, y: halfLength },
      bottomLeft: { x: -halfWidth, y: -halfLength },
      bottomRight: { x: halfWidth, y: -halfLength },
    };
  }
}

module.exports = Field;
