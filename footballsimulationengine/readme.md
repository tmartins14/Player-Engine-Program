# Soccer Simulation Project

This project is a soccer simulation program designed to model player behavior and interactions on a soccer field. It focuses on simulating various aspects of soccer gameplay, including player movement, defensive actions, and decision-making based on game state.

## Project Components

### Player Class

The `Player` class represents a soccer player in the simulation. It includes attributes such as name, team ID, position, rating, and various skills (e.g., pace, shooting, defending).

**Key Methods:**

- `performDefensiveAction`: Determines and executes defensive actions (e.g., tackles, interceptions) based on the player's position and vicinity.
- `tackle`: Handles both slide and standing tackles, with the potential for fouls.
- `intercept`, `blockShot`, `clearBall`: Execute specific defensive actions.

### Ball Class

The `Ball` class simulates the behavior and physics of a soccer ball on the field. It includes attributes for position, velocity, and control status.

**Key Methods:**

- `resetBall`: Resets the ball to the center of the field, typically used for the start of play or after a goal.
- `resetForGoalKick`: Positions the ball on the edge of the 6-yard box for a goal kick.
- `resetForCornerKick`, `resetForFreeKick`, `resetForThrowIn`: Adjusts the ball's position for specific restart scenarios.

### Testing Scripts

- **`playerTest.js`**: A script designed to test the functionality of the `Player` class. It includes tests for creating players, managing player movements, and verifying competencies.

### Models

- **Player Model**: Defines the player attributes stored in the database, including skills and positions.
- **PlayerMovement Model**: Records player movements and states during a game, such as position, fitness, and ball possession.

## Assumptions and Hard-Coded Values

### Assumptions

1. **Field Dimensions**: The field is assumed to be a standard size, with the width and length specified in meters. Adjust these values based on the actual field used in your simulation.
2. **Player Attributes**: Attributes like defending and fitness are set between 0 and 100 and are used to calculate various actions' effectiveness and vicinity.

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

### General Enhancements

1. **Graphical User Interface**: Develop a user interface to visualize the simulation and allow user interactions.

## Getting Started

To run the project and execute tests, ensure you have the required dependencies installed. Use the following command to run the test scripts:

```bash
node scripts/playerTest.js
```
