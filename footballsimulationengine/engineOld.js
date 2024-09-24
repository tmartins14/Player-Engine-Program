//------------------------
//    NPM Modules
//------------------------
const common = require("./lib/common");
const setPositions = require("./lib/setPositions");
const setVariables = require("./lib/setVariables");
const playerMovement = require("./lib/playerMovement");
const ballMovement = require("./lib/ballMovement");
const validate = require("./lib/validate");

// All three functions returns matchDetails which in turn, is used to populate the player
// coordinates. Any new engine should return a similar object so that the server and frontend
// can read the data properly!!!

//------------------------
//    Functions
//------------------------
/**
 * This function initializes a simulated football match using provided team and pitch information.
 * It performs a series of validations on the input arguments and sets up initial match conditions
 * based on the validated data. The function configures both teams with game settings, decides which
 * team will kick off, and switches the sides of the second team to start the match.
 *
 * Steps performed:
 * 1. Validate the input arguments including teams and pitch details.
 * 2. Populate the initial match details using the input teams and pitch information.
 * 3. Set game-related variables and states for both teams using the initial match details.
 * 4. Determine which team will kick off and log the decision.
 * 5. Switch the side of the second team to ensure they start from the opposite end of the pitch.
 * 6. Return the fully populated match details ready for use in simulation.
 *
 * @param {Object} team1 - Object representing the first team, including players and team-specific info.
 * @param {Object} team2 - Object representing the second team, similar to team1.
 * @param {Object} pitchDetails - Contains details about the pitch dimensions and other related settings.
 * @returns {Object} The complete match details object ready for starting the match simulation.
 */
async function initiateGame(team1, team2, pitchDetails) {
  validate.validateArguments(team1, team2, pitchDetails);
  validate.validateTeam(team1);
  validate.validateTeam(team2);
  validate.validatePitch(pitchDetails);
  let matchDetails = setVariables.populateMatchDetails(
    team1,
    team2,
    pitchDetails
  );
  let kickOffTeam = setVariables.setGameVariables(matchDetails.kickOffTeam);
  let secondTeam = setVariables.setGameVariables(matchDetails.secondTeam);
  kickOffTeam = setVariables.koDecider(kickOffTeam, matchDetails);
  matchDetails.iterationLog.push(`Team to kick off - ${kickOffTeam.name}`);
  matchDetails.iterationLog.push(`Second team - ${secondTeam.name}`);
  secondTeam = setPositions.switchSide(secondTeam, matchDetails);
  matchDetails.kickOffTeam = kickOffTeam;
  matchDetails.secondTeam = secondTeam;
  return matchDetails;
}

/**
 * This function simulates a single iteration or "tick" of a football match. It performs various updates
 * to the match state based on player actions, ball movement, and other game events. It identifies the
 * closest players to the ball for both teams, simulates injuries, moves the ball, decides player movements,
 * checks for offside positions, and updates the overall match details accordingly.
 *
 * Steps performed:
 * 1. Validate the current state of the match details, including team configurations and player positions.
 * 2. Check for injuries for both teams which might affect player availability or performance.
 * 3. Move the ball based on previous events or actions.
 * 4. Identify the closest player to the ball from each team to potentially engage in the next action.
 * 5. Decide the movements for both teams based on the closest players' positions and the current state of the ball.
 * 6. Update each team's status in the match details after processing movements and actions.
 * 7. Check for any offside positions if the ball is actively in play with a team.
 * 8. Return the updated match details for use in the next iteration or for evaluating the match state.
 *
 * @param {Object} matchDetails - Object containing all relevant details of the match, including teams, players, and ball position.
 * @returns {Object} The updated match details after simulating the current iteration.
 */
async function playIteration(matchDetails) {
  let closestPlayerA = {
    name: "",
    position: 100000,
  };
  let closestPlayerB = {
    name: "",
    position: 100000,
  };
  validate.validateMatchDetails(matchDetails);
  validate.validateTeamSecondHalf(matchDetails.kickOffTeam);
  validate.validateTeamSecondHalf(matchDetails.secondTeam);
  validate.validatePlayerPositions(matchDetails);
  matchDetails.iterationLog = [];
  let { kickOffTeam, secondTeam } = matchDetails;
  common.matchInjury(matchDetails, kickOffTeam);
  common.matchInjury(matchDetails, secondTeam);
  matchDetails = ballMovement.moveBall(matchDetails);
  playerMovement.closestPlayerToBall(closestPlayerA, kickOffTeam, matchDetails);
  playerMovement.closestPlayerToBall(closestPlayerB, secondTeam, matchDetails);
  kickOffTeam = playerMovement.decideMovement(
    closestPlayerA,
    kickOffTeam,
    secondTeam,
    matchDetails
  );
  secondTeam = playerMovement.decideMovement(
    closestPlayerB,
    secondTeam,
    kickOffTeam,
    matchDetails
  );
  matchDetails.kickOffTeam = kickOffTeam;
  matchDetails.secondTeam = secondTeam;
  if (
    matchDetails.ball.ballOverIterations.length == 0 ||
    matchDetails.ball.withTeam != ""
  ) {
    playerMovement.checkOffside(kickOffTeam, secondTeam, matchDetails);
  }
  return matchDetails;
}

/**
 * This function is responsible for initiating the second half of a football match simulation. It
 * validates the current match setup, switches the sides of the teams on the pitch, scores a goal
 * to start the second half, and updates the match details accordingly.
 *
 * Steps performed:
 * 1. Validate the current state of the match details to ensure the match setup is correct.
 * 2. Switch the playing sides of both teams to simulate the change of sides at halftime.
 * 3. Simulate a goal being scored at the start of the second half to reset player positions and reflect any halftime adjustments.
 * 4. Increment the half counter to indicate the match is now in the second half.
 * 5. Update the match details object with the new configurations of the teams.
 * 6. Return the updated match details for ongoing game simulation.
 *
 * @param {Object} matchDetails - The current details of the match including team configurations, player positions, and game state.
 * @returns {Object} The updated match details after initializing the second half.
 */
async function startSecondHalf(matchDetails) {
  validate.validateMatchDetails(matchDetails);
  validate.validateTeamSecondHalf(matchDetails.kickOffTeam);
  validate.validateTeamSecondHalf(matchDetails.secondTeam);
  validate.validatePlayerPositions(matchDetails);
  let { kickOffTeam, secondTeam } = matchDetails;
  kickOffTeam = setPositions.switchSide(kickOffTeam, matchDetails);
  secondTeam = setPositions.switchSide(secondTeam, matchDetails);
  setPositions.setGoalScored(secondTeam, kickOffTeam, matchDetails);
  matchDetails.half++;
  matchDetails.kickOffTeam = kickOffTeam;
  matchDetails.secondTeam = secondTeam;
  return matchDetails;
}

module.exports = {
  initiateGame,
  playIteration,
  startSecondHalf,
};
