const common = require(`./common`);
const setVariables = require(`./setVariables`);

/**
 * Configures the positions of players from both teams for a corner kick scenario based on the
 * given side (left or right) and team's half (upper or lower). It also resets the ball position
 * according to the corner taken and updates the match details accordingly.
 *
 * @param {Object} team - The team taking the corner.
 * @param {Object} opposition - The opposing team.
 * @param {string} side - Specifies the side from which the corner is taken ('left' or 'right').
 * @param {Object} matchDetails - Object containing details about the match, including the pitch
 * size and current ball status.
 * @returns {Array} - Updated position of the ball after setting the corner.
 */
function setCornerPositions(team, opposition, side, matchDetails) {
  // Removes ball possession from both teams before setting up the corner
  removeBall(team);
  removeBall(opposition);

  // Retrieve pitch dimensions from matchDetails
  const [matchWidth, matchHeight] = matchDetails.pitchSize;

  // Check if the team is in their upper half or lower half of the pitch
  if (team.players[0].originPOS[1] > matchHeight / 2) {
    // Setting positions for a corner kick from the left or right side
    if (side === `left`) {
      // Define starting positions for each player on the team and opposition for a left corner kick
      team.players[1].startPOS = [0, 0];
      team.players[4].startPOS = [10, 20];
      team.players[5].startPOS = [60, 40];
      team.players[8].startPOS = [50, 70];
      team.players[9].startPOS = [80, 50];
      team.players[10].startPOS = [60, 80];
      opposition.players[5].startPOS = [15, 25];
      opposition.players[6].startPOS = [40, 35];
      opposition.players[7].startPOS = [60, 35];
      opposition.players[8].startPOS = [60, 70];
      // Set ball position to the corner position, player 1 from the team starts with the ball
      matchDetails.ball.position = [0, 0, 0];
    } else {
      // Define starting positions for a right corner kick, mirroring the left side setup
      team.players[1].startPOS = [matchWidth, 0];
      team.players[4].startPOS = [matchWidth - 10, 20];
      team.players[5].startPOS = [matchWidth - 60, 40];
      team.players[8].startPOS = [matchWidth - 50, 70];
      team.players[9].startPOS = [matchWidth - 80, 50];
      team.players[10].startPOS = [matchWidth - 60, 80];
      opposition.players[5].startPOS = [matchWidth - 15, 25];
      opposition.players[6].startPOS = [matchWidth - 40, 35];
      opposition.players[7].startPOS = [matchWidth - 60, 35];
      opposition.players[8].startPOS = [matchWidth - 60, 70];
      // Set ball position to the corner at the right end
      matchDetails.ball.position = [matchWidth, 0, 0];
    }
  } else if (side === `left`) {
    // Define starting positions for the team and opposition for a left corner kick from the lower half
    team.players[1].startPOS = [0, matchHeight];
    team.players[4].startPOS = [10, matchHeight - 20];
    team.players[5].startPOS = [60, matchHeight - 40];
    team.players[8].startPOS = [50, matchHeight - 70];
    team.players[9].startPOS = [80, matchHeight - 50];
    team.players[10].startPOS = [60, matchHeight - 80];
    opposition.players[5].startPOS = [15, matchHeight - 25];
    opposition.players[6].startPOS = [40, matchHeight - 35];
    opposition.players[7].startPOS = [60, matchHeight - 35];
    opposition.players[8].startPOS = [60, matchHeight - 70];
    // Ball positioned at the corner of the lower left
    matchDetails.ball.position = [0, matchHeight, 0];
  } else {
    // Define starting positions for a right corner kick from the lower half, mirroring the upper half setup
    team.players[1].startPOS = [matchWidth, matchHeight];
    team.players[4].startPOS = [matchWidth - 10, matchHeight - 20];
    team.players[5].startPOS = [matchWidth - 60, matchHeight - 40];
    team.players[8].startPOS = [matchWidth - 50, matchHeight - 70];
    team.players[9].startPOS = [matchWidth - 80, matchHeight - 50];
    team.players[10].startPOS = [matchWidth - 60, matchHeight - 80];
    opposition.players[5].startPOS = [matchWidth - 15, matchHeight - 25];
    opposition.players[6].startPOS = [matchWidth - 40, matchHeight - 35];
    opposition.players[7].startPOS = [matchWidth - 60, matchHeight - 35];
    opposition.players[8].startPOS = [matchWidth - 60, matchHeight - 70];
    // Ball positioned at the corner of the lower right
    matchDetails.ball.position = [matchWidth, matchHeight, 0];
  }

  // Setting player who starts with the ball, resetting ball iteration logs, and setting ball ownership
  team.players[1].hasBall = true;
  matchDetails.ball.ballOverIterations = [];
  matchDetails.ball.withPlayer = true;
  matchDetails.ball.Player = team.players[1].name;
  matchDetails.ball.withTeam = team.name;

  // Return the position of the ball
  return matchDetails.ball.position;
}

/**
 * Configures the positions of players from both teams for a throw-in scenario based on the given
 * side ('left' or 'right') and location on the pitch. It adjusts player positions according to the
 * throw-in location and resets ball possession and position accordingly in the match details.
 *
 * @param {Object} team - The team taking the throw-in.
 * @param {Object} opposition - The opposing team.
 * @param {string} side - Specifies the side from which the throw-in is taken ('left' or 'right').
 * @param {number} place - The y-coordinate on the pitch where the throw-in takes place.
 * @param {Object} matchDetails - Object containing details about the match, including the pitch size
 * and current ball status.
 * @returns {Array} - Updated position of the ball after setting the throw-in.
 */
function setThrowIn(team, opposition, side, place, matchDetails) {
  // Remove possession of the ball from both teams
  removeBall(team);
  removeBall(opposition);

  // Get pitch dimensions
  const [matchWidth, matchHeight] = matchDetails.pitchSize;

  // Adjust the throw-in location to ensure it doesn't exceed pitch boundaries
  let newPlaceB = place - 30 < 0 ? 30 : place;
  place = newPlaceB;
  let newPlaceT = place + 10 > matchHeight + 1 ? matchHeight - 10 : place;
  place = newPlaceT;

  // Calculate the movement needed for the team based on the player's original position and the throw-in place
  let movement = team.players[5].originPOS[1] - place;
  // Calculate the opposite movement for the opposition team
  let oppMovement = 0 - movement;

  // Check if the throw-in is on the left side of the pitch
  if (side === `left`) {
    // Set the team players' positions according to the throw-in place
    setPlayerPositions(matchDetails, team, movement);
    team.players[5].startPOS = [0, place];
    team.players[8].startPOS = [15, place];
    team.players[7].startPOS = [10, place + 10];
    team.players[9].startPOS = [10, place - 10];
    // Set the ball's position at the throw-in location
    matchDetails.ball.position = [0, place, 0];
    team.players[5].startPOS = matchDetails.ball.position.slice(0, 2); // Adjust player's position to match the ball
    team.players[5].hasBall = true;

    // Reset and update ball-related details
    matchDetails.ball.ballOverIterations = [];
    matchDetails.ball.withPlayer = true;
    matchDetails.ball.Player = team.players[5].name;
    matchDetails.ball.withTeam = team.name;

    // Position the opposition players
    setPlayerPositions(matchDetails, opposition, oppMovement);
    opposition.players[5].startPOS = [20, place];
    opposition.players[7].startPOS = [30, place + 5];
    opposition.players[8].startPOS = [25, place - 15];
    opposition.players[9].startPOS = [10, place - 30];
  } else {
    // If throw-in is on the right side, position similarly but mirrored horizontally
    setPlayerPositions(matchDetails, team, movement);
    team.players[5].startPOS = [matchWidth, place];
    team.players[8].startPOS = [matchWidth - 15, place];
    team.players[7].startPOS = [matchWidth - 10, place + 10];
    team.players[9].startPOS = [matchWidth - 10, place - 10];
    matchDetails.ball.position = [matchWidth, place, 0];
    team.players[5].startPOS = matchDetails.ball.position.slice(0, 2); // Adjust player's position to match the ball
    team.players[5].hasBall = true;

    // Reset and update ball-related details
    matchDetails.ball.ballOverIterations = [];
    matchDetails.ball.withPlayer = true;
    matchDetails.ball.Player = team.players[5].name;
    matchDetails.ball.withTeam = team.name;

    // Position the opposition similarly but mirrored horizontally
    setPlayerPositions(matchDetails, opposition, oppMovement);
    opposition.players[5].startPOS = [matchWidth - 20, place];
    opposition.players[7].startPOS = [matchWidth - 30, place + 5];
    opposition.players[8].startPOS = [matchWidth - 25, place - 15];
    opposition.players[9].startPOS = [matchWidth - 10, place - 30];
  }

  // Return the ball's new position
  return matchDetails.ball.position;
}

/**
 * Sets up the field for a goal kick by resetting player positions appropriately, clearing any
 * current ball possession, and positioning the ball near the goal area. This function takes into
 * account the side of the pitch the team's goalkeeper is positioned and adjusts all players'
 * positions accordingly.
 *
 * @param {Object} team - The team that has the goal kick.
 * @param {Object} opposition - The opposing team.
 * @param {Object} matchDetails - Object containing details about the match, including pitch size and
 * current ball status.
 * @returns {Array} - Updated position of the ball after setting up the goal kick.
 */
function setGoalKick(team, opposition, matchDetails) {
  // Clears ball possession from both teams
  removeBall(team);
  removeBall(opposition);

  // Retrieves the pitch dimensions from the match details
  const [matchWidth, matchHeight] = matchDetails.pitchSize;

  // Determines the player positions based on which half the team's goalkeeper is located
  if (team.players[0].originPOS[1] > matchHeight / 2) {
    // If in the upper half, move the team players back by 80 units
    setPlayerPositions(matchDetails, team, -80);
    // Resets opposition player positions to their default
    setVariables.resetPlayerPositions(opposition);
    // Sets the ball's position near the goal area on the pitch center line
    matchDetails.ball.position = [matchWidth / 2, matchHeight - 20, 0];
  } else {
    // If in the lower half, move the team players forward by 80 units
    setPlayerPositions(matchDetails, team, 80);
    // Resets opposition player positions to their default
    setVariables.resetPlayerPositions(opposition);
    // Sets the ball's position near the goal area on the pitch center line
    matchDetails.ball.position = [matchWidth / 2, 20, 0];
  }

  // Update the goalkeeper's position to match the ball's location
  team.players[0].startPOS = matchDetails.ball.position.slice(0, 2);
  // Marks the goalkeeper as having the ball
  team.players[0].hasBall = true;

  // Resets and updates ball interaction details
  matchDetails.ball.ballOverIterations = [];
  matchDetails.ball.withPlayer = true;
  matchDetails.ball.Player = team.players[0].name;
  matchDetails.ball.withTeam = team.name;

  // Returns the new position of the ball
  return matchDetails.ball.position;
}

/**
 * Determines the closest player to a specific position on the pitch, excluding the player who
 * initiates the check. This function is typically used to find the nearest teammate or opponent
 * relative to a certain location, such as the ball or a strategic position.
 *
 * @param {Object} player - The player initiating the check, excluded from the results.
 * @param {Object} team - The team whose players are being checked.
 * @param {Array} position - The x and y coordinates on the pitch to check proximity to.
 * @returns {Object} - An object containing the closest player and their proximity details including
 * distance in both x and y coordinates and total proximity.
 */
function closestPlayerToPosition(player, team, position) {
  let currentDifference = 100000; // Initialize a large number to find the minimum difference
  let playerInformation = {
    thePlayer: "",
    proxPos: ["", ""],
    proxToBall: "",
  };

  // Iterates through all players in the team
  for (const thisPlayer of team.players) {
    // Ensures the player being checked isn't the one calling the function
    if (player.name !== thisPlayer.name) {
      // Calculate horizontal and vertical distances from the ball
      let ballToPlayerX = thisPlayer.startPOS[0] - position[0];
      let ballToPlayerY = thisPlayer.startPOS[1] - position[1];
      // Calculate the total proximity to the ball
      let proximityToBall = Math.abs(ballToPlayerX + ballToPlayerY);

      // Updates the closest player if this one is closer than the previous closest
      if (proximityToBall < currentDifference) {
        playerInformation.thePlayer = thisPlayer;
        playerInformation.proximity = [ballToPlayerX, ballToPlayerY];
        playerInformation.proxToBall = proximityToBall;
        currentDifference = proximityToBall;
      }
    }
  }

  // Returns information about the closest player
  return playerInformation;
}

/**
 * Sets up a set piece play, either a penalty or a freekick, depending on the ball's position
 * relative to the pitch and the team's side. This function also handles resetting ball possession
 * and updating the appropriate game statistics such as penalties and freekicks awarded.
 *
 * @param {Object} matchDetails - The current state of the match including details like pitch size and current ball position.
 * @param {Object} team - The team that has been awarded the set piece.
 * @param {Object} opposition - The opposing team.
 * @returns {void} - The function updates the matchDetails object but does not return any value.
 */
function setSetpiece(matchDetails, team, opposition) {
  // Removes possession from both teams to reset the play
  removeBall(team);
  removeBall(opposition);

  // Retrieve the pitch dimensions from the match details
  const [matchWidth, matchHeight] = matchDetails.pitchSize;

  // Current position of the ball
  let ballPosition = matchDetails.ball.position;

  // Check if the ball is within the central vertical third of the pitch and within the first sixth horizontally
  let ballXpos1 = common.isBetween(
    ballPosition[0],
    matchWidth / 4 - 5,
    matchWidth - matchWidth / 4 + 5
  );
  let ballYpos1 = common.isBetween(ballPosition[1], 0, matchHeight / 6 - 5);

  // Check for the same vertical conditions but in the last sixth of the pitch
  let ballXpos2 = ballXpos1; // Reuse the X position check for lower half of the pitch
  let ballYpos2 = common.isBetween(
    ballPosition[1],
    matchHeight - matchHeight / 6 + 5,
    matchHeight
  );

  // Determine the action based on the team's field side and the ball's position
  if (team.players[0].originPOS[1] > matchHeight / 2) {
    // If the team is playing from the top half of the pitch
    if (ballXpos1 && ballYpos1) {
      // If within the top penalty area, set up a penalty
      setPenalty(team, opposition, `top`, matchDetails);
      matchDetails.iterationLog.push(`penalty to: ${team.name}`);
      // Increment the appropriate penalty statistic based on which team is taking it
      if (team.name === matchDetails.kickOffTeam.name) {
        matchDetails.kickOffTeamStatistics.penalties++;
      } else {
        matchDetails.secondTeamStatistics.penalties++;
      }
    } else {
      // Otherwise, set up a freekick from the top
      setFreekick(ballPosition, team, opposition, `top`, matchDetails);
      matchDetails.iterationLog.push(`freekick to: ${team.name}`);
      // Increment the freekick count appropriately
      if (team.name === matchDetails.kickOffTeam.name) {
        matchDetails.kickOffTeamStatistics.freekicks++;
      } else {
        matchDetails.secondTeamStatistics.freekicks++;
      }
    }
  } else if (ballXpos2 && ballYpos2) {
    // If within the bottom penalty area, set up a penalty
    setPenalty(team, opposition, `bottom`, matchDetails);
    matchDetails.iterationLog.push(`penalty to: ${team.name}`);
    // Increment the penalty count appropriately
    if (team.name === matchDetails.kickOffTeam.name) {
      matchDetails.kickOffTeamStatistics.penalties++;
    } else {
      matchDetails.secondTeamStatistics.penalties++;
    }
  } else {
    // Otherwise, set up a freekick from the bottom
    setFreekick(ballPosition, team, opposition, `bottom`, matchDetails);
    matchDetails.iterationLog.push(`freekick to: ${team.name}`);
    // Increment the freekick count appropriately
    if (team.name === matchDetails.kickOffTeam.name) {
      matchDetails.kickOffTeamStatistics.freekicks++;
    } else {
      matchDetails.secondTeamStatistics.freekicks++;
    }
  }
}

/**
 * Configures the game state for a penalty kick following a foul within the penalty area. This
 * function positions the ball at the designated penalty spot, sets the positions of the goalkeeper
 * and other players, and updates the match details to reflect that a penalty is being taken.
 *
 * @param {Object} team - The team that is taking the penalty.
 * @param {Object} opposition - The opposing team whose players are set up to defend the penalty.
 * @param {string} side - Specifies whether the penalty is being taken from the top or bottom of the
 * pitch.
 * @param {Object} matchDetails - Contains current match state information including pitch dimensions
 * and the ball's current position.
 * @returns {void} - Updates the matchDetails object to reflect the new setup for the penalty but
 * does not return any value.
 */
function setPenalty(team, opposition, side, matchDetails) {
  // Clear ball possession from both teams before setting up the penalty
  removeBall(team);
  removeBall(opposition);

  // Retrieve pitch dimensions
  const [matchWidth, matchHeight] = matchDetails.pitchSize;

  // Initialize arrays to hold positions for shooting and positioning players
  let shootArray;
  let tempArray;

  // Determine the position of the penalty based on the side (top or bottom of the pitch)
  if (side === `top`) {
    // Set up the penalty spot near the top of the goal area
    tempArray = [matchWidth / 2, matchHeight / 6];
    shootArray = [matchWidth / 2, 60];
  } else {
    // Set up the penalty spot near the bottom of the goal area
    tempArray = [matchWidth / 2, matchHeight - matchHeight / 6];
    shootArray = [matchWidth / 2, matchHeight - 60];
  }

  // Set the ball's position for the penalty kick and adjust for slight positioning
  matchDetails.ball.position = shootArray.map((x) => x);
  matchDetails.ball.position[2] = 0; // Ensure the ball is placed at ground level
  matchDetails.ball.direction = side === `top` ? `north` : `south`;
  matchDetails.ball.position[1] += side === `top` ? -2 : 2; // Slight adjustment to position

  // Set the goalkeeper's position based on their origin position
  opposition.players[0].startPOS = opposition.players[0].originPOS.map(
    (x) => x
  );

  // Variables to offset player positions along the x-axis
  let oppxpos = -10;
  let teamxpos = -9;

  // Position all field players (1-10) along the penalty area, alternating their positions slightly
  for (const num of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    opposition.players[num].startPOS = tempArray.map((x) => x);
    opposition.players[num].startPOS[0] += oppxpos;
    team.players[num].startPOS = tempArray.map((x) => x);
    team.players[num].startPOS[0] += teamxpos;
    oppxpos += 2; // Incrementally adjust opposition player x-offset
    teamxpos += 2; // Incrementally adjust team player x-offset
  }

  // Set the designated penalty taker's position and mark them as having the ball
  team.players[10].startPOS = shootArray.map((x) => x);
  team.players[10].hasBall = true;

  // Reset any ongoing interactions with the ball and update player-ball relations
  matchDetails.ball.ballOverIterations = [];
  matchDetails.ball.Player = team.players[10].name;
  matchDetails.ball.withPlayer = true;
  matchDetails.ball.withTeam = team.name;

  // Set the teams' intents: the shooting team is attacking, the opposing team is defending
  team.intent = `attack`;
  opposition.intent = `defend`;
}

/**
 * Configures the game state for a freekick following a foul outside the penalty area but potentially
 * within scoring range. This function sets the positions for the ball, the players from both teams,
 * and adjusts the play state to prepare for the execution of the freekick. It also determines the
 * direction of the freekick based on its position on the pitch and the side (top or bottom) from
 * which the team is playing.
 *
 * @param {Array} ballPosition - The current position of the ball on the pitch where the freekick
 * will be taken.
 * @param {Object} team - The team that has been awarded the freekick.
 * @param {Object} opposition - The opposing team set to defend against the freekick.
 * @param {string} side - Specifies whether the team is playing from the top or bottom of the pitch,
 * which influences the setup of the freekick.
 * @param {Object} matchDetails - Contains current match state information including pitch dimensions
 * and other relevant details.
 * @returns {void} - Updates the matchDetails object to reflect the new setup for the freekick but
 * does not return any value.
 */
function setFreekick(ballPosition, team, opposition, side, matchDetails) {
  removeBall(team);
  removeBall(opposition);
  const [matchWidth, matchHeight] = matchDetails.pitchSize;
  let tempArray = ballPosition;
  team.players[5].startPOS = tempArray.map((x) => x);
  matchDetails.ball.withTeam = team.name;
  matchDetails.ball.withPlayer = true;
  matchDetails.ball.Player = team.players[5].name;
  team.players[5].hasBall = true;
  matchDetails.ball.ballOverIterations = [];
  if (side === `top`) {
    //shooting to top of pitch
    if (ballPosition[1] > matchHeight - matchHeight / 3) {
      matchDetails.ball.Player = team.players[0].name;
      team.players[0].hasBall = true;
      matchDetails.ball.ballOverIterations = [];
      team.players[0].startPOS = tempArray.map((x) => x);
      //goalkeepers Y position
      for (const num of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
        let gkY = matchHeight - team.players[0].startPOS[1];
        let [txpos, typos] = team.players[num].originPOS;
        let [oxpos, oypos] = opposition.players[num].originPOS;
        let [, t1p1ypos] = team.players[1].startPOS;
        team.players[num].startPOS[0] = txpos;
        team.players[num].startPOS[1] =
          matchHeight - matchHeight / 6 - gkY - (matchHeight - typos);
        if (num == 9 || num == 10) {
          opposition.players[num].startPOS[0] = oxpos + 10;
          opposition.players[num].startPOS[0] = oxpos + 10;
          opposition.players[num].startPOS[1] = t1p1ypos;
        } else {
          opposition.players[num].startPOS[0] = oxpos;
          if (oypos + matchHeight / 6 < matchHeight + 1) {
            opposition.players[num].startPOS[1] = oypos + matchHeight / 6;
          } else {
            opposition.players[num].startPOS[1] = oypos;
          }
        }
      }
    } else if (
      ballPosition[1] > matchHeight / 2 &&
      ballPosition[1] < matchHeight - matchHeight / 3
    ) {
      //ball in own half and opposition is at the bottom of pitch
      if (ballPosition[0] > matchWidth / 2) {
        matchDetails.ball.direction = `northwest`;
      } else if (ballPosition[0] < matchWidth / 2) {
        matchDetails.ball.direction = `northeast`;
      } else {
        matchDetails.ball.direction = `north`;
      }
      const level = common.getRandomNumber(matchHeight / 2, 200);
      for (const num of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
        let [txpos] = team.players[num].originPOS;
        let [oxpos, oypos] = opposition.players[num].originPOS;
        team.players[num].startPOS[0] = txpos;
        opposition.players[num].startPOS[0] = oxpos;
        if (num == 1 || num == 2 || num == 3 || num == 4) {
          team.players[num].startPOS[1] =
            team.players[5].startPOS[1] + matchHeight / 6;
          opposition.players[num].startPOS[1] = oypos + matchHeight / 7;
        } else if (num == 6 || num == 7 || num == 8) {
          team.players[num].startPOS[1] = level;
          if (oypos + matchHeight / 6 < matchHeight + 1) {
            opposition.players[num].startPOS[1] = oypos + matchHeight / 6;
          } else {
            opposition.players[num].startPOS[1] = oypos;
          }
        } else {
          team.players[num].startPOS[1] = level - matchHeight / 6;
          if (oypos + matchHeight / 6 < matchHeight + 1) {
            opposition.players[num].startPOS[1] = oypos + matchHeight / 6;
          } else {
            opposition.players[num].startPOS[1] = oypos;
          }
        }
        if (oypos + matchHeight / 7 < matchHeight + 1) {
          opposition.players[num].startPOS[1] = oypos + matchHeight / 7;
        } else {
          opposition.players[num].startPOS[1] = oypos;
        }
      }
    } else if (
      ballPosition[1] < matchHeight / 2 &&
      ballPosition[1] > matchHeight / 6
    ) {
      //between halfway and last sixth
      const level = Math.round(
        common.getRandomNumber(matchHeight / 9, ballPosition[1] + 15)
      );
      team.players[0].startPOS = [
        team.players[0].originPOS[0],
        team.players[5].startPOS[1] + matchHeight / 3,
      ];
      team.players[1].startPOS = [
        team.players[1].originPOS[0],
        team.players[5].startPOS[1] + matchHeight / 6,
      ];
      team.players[2].startPOS = [
        team.players[2].originPOS[0],
        team.players[5].startPOS[1] + matchHeight / 6,
      ];
      team.players[3].startPOS = [
        team.players[3].originPOS[0],
        team.players[5].startPOS[1] + matchHeight / 6,
      ];
      team.players[4].startPOS = [
        team.players[4].originPOS[0],
        team.players[5].startPOS[1] + matchHeight / 6,
      ];
      team.players[6].startPOS = [team.players[6].originPOS[0], level];
      team.players[7].startPOS = [team.players[7].originPOS[0], level];
      team.players[8].startPOS = [team.players[8].originPOS[0], level];
      team.players[9].startPOS = [
        team.players[9].originPOS[0],
        common.getRandomNumber(5, level - 20),
      ];
      team.players[10].startPOS = [
        team.players[10].originPOS[0],
        common.getRandomNumber(5, level - 20),
      ];
      if (ballPosition[0] > matchWidth / 2) {
        matchDetails.ball.direction = `northwest`;
        const midGoal = matchWidth / 2;
        opposition.players[5].startPOS = [
          tempArray[0] + (midGoal - tempArray[0]) / 2,
          tempArray[1] - 60,
        ];
        opposition.players[6].startPOS = [
          tempArray[0] + (midGoal - tempArray[0]) / 2,
          tempArray[1] - 30,
        ];
        opposition.players[7].startPOS = [tempArray[0], tempArray[1] - 30];
        opposition.players[8].startPOS = [
          team.players[10].startPOS[0] + 2,
          team.players[10].startPOS[0] - 2,
        ];
        opposition.players[9].startPOS = [
          tempArray[0] + (midGoal - tempArray[0]) / 2 + 2,
          tempArray[1] - 30,
        ];
        opposition.players[10].startPOS = [
          tempArray[0] + (midGoal - tempArray[0]) / 2 - 2,
          tempArray[1] - 30,
        ];
      } else if (ballPosition[0] < matchWidth / 2) {
        matchDetails.ball.direction = `northeast`;
        const midGoal = matchWidth / 2;
        opposition.players[5].startPOS = [
          tempArray[0] + (midGoal - tempArray[0]) / 2,
          tempArray[1] - 60,
        ];
        opposition.players[6].startPOS = [
          tempArray[0] + (midGoal - tempArray[0]) / 2,
          tempArray[1] - 30,
        ];
        opposition.players[7].startPOS = [tempArray[0], tempArray[1] - 30];
        opposition.players[8].startPOS = [
          team.players[10].startPOS[0] + 2,
          team.players[10].startPOS[0] - 2,
        ];
        opposition.players[9].startPOS = [
          tempArray[0] + (midGoal - tempArray[0]) / 2 + 2,
          tempArray[1] - 30,
        ];
        opposition.players[10].startPOS = [
          tempArray[0] + (midGoal - tempArray[0]) / 2 - 2,
          tempArray[1] - 30,
        ];
      } else {
        matchDetails.ball.direction = `north`;
        opposition.players[5].startPOS = [tempArray[0], tempArray[1] - 60];
        opposition.players[6].startPOS = [tempArray[0], tempArray[1] - 30];
        opposition.players[7].startPOS = [tempArray[0] + 20, tempArray[1] - 20];
        opposition.players[8].startPOS = [
          team.players[10].startPOS[0] - 2,
          team.players[10].startPOS[0] + 2,
        ];
        opposition.players[9].startPOS = [tempArray[0] - 2, tempArray[1] - 30];
        opposition.players[10].startPOS = [tempArray[0] + 2, tempArray[1] - 30];
      }
    } else {
      //in the last sixth
      for (const num of [1, 4, 5, 7, 8, 9, 10]) {
        let xRandpos = common.getRandomNumber(
          matchWidth / 4 - 5,
          matchWidth - matchWidth / 4 + 5
        );
        let yRandpos = common.getRandomNumber(0, matchHeight / 6 - 5);
        team.players[num].startPOS[0] = xRandpos;
        team.players[num].startPOS[1] = yRandpos;
      }
      team.players[0].startPOS = [
        team.players[0].originPOS[0],
        team.players[0].originPOS[1] - matchHeight / 3,
      ];
      team.players[2].startPOS = [
        team.players[2].originPOS[0],
        team.players[2].originPOS[1] - matchHeight / 2,
      ];
      team.players[3].startPOS = [
        team.players[3].originPOS[0],
        team.players[3].originPOS[1] - matchHeight / 2,
      ];
      opposition.players[1].startPOS = [matchWidth / 2 - 15, 10];
      opposition.players[2].startPOS = [matchWidth / 2 - 5, 10];
      opposition.players[3].startPOS = [matchWidth / 2 + 5, 10];
      opposition.players[4].startPOS = [matchWidth / 2 + 15, 10];
      if (ballPosition[0] > matchWidth / 2) {
        const midGoal = matchWidth / 2;
        matchDetails.ball.direction = `northwest`;
        if (tempArray[1] < 15) {
          opposition.players[5].startPOS = [
            tempArray[0] + (midGoal - tempArray[0]) / 2,
            tempArray[1],
          ];
          opposition.players[6].startPOS = [
            tempArray[0] + (midGoal - tempArray[0]) / 2,
            tempArray[1] + 2,
          ];
          opposition.players[7].startPOS = [
            tempArray[0] + (midGoal - tempArray[0]) / 2,
            tempArray[1] + 4,
          ];
        } else {
          opposition.players[5].startPOS = [
            tempArray[0] + (midGoal - tempArray[0]) / 2,
            tempArray[1] - 10,
          ];
          opposition.players[6].startPOS = [
            tempArray[0] + (midGoal - tempArray[0]) / 2,
            tempArray[1] - 12,
          ];
          opposition.players[7].startPOS = [
            tempArray[0] + (midGoal - tempArray[0]) / 2,
            tempArray[1] - 14,
          ];
        }
        let oxRandpos1 = common.getRandomNumber(
          matchWidth / 4 - 5,
          matchWidth - matchWidth / 4 + 5
        );
        let oxRandpos2 = common.getRandomNumber(
          matchWidth / 4 - 5,
          matchWidth - matchWidth / 4 + 5
        );
        let oyRandpos1 = common.getRandomNumber(0, matchHeight / 6 - 5);
        let oyRandpos2 = common.getRandomNumber(0, matchHeight / 6 - 5);
        opposition.players[8].startPOS = [oxRandpos1, oyRandpos1];
        opposition.players[9].startPOS = [oxRandpos2, oyRandpos2];
        opposition.players[10].startPOS = [matchWidth / 2, 20];
      } else if (ballPosition[0] < matchWidth / 2) {
        const midGoal = matchWidth / 2;
        matchDetails.ball.direction = `northeast`;
        if (tempArray[1] < 15) {
          opposition.players[8].startPOS = [
            tempArray[0] + (midGoal - tempArray[0]) / 2,
            tempArray[1],
          ];
          opposition.players[6].startPOS = [
            tempArray[0] + (midGoal - tempArray[0]) / 2,
            tempArray[1] + 2,
          ];
          opposition.players[7].startPOS = [
            tempArray[0] + (midGoal - tempArray[0]) / 2,
            tempArray[1] + 4,
          ];
        } else {
          opposition.players[8].startPOS = [
            tempArray[0] + (midGoal - tempArray[0]) / 2,
            tempArray[1] - 10,
          ];
          opposition.players[6].startPOS = [
            tempArray[0] + (midGoal - tempArray[0]) / 2,
            tempArray[1] - 12,
          ];
          opposition.players[7].startPOS = [
            tempArray[0] + (midGoal - tempArray[0]) / 2,
            tempArray[1] - 14,
          ];
        }
        let oxRandpos1 = common.getRandomNumber(
          matchWidth / 4 - 5,
          matchWidth - matchWidth / 4 - 5
        );
        let oxRandpos2 = common.getRandomNumber(
          matchWidth / 4 - 5,
          matchWidth - matchWidth / 4 - 5
        );
        let oyRandpos1 = common.getRandomNumber(0, matchHeight / 6 - 5);
        let oyRandpos2 = common.getRandomNumber(0, matchHeight / 6 - 5);
        opposition.players[5].startPOS = [oxRandpos1, oyRandpos1];
        opposition.players[9].startPOS = [oxRandpos2, oyRandpos2];
        opposition.players[10].startPOS = [matchWidth / 2, 20];
      } else {
        matchDetails.ball.direction = `north`;
        opposition.players[5].startPOS = [
          matchWidth / 2 - 4,
          tempArray[1] - 40,
        ];
        opposition.players[6].startPOS = [
          matchWidth / 2 - 2,
          tempArray[1] - 40,
        ];
        opposition.players[7].startPOS = [matchWidth / 2, tempArray[1] - 40];
        opposition.players[8].startPOS = [
          matchWidth / 2 + 2,
          tempArray[1] - 40,
        ];
        opposition.players[9].startPOS = [
          matchWidth / 2 + 4,
          tempArray[1] - 40,
        ];
        opposition.players[10].startPOS = [matchWidth / 2, 30];
      }
    }
  } else if (side === `bottom`) {
    if (ballPosition[1] < matchHeight / 3) {
      matchDetails.ball.Player = team.players[0].name;
      team.players[0].hasBall = true;
      matchDetails.ball.ballOverIterations = [];
      team.players[0].startPOS = tempArray.map((x) => x);
      let gkypos = team.players[0].startPOS[1];
      let [, defypos] = team.players[1].startPOS;
      for (const num of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
        let [txpos, typos] = team.players[num].originPOS;
        let [oxpos, oypos] = opposition.players[num].originPOS;
        team.players[num].startPOS[0] = txpos;
        if (matchHeight / 6 + gkypos + typos < matchHeight + 1) {
          team.players[num].startPOS[1] = matchHeight / 6 + gkypos + typos;
        } else {
          team.players[num].startPOS[1] = matchHeight;
        }
        opposition.players[num].startPOS[0] = oxpos;
        if (oypos - matchHeight / 6 < matchHeight + 1) {
          opposition.players[num].startPOS[1] = oypos - matchHeight / 6;
        } else {
          opposition.players[num].startPOS[1] = oypos;
        }
        if (num == 9 || num == 10) {
          if (oxpos + 10 < matchWidth + 1) {
            opposition.players[num].startPOS[0] = oxpos + 10;
          } else {
            opposition.players[num].startPOS[0] = oxpos;
          }
          opposition.players[num].startPOS[1] = defypos;
        }
      }
    } else if (
      ballPosition[1] < matchHeight / 2 &&
      ballPosition[1] > matchHeight / 3
    ) {
      //ball in own half and opposition is at the bottom of pitch
      if (ballPosition[0] > matchWidth / 2) {
        matchDetails.ball.direction = `southwest`;
      } else if (ballPosition[0] < matchWidth / 2) {
        matchDetails.ball.direction = `southeast`;
      } else {
        matchDetails.ball.direction = `south`;
      }
      const level = common.getRandomNumber(matchHeight / 2, matchHeight - 200);
      let [, tp5ypos] = team.players[5].startPOS;
      for (const num of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
        let [txpos] = team.players[num].originPOS;
        let [oxpos, oypos] = opposition.players[num].originPOS;
        team.players[num].startPOS[0] = txpos;
        opposition.players[num].startPOS[0] = oxpos;
        if (num == 1 || num == 2 || num == 3 || num == 4) {
          team.players[num].startPOS[1] = tp5ypos - matchHeight / 6;
          opposition.players[num].startPOS[1] = oypos - matchHeight / 7;
        } else if (num == 5) {
          opposition.players[num].startPOS[1] = oypos - matchHeight / 6;
        } else if (num == 6 || num == 7 || num == 8) {
          team.players[num].startPOS[1] = level;
          opposition.players[num].startPOS[1] = oypos - matchHeight / 6;
        } else if (num == 9 || num == 10) {
          team.players[num].startPOS[1] = level + matchHeight / 6;
          opposition.players[num].startPOS[1] = oypos - matchHeight / 6;
        }
      }
    } else if (
      ballPosition[1] > matchHeight / 2 &&
      ballPosition[1] < matchHeight - matchHeight / 6
    ) {
      //between halfway and last sixth
      let randLev = common.getRandomNumber(
        ballPosition[1] + 15,
        matchHeight - matchHeight / 9
      );
      let level = Math.round(randLev);
      if (level + matchHeight / 6 > matchHeight) {
        level -= matchHeight / 6;
      }
      let [, tp5ypos] = team.players[5].startPOS;
      for (const num of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
        let [txpos] = team.players[num].originPOS;
        team.players[num].startPOS[0] = txpos;
        if (num == 0) {
          team.players[num].startPOS[1] = tp5ypos - matchHeight / 3;
        } else if (num == 1 || num == 2 || num == 3 || num == 4) {
          team.players[num].startPOS[1] = tp5ypos - matchHeight / 6;
        } else if (num == 6 || num == 7 || num == 8) {
          team.players[num].startPOS[1] = level;
        } else if (num == 9 || num == 10) {
          if (level + matchHeight / 6 < matchHeight + 1) {
            team.players[num].startPOS[1] = level + matchHeight / 6 - 2;
          } else {
            team.players[num].startPOS[1] = matchHeight;
          }
        }
      }
      if (ballPosition[0] > matchWidth / 2) {
        matchDetails.ball.direction = `southwest`;
        const midGoal = matchWidth / 2;
        opposition.players[5].startPOS = [
          tempArray[0] + (midGoal - tempArray[0]) / 2,
          tempArray[1] + 60,
        ];
        opposition.players[6].startPOS = [
          tempArray[0] + (midGoal - tempArray[0]) / 2,
          tempArray[1] + 30,
        ];
        opposition.players[7].startPOS = [tempArray[0], tempArray[1] + 30];
        opposition.players[8].startPOS = [
          team.players[10].startPOS[0] + 2,
          team.players[10].startPOS[1] + 2,
        ];
        opposition.players[9].startPOS = [
          tempArray[0] + (midGoal - tempArray[0]) / 2 + 2,
          tempArray[1] + 30,
        ];
        opposition.players[10].startPOS = [
          tempArray[0] + (midGoal - tempArray[0]) / 2 - 2,
          tempArray[1] + 30,
        ];
      } else if (ballPosition[0] < matchWidth / 2) {
        matchDetails.ball.direction = `southeast`;
        const midGoal = matchWidth / 2;
        opposition.players[5].startPOS = [
          tempArray[0] + (midGoal - tempArray[0]) / 2,
          tempArray[1] + 60,
        ];
        opposition.players[6].startPOS = [
          tempArray[0] + (midGoal - tempArray[0]) / 2,
          tempArray[1] + 30,
        ];
        opposition.players[7].startPOS = [tempArray[0], tempArray[1] + 30];
        opposition.players[8].startPOS = [
          team.players[10].startPOS[0] + 2,
          team.players[10].startPOS[1] + 2,
        ];
        opposition.players[9].startPOS = [
          tempArray[0] + (midGoal - tempArray[0]) / 2 + 2,
          tempArray[1] + 30,
        ];
        opposition.players[10].startPOS = [
          tempArray[0] + (midGoal - tempArray[0]) / 2 - 2,
          tempArray[1] + 30,
        ];
      } else {
        matchDetails.ball.direction = `south`;
        opposition.players[5].startPOS = [tempArray[0], tempArray[1] + 60];
        opposition.players[6].startPOS = [tempArray[0], tempArray[1] + 30];
        opposition.players[7].startPOS = [tempArray[0] + 20, tempArray[1] + 20];
        opposition.players[8].startPOS = [
          team.players[10].startPOS[0] + 2,
          team.players[10].startPOS[1] + 2,
        ];
        opposition.players[9].startPOS = [tempArray[0] - 2, tempArray[1] + 30];
        opposition.players[10].startPOS = [tempArray[0] + 2, tempArray[1] + 30];
      }
    } else {
      //in the last sixth
      for (const num of [1, 4, 6, 7, 8, 9, 10]) {
        let xRandpos = common.getRandomNumber(
          matchWidth / 4 - 5,
          matchWidth - matchWidth / 4 + 5
        );
        let yRandpos = common.getRandomNumber(
          matchHeight - matchHeight / 6 + 5,
          matchHeight
        );
        team.players[num].startPOS = [xRandpos, yRandpos];
        if (num == 8 || num == 9) {
          opposition.players[num].startPOS = [xRandpos, yRandpos];
        }
      }
      team.players[0].startPOS = [
        team.players[0].originPOS[0],
        team.players[0].originPOS[1] + matchHeight / 3,
      ];
      team.players[2].startPOS = [
        team.players[2].originPOS[0],
        team.players[2].originPOS[1] + matchHeight / 2,
      ];
      team.players[3].startPOS = [
        team.players[3].originPOS[0],
        team.players[3].originPOS[1] + matchHeight / 2,
      ];
      opposition.players[1].startPOS = [matchWidth / 2 - 15, matchHeight - 10];
      opposition.players[2].startPOS = [matchWidth / 2 - 5, matchHeight - 10];
      opposition.players[3].startPOS = [matchWidth / 2 + 5, matchHeight - 10];
      opposition.players[4].startPOS = [matchWidth / 2 + 15, matchHeight - 10];
      if (ballPosition[0] > matchWidth / 2) {
        const midGoal = matchWidth / 2;
        matchDetails.ball.direction = `southwest`;
        if (tempArray[1] > matchHeight - 15) {
          opposition.players[5].startPOS = [
            tempArray[0] + (midGoal - tempArray[0]) / 2,
            tempArray[1],
          ];
          opposition.players[6].startPOS = [
            tempArray[0] + (midGoal - tempArray[0]) / 2,
            tempArray[1] - 2,
          ];
          opposition.players[7].startPOS = [
            tempArray[0] + (midGoal - tempArray[0]) / 2,
            tempArray[1] - 4,
          ];
        } else {
          opposition.players[5].startPOS = [
            tempArray[0] + (midGoal - tempArray[0]) / 2,
            tempArray[1] + 10,
          ];
          opposition.players[6].startPOS = [
            tempArray[0] + (midGoal - tempArray[0]) / 2,
            tempArray[1] + 12,
          ];
          opposition.players[7].startPOS = [
            tempArray[0] + (midGoal - tempArray[0]) / 2,
            tempArray[1] + 14,
          ];
        }
        opposition.players[10].startPOS = [matchWidth / 2, matchHeight - 20];
      } else if (ballPosition[0] < matchWidth / 2) {
        const midGoal = matchWidth / 2;
        matchDetails.ball.direction = `southeast`;
        if (tempArray[1] > matchHeight - 15) {
          opposition.players[8].startPOS = [
            tempArray[0] + (midGoal - tempArray[0]) / 2,
            tempArray[1],
          ];
          opposition.players[6].startPOS = [
            tempArray[0] + (midGoal - tempArray[0]) / 2,
            tempArray[1] - 2,
          ];
          opposition.players[7].startPOS = [
            tempArray[0] + (midGoal - tempArray[0]) / 2,
            tempArray[1] - 4,
          ];
        } else {
          opposition.players[8].startPOS = [
            tempArray[0] + (midGoal - tempArray[0]) / 2,
            tempArray[1] + 10,
          ];
          opposition.players[6].startPOS = [
            tempArray[0] + (midGoal - tempArray[0]) / 2,
            tempArray[1] + 12,
          ];
          opposition.players[7].startPOS = [
            tempArray[0] + (midGoal - tempArray[0]) / 2,
            tempArray[1] + 14,
          ];
        }
        let xRandpos = common.getRandomNumber(
          matchWidth / 4 - 5,
          matchWidth - matchWidth / 4 + 5
        );
        let yRandpos = common.getRandomNumber(
          matchHeight - matchHeight / 6 + 5,
          matchHeight
        );
        opposition.players[5].startPOS = [xRandpos, yRandpos];
        opposition.players[9].startPOS = [xRandpos, yRandpos];
        opposition.players[10].startPOS = [matchWidth / 2, matchHeight - 20];
      } else {
        matchDetails.ball.direction = `south`;
        opposition.players[5].startPOS = [
          matchWidth / 2 - 4,
          tempArray[1] + 40,
        ];
        opposition.players[6].startPOS = [
          matchWidth / 2 - 2,
          tempArray[1] + 40,
        ];
        opposition.players[7].startPOS = [matchWidth / 2, tempArray[1] + 40];
        opposition.players[8].startPOS = [
          matchWidth / 2 + 2,
          tempArray[1] + 40,
        ];
        opposition.players[9].startPOS = [
          matchWidth / 2 + 4,
          tempArray[1] + 40,
        ];
        opposition.players[10].startPOS = [matchWidth / 2, matchHeight - 30];
      }
    }
  }
}

/**
 * Handles the aftermath of a goal being scored in a soccer match simulation. This function resets
 * player positions to standard starting locations, assigns the ball to a player from the conceding
 * team at the center of the pitch, and updates the match state to reflect the goal. It ensures that
 * both teams are ready to restart the game following the scoring event.
 *
 * @param {Object} scoringTeam - The team that scored the goal.
 * @param {Object} conceedingTeam - The team that conceded the goal.
 * @param {Object} matchDetails - Contains current match state information including pitch dimensions
 * and other relevant details.
 * @returns {void} - Updates the matchDetails object to reflect the new setup post-goal but does not
 * return any value.
 */
function setGoalScored(scoringTeam, conceedingTeam, matchDetails) {
  // Clear ball possession from both teams
  removeBall(scoringTeam);
  removeBall(conceedingTeam);

  // Retrieve the pitch dimensions from match details
  const [matchWidth, matchHeight] = matchDetails.pitchSize;

  // Reset player positions to standard starting positions post-goal
  setVariables.resetPlayerPositions(scoringTeam);
  setVariables.resetPlayerPositions(conceedingTeam);

  // Randomly select the player from the conceding team who will start with the ball at the center
  let playerWithBall = common.getRandomNumber(9, 10);
  let waitingPlayer;
  if (playerWithBall === 9) {
    waitingPlayer = 10;
  } else {
    waitingPlayer = 9;
  }

  // Set the ball position to the center of the pitch
  matchDetails.ball.position = [matchWidth / 2, matchHeight / 2, 0];
  // Update the starting position of the player with the ball
  conceedingTeam.players[playerWithBall].startPOS =
    matchDetails.ball.position.slice(0, 2);
  // Mark the player as having the ball
  conceedingTeam.players[playerWithBall].hasBall = true;

  // Reset interactions with the ball as a new play starts
  matchDetails.ball.ballOverIterations = [];
  matchDetails.ball.withPlayer = true;
  matchDetails.ball.Player = conceedingTeam.players[playerWithBall].name;
  matchDetails.ball.withTeam = conceedingTeam.name;

  // Set the position of another player who is waiting nearby
  let tempPosition = [
    matchDetails.ball.position[0] + 20,
    matchDetails.ball.position[1],
  ];
  conceedingTeam.players[waitingPlayer].startPOS = tempPosition;

  // Define the intents of the teams post-goal: conceding team attacks, scoring team defends
  conceedingTeam.intent = `attack`;
  scoringTeam.intent = `defend`;
}

/**
 * Ensures that the ball remains within the boundaries of the soccer field. If the ball crosses the
 * boundary lines, it determines the appropriate restart event (e.g., throw-in, corner, goal kick)
 * based on the side of the field and the last team in possession. The function modifies match details
 * to reflect the new game state with updated ball and player positions suitable for the restart of
 * play.
 *
 * @param {Array} ballIntended - The intended next position of the ball.
 * @param {number} kickersSide - The side of the field from which the last kick was made, typically representing the kicker's team side.
 * @param {Object} matchDetails - Contains current match state information including pitch dimensions and other relevant details.
 * @returns {Array} - The new position of the ball after ensuring it remains within play or after setting up a game restart event.
 */
function keepInBoundaries(ballIntended, kickersSide, matchDetails) {
  // Access global match detail variables
  let { kickOffTeam, secondTeam } = matchDetails;
  const [matchWidth, matchHeight] = matchDetails.pitchSize;

  // Variable to store the new intended position of the ball
  let newBallIntended;

  // Check if the ball is out of the playing field's boundaries
  if (
    ballIntended[0] < 0 ||
    ballIntended[0] > matchWidth ||
    ballIntended[1] < 0 ||
    ballIntended[1] > matchHeight
  ) {
    // Handle the ball going out on the left side
    if (ballIntended[0] < 0) {
      // Determine which team takes the throw-in based on the side of the field
      if (kickersSide > matchHeight / 2) {
        newBallIntended = setThrowIn(
          kickOffTeam,
          secondTeam,
          `left`,
          ballIntended[1],
          matchDetails
        );
        matchDetails.iterationLog.push(`Throw in to - ${kickOffTeam.name}`);
        return newBallIntended;
      }
      newBallIntended = setThrowIn(
        secondTeam,
        kickOffTeam,
        `left`,
        ballIntended[1],
        matchDetails
      );
      matchDetails.iterationLog.push(`Throw in to - ${secondTeam.name}`);
      return newBallIntended;
    }
    // Handle the ball going out on the right side
    else if (ballIntended[0] > matchWidth) {
      if (kickersSide > matchHeight / 2) {
        newBallIntended = setThrowIn(
          kickOffTeam,
          secondTeam,
          `right`,
          ballIntended[1],
          matchDetails
        );
        matchDetails.iterationLog.push(`Throw in to - ${kickOffTeam.name}`);
        return newBallIntended;
      }
      newBallIntended = setThrowIn(
        secondTeam,
        kickOffTeam,
        `right`,
        ballIntended[1],
        matchDetails
      );
      matchDetails.iterationLog.push(`Throw in to - ${secondTeam.name}`);
      return newBallIntended;
    }
    // Handle the ball going out on the bottom side
    if (ballIntended[1] < 0) {
      let side = ballIntended[0] > matchWidth / 2 ? `right` : `left`;
      if (kickersSide > matchHeight / 2) {
        newBallIntended = setGoalKick(kickOffTeam, secondTeam, matchDetails);
        matchDetails.iterationLog.push(`Goal Kick to - ${kickOffTeam.name}`);
        return newBallIntended;
      }
      newBallIntended = setCornerPositions(
        secondTeam,
        kickOffTeam,
        side,
        matchDetails
      );
      matchDetails.iterationLog.push(`Corner to - ${secondTeam.name}`);
      matchDetails.secondTeamStatistics.corners++;
      return newBallIntended;
    }
    // Handle the ball going out on the top side
    else if (ballIntended[1] > matchHeight) {
      let side = ballIntended[0] > matchWidth / 2 ? `right` : `left`;
      if (kickersSide > matchHeight / 2) {
        newBallIntended = setCornerPositions(
          kickOffTeam,
          secondTeam,
          side,
          matchDetails
        );
        matchDetails.iterationLog.push(`Corner to - ${kickOffTeam.name}`);
        matchDetails.kickOffTeamStatistics.corners++;
        return newBallIntended;
      }
      newBallIntended = setGoalKick(secondTeam, kickOffTeam, matchDetails);
      matchDetails.iterationLog.push(`Goal Kick to - ${secondTeam.name}`);
      return newBallIntended;
    }
  }
  // Ensure the ball stays within central boundaries and handle the nearest player interactions
  else if (
    common.isBetween(ballIntended[0], matchWidth / 2 - 20, matchWidth / 2 + 20)
  ) {
    let playerInformationA = closestPlayerToPosition(
      `none`,
      kickOffTeam,
      ballIntended
    );
    let playerInformationB = closestPlayerToPosition(
      `none`,
      secondTeam,
      ballIntended
    );
    let teamAPlayer = playerInformationA.thePlayer;
    let teamBPlayer = playerInformationB.thePlayer;
    if (
      teamAPlayer &&
      teamAPlayer[0] === ballIntended[0] &&
      teamAPlayer[1] === ballIntended[1]
    ) {
      teamAPlayer.hasBall = true;
      matchDetails.ball.ballOverIterations = [];
      matchDetails.ball.Player = teamAPlayer.name;
      matchDetails.ball.withPlayer = true;
      matchDetails.ball.withTeam = kickOffTeam.name;
    } else if (
      teamBPlayer &&
      teamBPlayer[0] === ballIntended[0] &&
      teamBPlayer[1] === ballIntended[1]
    ) {
      teamBPlayer.hasBall = true;
      matchDetails.ball.ballOverIterations = [];
      matchDetails.ball.Player = teamBPlayer.name;
      matchDetails.ball.withPlayer = true;
      matchDetails.ball.withTeam = secondTeam.name;
    } else if (ballIntended[1] > matchHeight) {
      newBallIntended = [matchWidth / 2, matchHeight / 2];
      if (matchDetails.half === 1) {
        setGoalScored(kickOffTeam, secondTeam, matchDetails);
        matchDetails.kickOffTeamStatistics.goals++;
        return newBallIntended;
      }
      setGoalScored(secondTeam, kickOffTeam, matchDetails);
      matchDetails.secondTeamStatistics.goals++;
      return newBallIntended;
    } else if (ballIntended[1] < 0) {
      newBallIntended = [matchWidth / 2, matchHeight / 2];
      if (matchDetails.half === 1) {
        setGoalScored(secondTeam, kickOffTeam, matchDetails);
        matchDetails.secondTeamStatistics.goals++;
        return newBallIntended;
      }
      setGoalScored(kickOffTeam, secondTeam, matchDetails);
      matchDetails.kickOffTeamStatistics.goals++;
      return newBallIntended;
    }
    return ballIntended;
  }
  // Return the intended ball position if it's within the field
  return ballIntended;
}

/**
 * Updates the positions of players in a team based on a specified offset. The function modifies
 * each player's start position by adding an extra offset to the y-coordinate. Goalkeepers maintain
 * their original positions. This function ensures that player positions remain within the boundaries
 * of the pitch. It also sets a relative position used for movement calculations or further positional
 * adjustments.
 *
 * @param {Object} matchDetails - Contains current match state information including pitch dimensions and other relevant details.
 * @param {Object} team - The team whose player positions are being updated. This object includes an array of player objects.
 * @param {number} extra - The offset to be added to each player's y-coordinate, adjusting their position on the pitch.
 */
function setPlayerPositions(matchDetails, team, extra) {
  // Iterate through each player in the team
  for (const thisPlayer of team.players) {
    // Check if the player is a goalkeeper
    if (thisPlayer.position == `GK`) {
      // Goalkeepers maintain their original starting position
      thisPlayer.startPOS = thisPlayer.originPOS.map((x) => x);
    } else {
      // Other players' positions are modified based on the extra offset
      let tempArray = thisPlayer.originPOS;
      thisPlayer.startPOS = tempArray.map((x) => x);
      // Calculate new position by adding extra to the y-coordinate
      const playerPos = parseInt(thisPlayer.startPOS[1], 10) + extra;
      // Ensure the new position is within the field boundaries
      if (common.isBetween(playerPos, -1, matchDetails.pitchSize[1] + 1)) {
        thisPlayer.startPOS[1] = playerPos;
      }
      // Set the relative position for movement calculations or further adjustments
      thisPlayer.relativePOS = tempArray.map((x) => x);
      thisPlayer.relativePOS[1] = playerPos;
    }
  }
}

/**
 * This function calculates the differences between the original and current positions of an entity
 * (e.g., a player). It provides an array containing the x and y positional differences needed to
 * return the entity to its original formation. If an error occurs during the calculation, the
 * function captures and rethrows the error with a descriptive message.
 *
 * @param {Array} origin - The original x and y coordinates of the entity.
 * @param {Array} current - The current x and y coordinates of the entity.
 * @returns {Array} - An array containing the x and y differences needed to return to the original
 * position.
 */
function formationCheck(origin, current) {
  try {
    // Calculate the difference in the x-coordinate between original and current position
    let xPos = origin[0] - current[0];
    // Calculate the difference in the y-coordinate between original and current position
    let yPos = origin[1] - current[1];

    // Initialize an array to hold the x and y position differences
    let moveToFormation = [];
    // Add x and y differences to the array
    moveToFormation.push(xPos);
    moveToFormation.push(yPos);

    // Return the array containing positional differences
    return moveToFormation;
  } catch (error) {
    // If an error occurs, throw a new error with the caught error message
    throw new Error(error);
  }
}

/**
 * This function manages the transition of a soccer team to the opposite side of the pitch. It checks
 * for the validity of the team object and ensures each player has an original position set. The
 * function inverts the y-coordinate of each player's original position to switch their field side.
 * Additionally, it adjusts each player's fitness: if it's below a certain threshold, it increases;
 * otherwise, it caps it at the maximum. It updates both the original and starting positions of
 * players to reflect the new side of the field and adjusts their fitness levels accordingly.
 *
 * @param {Object} team - The team object containing player information.
 * @param {Object} matchDetails - The object containing details of the match, including the pitch
 * size.
 * @returns {Object} - The team object with updated player positions and fitness levels.
 * @throws {Error} - Throws an error if the team object is not provided or if any player lacks an
 * original position.
 */
function switchSide(team, matchDetails) {
  // Check if the team object is provided; if not, throw an error
  if (!team) {
    throw new Error(`No Team supplied to switch side`);
  }

  // Iterate through each player in the team
  for (const thisPlayer of team.players) {
    // Ensure each player has an original position set; if not, throw an error
    if (!thisPlayer.originPOS) {
      throw new Error(`Each player must have an origin position set`);
    }

    // Invert the y-coordinate of the player's original position to switch sides
    thisPlayer.originPOS[1] =
      matchDetails.pitchSize[1] - thisPlayer.originPOS[1];

    // Create a temporary array from the modified original position
    let tempArray = thisPlayer.originPOS;

    // Set the starting position to the modified original position for gameplay consistency
    thisPlayer.startPOS = tempArray.map((x) => x);

    // Set the relative position for potential future calculations or adjustments
    thisPlayer.relativePOS = tempArray.map((x) => x);

    // Adjust player fitness: if below a threshold, increase it, otherwise set to maximum
    if (thisPlayer.fitness < 51) {
      // Increase fitness by 50 points and round to 2 decimal places
      thisPlayer.fitness = common.round(thisPlayer.fitness + 50, 2);
    } else {
      // If fitness is already high, set it to the maximum possible value
      thisPlayer.fitness = 100;
    }
  }

  // Return the team object with updated player positions and fitness levels
  return team;
}

/**
 * This function adjusts the relative positions of soccer players within a team based on a specific
 * player's positional change from the original to the current state. It calculates the vertical
 * difference between the player's current and original positions and applies this difference across
 * the team, modifying each player's relative position accordingly. The function considers the team's
 * strategic intent (e.g., attacking or defending) and individual player roles (excluding goalkeepers
 * and certain defenders from forward position adjustments). Proximity to opponents is also
 * considered for strategic adjustments. The function ensures that positional changes remain within
 * tactical boundaries and are consistent with the team's gameplay strategy.
 *
 * @param {Object} player - The player whose position change triggers the adjustment.
 * @param {Object} team - The team to which the player belongs, containing all players whose
 * positions might be adjusted.
 * @param {Object} matchDetails - Contextual details about the match, including pitch size and the
 * opposing team, which may affect strategic positioning.
 */
function setRelativePosition(player, team, matchDetails) {
  // Calculate the vertical difference between the player's current and original positions
  let tempArray =
    parseInt(player.startPOS[1], 10) - parseInt(player.originPOS[1], 10);

  // Access the teams involved in the match from the match details
  let { kickOffTeam, secondTeam } = matchDetails;

  // Loop through all players in the team to adjust their positions
  for (const thisPlayer of team.players) {
    // Store the original position of the player
    let originArray = thisPlayer.originPOS;
    // Calculate the new potential position by adding the difference to the original y-coordinate
    let possibleMove = parseInt(thisPlayer.originPOS[1], 10) + tempArray;

    // If the current player is the player whose position changed, set the relative position directly
    if (thisPlayer.name === player.name) {
      thisPlayer.relativePOS = thisPlayer.startPOS.map((x) => x);
    }
    // Adjust positions based on the team's current intent (e.g., attacking or defending)
    else if (team.intent === `attack`) {
      // Exclude goalkeepers and center-backs from forward position adjustments
      if (thisPlayer.position !== `GK` && thisPlayer.position !== `CB`) {
        // Adjust players differently based on their field side
        if (thisPlayer.originPOS[1] > matchDetails.pitchSize[1] / 2) {
          // Ensure players do not move past their original positions if it doesn't make tactical sense
          if (possibleMove > thisPlayer.originPOS[1]) {
            thisPlayer.relativePOS = originArray.map((x) => x);
          } else {
            thisPlayer.relativePOS[1] = possibleMove;
          }
        } else if (possibleMove < thisPlayer.originPOS[1]) {
          thisPlayer.relativePOS = originArray.map((x) => x);
        } else {
          thisPlayer.relativePOS[1] = possibleMove;
        }
      } else {
        // Keep defensive players' positions stable
        thisPlayer.relativePOS = originArray.map((x) => x);
      }
    } else {
      // If the team is not attacking, compare player positions to the closest opponent to adjust strategy
      let opp = team.name === kickOffTeam.name ? secondTeam : kickOffTeam;
      let oppPlyr = closestPlayerToPosition(player, opp, player.originPOS);
      let xDiff = Math.abs(player.originPOS[0] - oppPlyr.proxPos[0]);
      let yDiff = Math.abs(player.originPOS[1] - oppPlyr.proxPos[1]);
      let xClose = common.isBetween(xDiff, 0, 16);
      let yClose = common.isBetween(yDiff, 0, 16);
      // Adjust player positions based on proximity to key opposition players
      if (xClose && yClose) {
        let tempArray = oppPlyr.thePlayer.startPOS;
        thisPlayer.relativePOS = tempArray.map((x) => x);
      } else {
        thisPlayer.relativePOS = originArray.map((x) => x);
      }
    }
  }
}

/**
 * This function iterates through all players in a soccer team and sets their 'hasBall' status to
 * false, indicating that none of the players are currently in possession of the ball. This is
 * typically used to reset the state of the ball possession when a game event changes the flow of
 * play, such as after a goal is scored or a new play starts.
 *
 * @param {Object} thisTeam - The team object containing an array of player objects.
 */
function removeBall(thisTeam) {
  // Iterate over each player in the team and set their 'hasBall' status to false
  thisTeam.players[0].hasBall = false;
  thisTeam.players[1].hasBall = false;
  thisTeam.players[2].hasBall = false;
  thisTeam.players[3].hasBall = false;
  thisTeam.players[4].hasBall = false;
  thisTeam.players[5].hasBall = false;
  thisTeam.players[6].hasBall = false;
  thisTeam.players[7].hasBall = false;
  thisTeam.players[8].hasBall = false;
  thisTeam.players[9].hasBall = false;
  thisTeam.players[10].hasBall = false;
}

module.exports = {
  setCornerPositions,
  setPlayerPositions,
  keepInBoundaries,
  setThrowIn,
  setGoalKick,
  closestPlayerToPosition,
  setSetpiece,
  setPenalty,
  setFreekick,
  setGoalScored,
  formationCheck,
  switchSide,
  setRelativePosition,
};
