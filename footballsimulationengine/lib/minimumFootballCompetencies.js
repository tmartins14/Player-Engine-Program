// Minimum Football Competencies - set of rules that all players must abide by to be considered as
// behaving rationally

const { calculateAngle } = require("./common");

// Function to check if a player is within the field boundaries
function isWithinBoundaries(player) {
  return (
    0 <= player.current_position.x <= field.pitchWidth &&
    0 <= player.current_position.y <= field.pitchHeight
  );
}

function isOffside(checkPlayer, ballPlayer) {
  // Check if checkPlayer is in the offside position (behind the last defender)
  // if checkPlayer is not, then return FALSE
  // if checkPlayer is in the offside position,
  // check if ballPlayer passes to checkPlayer
  // If ballPlayer does not pass to checkPlayer, then return FALSE
  // If ballPlayer does pass to checkPlayer, then return TRUE
}

// Competency Helper Functions

// Checks if the player is currently performing a defensive action.
function isPerformingDefensiveAction() {}

// Checks if the player is attempting a pass
function isPassing() {}

// Checks if the player is attempting a shot
function isShooting() {}

// Checks if the shot direction is towards the opponents goal.
function isShotTowardsOpponentGoal() {}

// Finds the nearest teammate to the player
function findNearestTeammate(player, players) {}

// Find the nearest opponent to the player
function findNearestOpponent(player, opponents) {}
