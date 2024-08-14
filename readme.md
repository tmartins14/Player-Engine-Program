# Soccer Simulation Project

This project is a soccer simulation program designed to model player behavior and interactions on a soccer field. It focuses on simulating various aspects of soccer gameplay, including player movement, defensive actions, and decision-making based on game state.

## Project Components

### Player Class

The `Player` class represents a soccer player in the simulation. It includes attributes such as name, team ID, position, rating, and various skills (e.g., pace, shooting, defending).

**Key Methods:**

- `performDefensiveAction`: Determines and executes defensive actions (e.g., tackles, interceptions) based on the player's position and vicinity.
- `tackle`: Handles both slide and standing tackles, with the potential for fouls.
- `intercept`, `blockShot`, `clearBall`: Execute specific defensive actions.
- `setPosition`: Sets the player's position on the field and updates the position history.

### Ball Class

The `Ball` class simulates the behavior and physics of a soccer ball on the field. It includes attributes for position, velocity, and control status.

**Key Methods:**

- `resetBall`: Resets the ball to the center of the field, typically used for the start of play or after a goal.
- `resetForGoalKick`: Positions the ball on the edge of the 6-yard box for a goal kick.
- `resetForCornerKick`, `resetForFreeKick`, `resetForThrowIn`: Adjusts the ball's position for specific restart scenarios.
- `updatePosition`: Updates the ball's position based on its velocity and time delta.

### Field Class

The `Field` class defines the soccer field's dimensions, coordinate system, and key areas. It supports dynamic field sizes based on the number of players (e.g., 6v6, 7v7, 11v11) and provides methods to calculate and return the positions of important field elements.

**Key Attributes:**

- `width`: The width of the field in meters.
- `length`: The length of the field in meters.
- `goalWidth`: The width of the goal area.
- `sixYardBoxLength`, `sixYardBoxWidth`: Dimensions of the six-yard box.
- `penaltyBoxLength`, `penaltyBoxWidth`: Dimensions of the penalty box.
- `centerCircleRadius`, `penaltySemiCircleRadius`, `cornerCircleRadius`: Radii of key circles on the field.

**Key Methods:**

- `getCenterPosition`: Returns the center position of the field, which is the origin `(0, 0)` of the coordinate system.
- `isWithinBounds`: Checks if a given position is within the field's boundaries.
- `getCoordinateSystem`: Provides the boundaries of the field's coordinate system.
- `getZones`: Returns the coordinates defining the Attacking, Neutral, and Defensive zones of the field.
- `getPenaltyArea`: Returns the coordinates defining the penalty area for the home or away team.
- `getCenterCircle`, `getPenaltySemiCircle`, `getCornerCircle`, `getCenterSpot`, `getPenaltySpot`: Return the positions and radii of key circles and spots on the field.

### Testing Scripts

- **`playerTest.js`**: A script designed to test the functionality of the `Player` class. It includes tests for creating players, managing player movements, and verifying competencies.

### Models

- **Player Model**: Defines the player attributes stored in the database, including skills and positions.
- **PlayerMovement Model**: Records player movements and states during a game, such as position, fitness, and ball possession.

## Assumptions and Hard-Coded Values

### Assumptions

1. **Field Dimensions**: The field dimensions are dynamically set based on the number of players. Default sizes are provided for 6v6, 7v7, and 11v11 formats.

2. **Player Attributes**: Attributes like defending and fitness are set between 0 and 100 and are used to calculate various actions' effectiveness and vicinity.

3. **Coordinate System**: The coordinate system is centered at the field's center spot, with positive and negative coordinates extending to the edges of the field.

### Hard-Coded Values

1. **Defensive Vicinity Percentage**: The defensive vicinity is currently set to 1% of the field's smaller dimension, scaled by the player's defending attribute. This could be dynamically calculated based on game state and player fatigue.

2. **Success Probability**: The probability of successfully completing a defensive action is fixed at 80%. This value could be adjusted based on player attributes, match context, or historical performance data.

3. **Foul Probability**: The chance of committing a foul during a tackle is set at 20%. This could be refined to account for player attributes like aggression or experience.

4. **Action Ranges**:

   - **Slide Tackle**: Uses the full defensive vicinity.
   - **Standing Tackle**: Limited to 10% of the defensive vicinity, requiring closer proximity to the opponent.

5. **Goal Kick Positioning**: The ball is placed randomly along the edge of the 6-yard box, calculated as 5% of the field length and 26% of the field width.

## Future Enhancements

### Player Class Enhancements

1. **Dynamic Probabilities**: Calculate probabilities for successful actions and fouls based on dynamic factors like player fatigue, pressure, and match context.

2. **Comprehensive Game State Management**: Develop a more detailed game state representation to manage events like fouls, goals, and player substitutions.

3. **AI Decision-Making**: Implement AI logic for player decision-making based on tactical objectives and opponent strategies.

4. **Expanded Event Handling**: Introduce more event types, such as corner kicks, goal kicks, and substitutions, to enhance realism.

### Ball Class Enhancements

1. **Realistic Ball Physics**: Implement spin, air resistance, bounce, and height (z-coordinates) to simulate realistic ball movement.

2. **Dynamic Velocity and Deceleration**: Implement a realistic model for ball movement that accounts for initial velocity, deceleration due to air resistance, and surface friction.

3. **Collision Detection**: Add collision detection logic to handle interactions with players, goals, and field boundaries.

4. **Ball Spin**: Implement logic to simulate spin affecting ball trajectory.

5. **Ball Height (Z-coordinates)**: Introduce a third dimension to simulate volleys, headers, and other aerial plays.

### Field Class Enhancements

1. **Dynamic Goal Sizes**: Allow for configurable goal sizes based on league or level of play.
2. **Field Boundary Definitions**: Add more specific boundary lines for penalty areas, halfway lines, touchlines, and goal lines.
3. **Penalty Spot and Center Circle**: Further refine the calculations for the penalty spot and center circle, taking into account different field sizes.

## Getting Started

To run the project and execute tests, ensure you have the required dependencies installed. Use the following command to run the test scripts:

```bash
node scripts/playerTest.js
```
