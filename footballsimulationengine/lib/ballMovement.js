const common = require(`./common`);
const setPositions = require(`./setPositions`);

/**
 * Processes pending ball movements in a soccer simulation, handling the trajectory of the ball
 * after kicks and resolving its final position. If the ball has further movements stored,
 * it calculates the next step in its trajectory and checks for goal conditions.
 * @param {Object} matchDetails - Contains current details of the match including the state of the ball and teams.
 * @returns {Object} Updated match details with the new position of the ball and any game events logged.
 */
function moveBall(matchDetails) {
  // Check if there are pending ball movements to process
  if (
    matchDetails.ball.ballOverIterations === undefined ||
    matchDetails.ball.ballOverIterations.length == 0
  ) {
    return matchDetails; // No movement pending, return match details unchanged
  }

  let { ball } = matchDetails; // Destructure ball from match details
  let bPosition = ball.position; // Current ball position
  let { kickOffTeam, secondTeam } = matchDetails; // Destructure teams from match details
  let ballPos = ball.ballOverIterations[0]; // Get the next position from the ball movement iterations
  const power = ballPos[2]; // Extract the power used for the ball's movement

  ballPos.splice(); // This seems intended to clear or manipulate the ballPos array but lacks parameters

  // Create a placeholder player object representing the ball with maximum skills for simulation purposes
  let bPlayer = {
    name: `Ball`,
    position: `LB`,
    rating: `100`,
    skill: {
      passing: `100`,
      shooting: `100`,
      saving: `100`,
      tackling: `100`,
      agility: `100`,
      strength: `100`,
      penalty_taking: `100`,
      jumping: `100`,
    },
    originPOS: ballPos,
    startPOS: ballPos,
    injured: false,
  };

  // Resolve the ball's movement using the created ball player and movement details
  let endPos = resolveBallMovement(
    bPlayer,
    bPosition,
    ballPos,
    power,
    kickOffTeam,
    secondTeam,
    matchDetails
  );

  // Remove the first element from the ball movement iterations after processing it
  matchDetails.ball.ballOverIterations.shift();

  // Log the continued movement of the ball
  matchDetails.iterationLog.push(
    `ball still moving from previous kick: ${endPos}`
  );

  // Update the ball's position in the match details
  matchDetails.ball.position = endPos;

  // Check if the new position of the ball results in a goal
  checkGoalScored(matchDetails);

  // Return the updated match details
  return matchDetails;
}

/**
 * Handles the event when a ball is kicked by a player, determining the new direction and position of the ball based
 * on the player's position on the pitch and the inherent randomness of the kick's direction.
 * It calculates the potential new position of the ball and handles its trajectory and any resulting ball movement.
 * @param {Object} matchDetails - Contains current details of the match including teams and ball status.
 * @param {Object} player - The player who is kicking the ball.
 * @returns {Array} The final position of the ball after the kick.
 */
function ballKicked(matchDetails, player) {
  let { kickOffTeam, secondTeam } = matchDetails;
  let { position, direction } = matchDetails.ball;
  const [, pitchHeight] = matchDetails.pitchSize;
  matchDetails.iterationLog.push(`ball kicked by: ${player.name}`);
  let newPosition = [0, 0];
  let teamShootingToTop = [
    `wait`,
    `north`,
    `north`,
    `north`,
    `north`,
    `east`,
    `east`,
    `west`,
    `west`,
  ];
  teamShootingToTop.push([
    `northeast`,
    `northeast`,
    `northeast`,
    `northwest`,
    `northwest`,
    `northwest`,
  ]);
  let teamShootingToBottom = [
    `wait`,
    `south`,
    `south`,
    `south`,
    `south`,
    `east`,
    `east`,
    `west`,
    `west`,
  ];
  teamShootingToBottom.push([
    `southeast`,
    `southeast`,
    `southeast`,
    `southwest`,
    `southwest`,
    `southwest`,
  ]);
  let power = common.calculatePower(player.skill.strength);
  if (player.originPOS[1] > pitchHeight / 2) {
    direction =
      teamShootingToTop[
        common.getRandomNumber(0, teamShootingToTop.length - 1)
      ];
    if (direction === `wait`) {
      newPosition[0] = position[0] + common.getRandomNumber(0, power / 2);
      newPosition[1] = position[1] + common.getRandomNumber(0, power / 2);
    } else if (direction === `north`) {
      newPosition[0] = position[0] + common.getRandomNumber(-20, 20);
      newPosition[1] =
        position[1] + common.getRandomNumber(-power, -(power / 2));
    } else if (direction === `east`) {
      newPosition[0] = position[0] + common.getRandomNumber(power / 2, power);
      newPosition[1] = position[1] + common.getRandomNumber(-20, 20);
    } else if (direction === `west`) {
      newPosition[0] =
        position[0] + common.getRandomNumber(-power, -(power / 2));
      newPosition[1] = position[1] + common.getRandomNumber(-20, 20);
    } else if (direction === `northeast`) {
      newPosition[0] = position[0] + common.getRandomNumber(0, power / 2);
      newPosition[1] =
        position[1] + common.getRandomNumber(-power, -(power / 2));
    } else if (direction === `northwest`) {
      newPosition[0] = position[0] + common.getRandomNumber(-(power / 2), 0);
      newPosition[1] =
        position[1] + common.getRandomNumber(-power, -(power / 2));
    }
  } else {
    direction =
      teamShootingToBottom[
        common.getRandomNumber(0, teamShootingToBottom.length - 1)
      ];
    if (direction === `wait`) {
      newPosition[0] = position[0] + common.getRandomNumber(0, power / 2);
      newPosition[1] = position[1] + common.getRandomNumber(0, power / 2);
    } else if (direction === `east`) {
      newPosition[0] = position[0] + common.getRandomNumber(power / 2, power);
      newPosition[1] = position[1] + common.getRandomNumber(-20, 20);
    } else if (direction === `west`) {
      newPosition[0] = common.getRandomNumber(position[0] - 120, position[0]);
      newPosition[1] = common.getRandomNumber(
        position[1] - 30,
        position[1] + 30
      );
    } else if (direction === `south`) {
      newPosition[0] = position[0] + common.getRandomNumber(-20, 20);
      newPosition[1] = position[1] + common.getRandomNumber(power / 2, power);
    } else if (direction === `southeast`) {
      newPosition[0] = position[0] + common.getRandomNumber(0, power / 2);
      newPosition[1] = position[1] + common.getRandomNumber(power / 2, power);
    } else if (direction === `southwest`) {
      newPosition[0] = position[0] + common.getRandomNumber(-(power / 2), 0);
      newPosition[1] = position[1] + common.getRandomNumber(power / 2, power);
    }
  }
  //Calculate ball movement over time
  const changeInX = newPosition[0] - position[0];
  const changeInY = newPosition[1] - position[1];
  let totalChange = Math.max(Math.abs(changeInX), Math.abs(changeInY));
  let movementIterations = common.round(
    totalChange / common.getRandomNumber(2, 3),
    0
  );
  if (movementIterations < 1) {
    movementIterations = 1;
  }
  let powerArray = splitNumberIntoN(power, movementIterations);
  let xArray = splitNumberIntoN(changeInX, movementIterations);
  let yArray = splitNumberIntoN(changeInY, movementIterations);
  let BOIts = mergeArrays(
    powerArray.length,
    position,
    newPosition,
    xArray,
    yArray,
    powerArray
  );
  matchDetails.ball.ballOverIterations = BOIts;
  let endPos = resolveBallMovement(
    player,
    position,
    BOIts[0],
    power,
    kickOffTeam,
    secondTeam,
    matchDetails
  );
  matchDetails.ball.ballOverIterations.shift();
  matchDetails.iterationLog.push(`resolving ball movement`);
  matchDetails.iterationLog.push(`new ball position: ${endPos}`);
  return endPos;
}

/**
 * Handles the logic when a player makes a shot towards the goal, calculating the trajectory,
 * and determining the outcome based on the player's shooting power and position.
 * It updates match statistics and checks if a goal is scored.
 * @param {Object} matchDetails - Contains current details of the match including ball position and half information.
 * @param {Object} team - The team of the player making the shot.
 * @param {Object} opp - The opposing team.
 * @param {Object} player - The player making the shot.
 * @returns {Array} The final position of the ball after the shot.
 */
function shotMade(matchDetails, team, opp, player) {
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  matchDetails.iterationLog.push(`Shot Made by: ${player.name}`);
  let shotPosition = [0, 0];
  let shotPower = common.calculatePower(player.skill.strength);
  let PlyPos = player.startPOS;
  if (common.isEven(matchDetails.half)) {
    matchDetails.kickOffTeamStatistics.shots++;
  } else if (common.isOdd(matchDetails.half)) {
    matchDetails.secondTeamStatistics.shots++;
  } else {
    throw new Error(`You cannot supply 0 as a half`);
  }
  matchDetails.iterationLog.push(`Shot On Target`);
  shotPosition[0] = common.getRandomNumber(
    pitchWidth / 2 - 50,
    pitchWidth / 2 + 50
  );
  if (player.originPOS[1] > pitchHeight / 2) {
    shotPosition[1] = PlyPos[1] - shotPower;
  } else {
    shotPosition[1] = PlyPos[1] + shotPower;
  }
  //Calculate ball movement over time
  const changeInX = shotPosition[0] - PlyPos[0];
  const changeInY = shotPosition[1] - PlyPos[1];
  let totalChange = Math.max(Math.abs(changeInX), Math.abs(changeInY));
  let movementIterations = common.round(
    totalChange / common.getRandomNumber(2, 3),
    0
  );
  if (movementIterations < 1) {
    movementIterations = 1;
  }
  let powerArray = splitNumberIntoN(shotPower, movementIterations);
  let xArray = splitNumberIntoN(changeInX, movementIterations);
  let yArray = splitNumberIntoN(changeInY, movementIterations);
  let BOIts = mergeArrays(
    powerArray.length,
    PlyPos,
    shotPosition,
    xArray,
    yArray,
    powerArray
  );
  matchDetails.ball.ballOverIterations = BOIts;
  let endPos = resolveBallMovement(
    player,
    PlyPos,
    BOIts[0],
    shotPower,
    team,
    opp,
    matchDetails
  );
  matchDetails.iterationLog.push(
    `resolving ball movement whilst making a shot`
  );
  matchDetails.ball.ballOverIterations.shift();
  matchDetails.iterationLog.push(`resolving ball movement`);
  matchDetails.iterationLog.push(`new ball position: ${endPos}`);
  checkGoalScored(matchDetails);
  return endPos;
}

/**
 * Checks if a goal has been scored based on the ball's position on the pitch.
 * It verifies whether the ball has crossed the goal line and adjusts the match statistics accordingly.
 * @param {Object} matchDetails - Contains current details of the match including ball position and half information.
 */
function checkGoalScored(matchDetails) {
  let { ball, half, secondTeam, kickOffTeam } = matchDetails; // Access relevant match details and teams
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize; // Destructure to get pitch dimensions
  const centreGoal = pitchWidth / 2; // Calculate the center of the goal
  const goalEdge = centreGoal / 3; // Define the width of the goal area around the center

  // Check if the ball is within the goal width
  const goalX = common.isBetween(
    ball.position[0],
    centreGoal - goalEdge,
    centreGoal + goalEdge
  );

  if (goalX) {
    // If the ball is within the width of the goal
    if (ball.position[1] < 1) {
      // Check if the ball is over the goal line at the top of the pitch
      if (half == 0) {
        throw new Error("cannot set half as 0"); // Ensures valid half information
      } else if (common.isOdd(half)) {
        // If it's the first or third half, goals affect teams differently
        setPositions.setGoalScored(secondTeam, kickOffTeam, matchDetails); // Set the goal scored by the second team
        matchDetails.secondTeamStatistics.goals++; // Increment goal count for the second team
      } else {
        setPositions.setGoalScored(kickOffTeam, secondTeam, matchDetails); // Set the goal scored by the kick-off team
        matchDetails.kickOffTeamStatistics.goals++; // Increment goal count for the kick-off team
      }
    } else if (ball.position[1] >= pitchHeight) {
      // Check if the ball is over the goal line at the bottom of the pitch
      if (half == 0) {
        throw new Error("cannot set half as 0"); // Ensures valid half information
      } else if (common.isOdd(half)) {
        setPositions.setGoalScored(kickOffTeam, secondTeam, matchDetails); // Set the goal scored by the kick-off team
        matchDetails.kickOffTeamStatistics.goals++; // Increment goal count for the kick-off team
      } else {
        setPositions.setGoalScored(secondTeam, kickOffTeam, matchDetails); // Set the goal scored by the second team
        matchDetails.secondTeamStatistics.goals++; // Increment goal count for the second team
      }
    }
  }
}

/**
 * Executes a through ball pass from a player to a teammate who is further down the pitch,
 * taking into account the skill of the passer and the position of potential receivers.
 * The function calculates the new position of the ball based on the player's skill and
 * potential deflections or interceptions.
 * @param {Object} matchDetails - Contains information about the match and current game state.
 * @param {Object} teammates - The team object which includes all players.
 * @param {Object} player - The player who is making the through ball pass.
 * @returns {Array} The final position of the ball after attempting the through ball.
 */
function throughBall(matchDetails, teammates, player) {
  let { kickOffTeam, secondTeam } = matchDetails;
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  let { position } = matchDetails.ball;
  let closestPlayerPosition = [0, 0];
  let playersInDistance = [];
  for (const teamPlayer of teammates.players) {
    if (teamPlayer.name != player.name) {
      let onPitchX = common.isBetween(
        teamPlayer.startPOS[0],
        -1,
        pitchWidth + 1
      );
      let onPitchY = common.isBetween(
        teamPlayer.startPOS[1],
        -1,
        pitchHeight + 1
      );
      if (onPitchX && onPitchY) {
        let playerToPlayerX = player.startPOS[0] - teamPlayer.startPOS[0];
        let playerToPlayerY = player.startPOS[1] - teamPlayer.startPOS[1];
        let proximityToBall = Math.abs(playerToPlayerX + playerToPlayerY);
        playersInDistance.push({
          position: teamPlayer.startPOS,
          proximity: proximityToBall,
          name: teamPlayer.name,
        });
      }
    }
  }
  playersInDistance.sort(function (a, b) {
    return a.proximity - b.proximity;
  });
  let targetPlayer =
    playersInDistance[common.getRandomNumber(0, playersInDistance.length - 1)];
  let [targetPlayerXPos, targetPlayerYPos] = targetPlayer.position;
  matchDetails.iterationLog.push(
    `through ball passed by: ${player.name} to: ${targetPlayer.name}`
  );
  if (player.skill.passing > common.getRandomNumber(0, 100)) {
    if (player.originPOS[1] > pitchHeight / 2) {
      closestPlayerPosition = [targetPlayerXPos, targetPlayerYPos - 10];
    } else {
      closestPlayerPosition = [targetPlayerXPos, targetPlayerYPos + 10];
    }
  } else if (player.originPOS[1] > pitchHeight / 2) {
    if (position[1] > pitchHeight - pitchHeight / 3) {
      closestPlayerPosition[0] =
        targetPlayerXPos + common.getRandomNumber(-10, 10);
      closestPlayerPosition[1] =
        targetPlayerYPos + common.getRandomNumber(-10, 10);
    } else if (
      position[1] > pitchHeight / 3 &&
      position[1] < pitchHeight - pitchHeight / 3
    ) {
      closestPlayerPosition[0] =
        targetPlayerXPos + common.getRandomNumber(-20, 20);
      closestPlayerPosition[1] =
        targetPlayerYPos + common.getRandomNumber(-50, 50);
    } else {
      closestPlayerPosition[0] =
        targetPlayerXPos + common.getRandomNumber(-30, 30);
      closestPlayerPosition[1] =
        targetPlayerYPos + common.getRandomNumber(-100, 100);
    }
  } else if (position[1] > pitchHeight - pitchHeight / 3) {
    closestPlayerPosition[0] =
      targetPlayerXPos + common.getRandomNumber(-30, 30);
    closestPlayerPosition[1] =
      targetPlayerYPos + common.getRandomNumber(-100, 100);
  } else if (
    position[1] > pitchHeight / 3 &&
    position[1] < pitchHeight - pitchHeight / 3
  ) {
    closestPlayerPosition[0] =
      targetPlayerXPos + common.getRandomNumber(-20, 20);
    closestPlayerPosition[1] =
      targetPlayerYPos + common.getRandomNumber(-50, 50);
  } else {
    closestPlayerPosition[0] =
      targetPlayerXPos + common.getRandomNumber(-10, 10);
    closestPlayerPosition[1] =
      targetPlayerYPos + common.getRandomNumber(-10, 10);
  }
  //Calculate ball movement over time
  const power = common.calculatePower(player.skill.strength);
  const changeInX = closestPlayerPosition[0] - position[0];
  const changeInY = closestPlayerPosition[1] - position[1];
  let totalChange = Math.max(Math.abs(changeInX), Math.abs(changeInY));
  let movementIterations = common.round(
    totalChange / common.getRandomNumber(2, 3),
    0
  );
  if (movementIterations < 1) {
    movementIterations = 1;
  }
  let powerArray = splitNumberIntoN(power, movementIterations);
  let xArray = splitNumberIntoN(changeInX, movementIterations);
  let yArray = splitNumberIntoN(changeInY, movementIterations);
  let BOIts = mergeArrays(
    powerArray.length,
    position,
    closestPlayerPosition,
    xArray,
    yArray,
    powerArray
  );
  matchDetails.ball.ballOverIterations = BOIts;
  let endPos = resolveBallMovement(
    player,
    position,
    BOIts[0],
    power,
    kickOffTeam,
    secondTeam,
    matchDetails
  );
  matchDetails.ball.ballOverIterations.shift();
  matchDetails.iterationLog.push(`resolving ball movement`);
  matchDetails.iterationLog.push(`new ball position: ${endPos}`);
  return endPos;
}

/**
 * Resolves the movement of the ball after a kick or pass, taking into account possible
 * interactions with players such as deflections or saves. It calculates the trajectory,
 * checks for player interceptions, and determines the final position of the ball.
 * @param {Object} player - The player who last interacted with the ball.
 * @param {Array} currentPOS - The current position [x, y, z] of the ball.
 * @param {Array} newPOS - The intended new position [x, y, z] of the ball.
 * @param {number} power - The power of the kick or pass.
 * @param {Object} team - The team of the player.
 * @param {Object} opp - The opposing team.
 * @param {Object} matchDetails - Object containing details of the match.
 * @returns {Array} The final position [x, y] of the ball after resolving its movement.
 */
function resolveBallMovement(
  player,
  currentPOS,
  newPOS,
  power,
  team,
  opp,
  matchDetails
) {
  let lineToEndPosition = common.getBallTrajectory(currentPOS, newPOS, power);
  for (const thisPos of lineToEndPosition) {
    let checkPos = [
      common.round(thisPos[0], 0),
      common.round(thisPos[1], 0),
      thisPos[2],
    ];
    let playerInfo1 = setPositions.closestPlayerToPosition(
      player,
      team,
      checkPos
    );
    let playerInfo2 = setPositions.closestPlayerToPosition(
      player,
      opp,
      checkPos
    );
    let thisPlayerProx = Math.max(
      playerInfo1.proxToBall,
      playerInfo2.proxToBall
    );
    let thisPlayer =
      thisPlayerProx == playerInfo1.proxToBall
        ? playerInfo1.thePlayer
        : playerInfo2.thePlayer;
    let thisTeam = thisPlayerProx == playerInfo1.proxToBall ? team : opp;
    let isGoalie = thisPlayer.position === "GK";
    if (thisPlayer) {
      const xPosProx = common.isBetween(
        thisPlayer.startPOS[0],
        thisPos[0] - 3,
        thisPos[0] + 3
      );
      const yPosProx = common.isBetween(
        thisPlayer.startPOS[1],
        thisPos[1] - 3,
        thisPos[1] + 3
      );
      const goaliexPosProx = common.isBetween(
        thisPlayer.startPOS[0],
        thisPos[0] - 11,
        thisPos[0] + 11
      );
      const goalieyPosProx = common.isBetween(
        thisPlayer.startPOS[1],
        thisPos[1] - 2,
        thisPos[1] + 2
      );
      if (isGoalie && goaliexPosProx && goalieyPosProx) {
        if (common.isBetween(checkPos[2], -1, thisPlayer.skill.jumping + 1)) {
          let saving = thisPlayer.skill.saving || "";
          if (saving && saving > common.getRandomNumber(0, power)) {
            matchDetails.ball.ballOverIterations = [];
            matchDetails.ball.Player = thisPlayer.name;
            matchDetails.ball.withPlayer = true;
            matchDetails.ball.withTeam = thisTeam.name;
            let tempArray = thisPos;
            matchDetails.ball.position = tempArray.map((x) => x);
            thisPlayer.position = tempArray.map((x) => x);
            matchDetails.iterationLog.push(`Ball saved`);
            return thisPos;
          }
        }
      } else if (xPosProx && yPosProx) {
        if (common.isBetween(checkPos[2], -1, thisPlayer.skill.jumping + 1)) {
          let deflectPos = thisPlayer.startPOS;
          let newPos = resolveDeflection(
            power,
            currentPOS,
            deflectPos,
            thisPlayer,
            thisTeam.name,
            matchDetails
          );
          matchDetails.iterationLog.push(`Ball deflected`);
          let sendPosition = [
            common.round(newPos[0], 2),
            common.round(newPos[1], 2),
          ];
          return sendPosition;
        }
      }
    }
  }
  let finalPosition = setPositions.keepInBoundaries(
    newPOS,
    player.originPOS[1],
    matchDetails
  );
  let sendPosition = [
    common.round(finalPosition[0], 2),
    common.round(finalPosition[1], 2),
  ];
  return sendPosition;
}

/**
 * Calculates the new position of the ball after it has been deflected by a player.
 * It factors in the original power of the ball, the distance it moved, and the direction
 * it was moving to determine its new trajectory post-deflection.
 * @param {number} power - The initial power of the ball movement.
 * @param {Array} currentPOS - The current position of the ball [x, y].
 * @param {Array} defPosition - The position [x, y] where the deflection occurred.
 * @param {Object} defPlayer - The player who deflected the ball.
 * @param {string} defTeam - The team of the player who deflected the ball.
 * @param {Object} matchDetails - Details of the match, including other match-specific data.
 * @returns {Array} The new position of the ball after deflection.
 */
function resolveDeflection(
  power,
  currentPOS,
  defPosition,
  defPlayer,
  defTeam,
  matchDetails
) {
  let { kickOffTeam, secondTeam } = matchDetails;
  let xMovement = (currentPOS[0] - defPosition[0]) ** 2;
  let yMovement = (currentPOS[1] - defPosition[1]) ** 2;
  let movementDistance = Math.sqrt(xMovement + yMovement);
  let newPower = power - movementDistance;
  let tempPosition = ["", ""];
  let { direction } = matchDetails.ball;
  if (newPower < 75) {
    defPlayer.hasBall = true;
    if (defPlayer.offside == true) {
      matchDetails.iterationLog.push(
        defPlayer.name,
        `is offside. Set piece given`
      );
      let team = defTeam.name == kickOffTeam.name ? kickOffTeam : secondTeam;
      let opposition = team.name == kickOffTeam.name ? secondTeam : kickOffTeam;
      setPositions.setSetpiece(matchDetails, team, opposition);
      return matchDetails.ball.position;
    }
    matchDetails.ball.ballOverIterations = [];
    matchDetails.ball.Player = defPlayer.name;
    matchDetails.ball.withPlayer = true;
    matchDetails.ball.withTeam = defTeam;
    let tempArray = defPlayer.startPOS;
    matchDetails.ball.position = tempArray.map((x) => x);
    return defPosition;
  }
  defPlayer.hasBall = true;
  matchDetails.ball.Player = defPlayer.name;
  matchDetails.ball.withPlayer = true;
  matchDetails.ball.withTeam = defTeam;
  if (defPlayer.offside == true) {
    matchDetails.iterationLog.push(
      defPlayer.name,
      `is offside. Set piece given`
    );
    let team = defTeam.name == kickOffTeam.name ? kickOffTeam : secondTeam;
    let opposition = team.name == kickOffTeam.name ? secondTeam : kickOffTeam;
    setPositions.setSetpiece(matchDetails, team, opposition);
    defPlayer.offside = false;
    defPlayer.hasBall = false;
    matchDetails.ball.Player = "";
    matchDetails.ball.withPlayer = false;
    matchDetails.ball.withTeam = "";
    return matchDetails.ball.position;
  }
  defPlayer.hasBall = false;
  matchDetails.ball.Player = "";
  matchDetails.ball.withPlayer = false;
  matchDetails.ball.withTeam = "";

  if (
    direction === `east` ||
    direction === `northeast` ||
    direction === `southeast`
  ) {
    if (direction === `east`) {
      tempPosition[1] = common.getRandomNumber(
        defPosition[1] - 3,
        defPosition[1] + 3
      );
    }
    tempPosition[0] = defPosition[0] - newPower / 2;
  } else if (
    direction === `west` ||
    direction === `northwest` ||
    direction === `southwest`
  ) {
    if (direction === `west`) {
      tempPosition[1] = common.getRandomNumber(
        defPosition[1] - 3,
        defPosition[1] + 3
      );
    }
    tempPosition[0] = defPosition[0] + newPower / 2;
  }
  if (
    direction === `north` ||
    direction === `northeast` ||
    direction === `northwest`
  ) {
    if (direction === `north`) {
      tempPosition[0] = common.getRandomNumber(
        defPosition[0] - 3,
        defPosition[0] + 3
      );
    }
    tempPosition[1] = defPosition[1] + newPower / 2;
  } else if (
    direction === `south` ||
    direction === `southeast` ||
    direction === `southwest`
  ) {
    if (direction === `south`) {
      tempPosition[0] = common.getRandomNumber(
        defPosition[0] - 3,
        defPosition[0] + 3
      );
    }
    tempPosition[1] = defPosition[1] - newPower / 2;
  }
  if (direction === `wait`) {
    tempPosition[0] = common.getRandomNumber(-newPower / 2, newPower / 2);
    tempPosition[1] = common.getRandomNumber(-newPower / 2, newPower / 2);
  }
  let finalPosition = setPositions.keepInBoundaries(
    tempPosition,
    defPlayer.originPOS[1],
    matchDetails
  );
  return finalPosition;
}

/**
 * Determines the direction of the ball's movement based on its current and next position.
 * This function calculates the relative movement in the X (horizontal) and Y (vertical) directions
 * and updates the ball's direction in the matchDetails object accordingly.
 * @param {Object} matchDetails - The object containing all details of the match, including current ball position.
 * @param {Array} nextPOS - The next position coordinates of the ball as an array [x, y].
 */
function getBallDirection(matchDetails, nextPOS) {
  // Retrieve the current ball position from match details
  let currentPOS = matchDetails.ball.position;

  // Calculate horizontal and vertical movements from the current position to the next position
  let movementX = currentPOS[0] - nextPOS[0];
  let movementY = currentPOS[1] - nextPOS[1];

  // Check if there's no horizontal movement
  if (movementX === 0) {
    // If there's also no vertical movement, the ball stays in place ("wait")
    if (movementY === 0) {
      matchDetails.ball.direction = `wait`;
    }
    // If the vertical movement is negative, the ball moves south
    else if (movementY < 0) {
      matchDetails.ball.direction = `south`;
    }
    // If the vertical movement is positive, the ball moves north
    else if (movementY > 0) {
      matchDetails.ball.direction = `north`;
    }
  }
  // Check if there's no vertical movement
  else if (movementY === 0) {
    // If the horizontal movement is negative, the ball moves east
    if (movementX < 0) {
      matchDetails.ball.direction = `east`;
    }
    // If the horizontal movement is positive, the ball moves west
    else if (movementX > 0) {
      matchDetails.ball.direction = `west`;
    }
  }
  // Determine diagonal directions based on the combination of horizontal and vertical movements
  else if (movementX < 0 && movementY < 0) {
    matchDetails.ball.direction = `southeast`;
  } else if (movementX > 0 && movementY > 0) {
    matchDetails.ball.direction = `northwest`;
  } else if (movementX > 0 && movementY < 0) {
    matchDetails.ball.direction = `southwest`;
  } else if (movementX < 0 && movementY > 0) {
    matchDetails.ball.direction = `northeast`;
  }
}

/**
 * Executes a ball passing action within a soccer match simulation, determining if the pass
 * is successful based on player skills and positions. The function considers player positions,
 * calculates proximity, and determines the ball's trajectory based on the passing player's skill.
 * The outcome may vary, resulting in an accurate pass, a misplaced pass, or an interception
 * based on calculated probabilities.
 * @param {Object} matchDetails - Contains all the details of the match, including ball and pitch dimensions.
 * @param {Array} teammates - Array of player objects representing the teammates of the player passing the ball.
 * @param {Object} player - The player object representing the player who is passing the ball.
 * @returns {Array} The final position of the ball after attempting the pass.
 */
function ballPassed(matchDetails, teammates, player) {
  let { kickOffTeam, secondTeam } = matchDetails;
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  const side = player.originPOS[1] > pitchHeight / 2 ? "bottom" : "top";
  let { position } = matchDetails.ball;
  let closestPlayerPosition = [0, 0];
  let playersInDistance = [];
  for (const teamPlayer of teammates.players) {
    if (teamPlayer.name != player.name) {
      let onPitchX = common.isBetween(
        teamPlayer.startPOS[0],
        -1,
        pitchWidth + 1
      );
      let onPitchY = common.isBetween(
        teamPlayer.startPOS[1],
        -1,
        pitchHeight + 1
      );
      if (onPitchX && onPitchY) {
        let playerToPlayerX = player.startPOS[0] - teamPlayer.startPOS[0];
        let playerToPlayerY = player.startPOS[1] - teamPlayer.startPOS[1];
        let proximityToBall = Math.abs(playerToPlayerX + playerToPlayerY);
        playersInDistance.push({
          position: teamPlayer.startPOS,
          proximity: proximityToBall,
          proximityToGoal: playerToPlayerY,
          name: teamPlayer.name,
        });
      }
    }
  }
  playersInDistance.sort(function (a, b) {
    return a.proximity - b.proximity;
  });
  let targetPlayer = getTargetPlayer(playersInDistance, side);
  let [targetPlayerXPos, targetPlayerYPos] = targetPlayer.position;
  if (player.skill.passing > common.getRandomNumber(0, 100)) {
    closestPlayerPosition = targetPlayer.position;
  } else if (player.originPOS[1] > pitchHeight / 2) {
    if (position[1] > pitchHeight - pitchHeight / 3) {
      closestPlayerPosition[0] = common.round(
        targetPlayerXPos + common.getRandomNumber(-10, 10),
        0
      );
      closestPlayerPosition[1] = common.round(
        targetPlayerYPos + common.getRandomNumber(-10, 10),
        0
      );
    } else if (
      position[1] > pitchHeight / 3 &&
      position[1] < pitchHeight - pitchHeight / 3
    ) {
      closestPlayerPosition[0] = common.round(
        targetPlayerXPos + common.getRandomNumber(-50, 50),
        0
      );
      closestPlayerPosition[1] = common.round(
        targetPlayerYPos + common.getRandomNumber(-50, 50),
        0
      );
    } else {
      closestPlayerPosition[0] = common.round(
        targetPlayerXPos + common.getRandomNumber(-100, 100),
        0
      );
      closestPlayerPosition[1] = common.round(
        targetPlayerYPos + common.getRandomNumber(-100, 100),
        0
      );
    }
  } else if (position[1] > pitchHeight - pitchHeight / 3) {
    closestPlayerPosition[0] = common.round(
      targetPlayerXPos + common.getRandomNumber(-100, 100),
      0
    );
    closestPlayerPosition[1] = common.round(
      targetPlayerYPos + common.getRandomNumber(-100, 100),
      0
    );
  } else if (
    position[1] > pitchHeight / 3 &&
    position[1] < pitchHeight - pitchHeight / 3
  ) {
    closestPlayerPosition[0] = common.round(
      targetPlayerXPos + common.getRandomNumber(-50, 50),
      0
    );
    closestPlayerPosition[1] = common.round(
      targetPlayerYPos + common.getRandomNumber(-50, 50),
      0
    );
  } else {
    closestPlayerPosition[0] = common.round(
      targetPlayerXPos + common.getRandomNumber(-10, 10),
      0
    );
    closestPlayerPosition[1] = common.round(
      targetPlayerYPos + common.getRandomNumber(-10, 10),
      0
    );
  }
  matchDetails.iterationLog.push(
    `ball passed by: ${player.name} to: ${targetPlayer.name}`
  );
  //Calculate ball movement over time
  const power = common.calculatePower(player.skill.strength);
  const changeInX = closestPlayerPosition[0] - position[0];
  const changeInY = closestPlayerPosition[1] - position[1];
  let totalChange = Math.max(Math.abs(changeInX), Math.abs(changeInY));
  let movementIterations = common.round(
    totalChange / common.getRandomNumber(2, 3),
    0
  );
  if (movementIterations < 1) {
    movementIterations = 1;
  }
  let powerArray = splitNumberIntoN(power, movementIterations);
  let xArray = splitNumberIntoN(changeInX, movementIterations);
  let yArray = splitNumberIntoN(changeInY, movementIterations);
  let BOIts = mergeArrays(
    powerArray.length,
    position,
    closestPlayerPosition,
    xArray,
    yArray,
    powerArray
  );
  matchDetails.ball.ballOverIterations = BOIts;
  let endPos = resolveBallMovement(
    player,
    position,
    BOIts[0],
    power,
    kickOffTeam,
    secondTeam,
    matchDetails
  );
  matchDetails.ball.ballOverIterations.shift();
  return endPos;
}

/**
 * Selects a target player for a pass based on the given side of the field and proximity to the ball.
 * The function randomizes player selection from an array of teammates and checks conditions to
 * determine the most appropriate target based on their proximity and the match's current dynamics.
 * @param {Array} playersArray - An array containing player objects with their respective positions and proximities.
 * @param {string} side - Indicates the side of the pitch ("top" or "bottom") the ball is currently on.
 * @returns {Object} Returns the chosen player object from the playersArray as the pass target.
 */
function getTargetPlayer(playersArray, side) {
  let thisRand = common.getRandomNumber(0, playersArray.length - 1);
  let thisPlayer = playersArray[thisRand];
  if (thisRand > 5) {
    thisRand = common.getRandomNumber(0, playersArray.length - 1);
  }
  if (
    side == "top" &&
    playersArray[thisRand].proximity > thisPlayer.proximity
  ) {
    thisPlayer = playersArray[thisRand];
  } else if (
    side == "bottom" &&
    playersArray[thisRand].proximity < thisPlayer.proximity
  ) {
    thisPlayer = playersArray[thisRand];
  }
  if (thisRand > 5) {
    thisRand = common.getRandomNumber(0, playersArray.length - 1);
  }
  if (
    side == "top" &&
    playersArray[thisRand].proximity > thisPlayer.proximity
  ) {
    thisPlayer = playersArray[thisRand];
  } else if (
    side == "bottom" &&
    playersArray[thisRand].proximity < thisPlayer.proximity
  ) {
    thisPlayer = playersArray[thisRand];
  }
  return thisPlayer;
}

/**
 * Handles the action of a player crossing the ball towards a targeted area of the field.
 * It calculates the intended position for the ball to land based on player's side and position on the pitch,
 * and simulates the ball's trajectory towards that point.
 * @param {Object} matchDetails - Object containing details about the match, including teams and pitch dimensions.
 * @param {Object} player - The player object who is making the cross.
 * @returns {Array} The final position of the ball after crossing.
 */
function ballCrossed(matchDetails, player) {
  let { kickOffTeam, secondTeam } = matchDetails;
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  let { position } = matchDetails.ball;
  let ballIntended = [];
  if (player.originPOS[1] > pitchHeight / 2) {
    ballIntended[1] = common.getRandomNumber(0, pitchHeight / 5);
    if (player.startPOS[0] < pitchWidth / 2) {
      ballIntended[0] = common.getRandomNumber(pitchWidth / 3, pitchWidth);
    } else {
      ballIntended[0] = common.getRandomNumber(0, pitchWidth - pitchWidth / 3);
    }
  } else {
    ballIntended[1] = common.getRandomNumber(
      pitchHeight - pitchHeight / 5,
      pitchHeight
    );
    if (player.startPOS[0] < pitchWidth / 2) {
      ballIntended[0] = common.getRandomNumber(pitchWidth / 3, pitchWidth);
    } else {
      ballIntended[0] = common.getRandomNumber(0, pitchWidth - pitchWidth / 3);
    }
  }
  matchDetails.iterationLog.push(`ball crossed by: ${player.name}`);
  //Calculate ball movement over time
  const power = common.calculatePower(player.skill.strength);
  const changeInX = ballIntended[0] - position[0];
  const changeInY = ballIntended[1] - position[1];
  let totalChange = Math.max(Math.abs(changeInX), Math.abs(changeInY));
  let movementIterations = common.round(
    totalChange / common.getRandomNumber(2, 3),
    0
  );
  if (movementIterations < 1) {
    movementIterations = 1;
  }
  let powerArray = splitNumberIntoN(power, movementIterations);
  let xArray = splitNumberIntoN(changeInX, movementIterations);
  let yArray = splitNumberIntoN(changeInY, movementIterations);
  let BOIts = mergeArrays(
    powerArray.length,
    position,
    ballIntended,
    xArray,
    yArray,
    powerArray
  );
  matchDetails.ball.ballOverIterations = BOIts;
  let endPos = resolveBallMovement(
    player,
    position,
    BOIts[0],
    power,
    kickOffTeam,
    secondTeam,
    matchDetails
  );
  matchDetails.ball.ballOverIterations.shift();
  return endPos;
}

/**
 * Splits a given number into 'n' parts with a decreasing trend and ensures each part is at least 1.
 * It is particularly useful for distributing values like power or effort over a number of iterations,
 * making each subsequent iteration slightly less impactful than the previous.
 * @param {number} number - The number to be split into parts.
 * @param {number} n - The number of parts to split the number into.
 * @returns {Array} An array containing the split parts of the number.
 */
function splitNumberIntoN(number, n) {
  const arrayN = Array.from(Array(n).keys());
  let splitNumber = [];
  for (let thisn of arrayN) {
    let nextNum = common.aTimesbDividedByC(n - thisn, number, n);
    if (nextNum === 0) {
      splitNumber.push(1);
    } else {
      splitNumber.push(common.round(nextNum, 0));
    }
  }
  return splitNumber;
}

/**
 * Merges multiple arrays representing changes in X and Y coordinates and additional attributes
 * (like power) to create a series of positions forming a trajectory of movement from an old position
 * to a new position.
 * @param {number} arrayLength - The length of the arrays being merged, representing the number of steps in the trajectory.
 * @param {Array} oldPos - The starting position as [x, y].
 * @param {Array} newPos - The final target position as [x, y].
 * @param {Array} array1 - Changes in the X direction to be applied successively.
 * @param {Array} array2 - Changes in the Y direction to be applied successively.
 * @param {Array} array3 - Additional attributes for each step (e.g., power levels).
 * @returns {Array} An array of positions forming the trajectory.
 */
function mergeArrays(arrayLength, oldPos, newPos, array1, array2, array3) {
  let tempPos = [oldPos[0], oldPos[1]];
  const arrayN = Array.from(Array(arrayLength - 1).keys());
  let newArray = [];
  for (let thisn of arrayN) {
    newArray.push([
      tempPos[0] + array1[thisn],
      tempPos[1] + array2[thisn],
      array3[thisn],
    ]);
    tempPos = [tempPos[0] + array1[thisn], tempPos[1] + array2[thisn]];
  }
  newArray.push([newPos[0], newPos[1], array3[array3.length - 1]]);
  return newArray;
}

module.exports = {
  ballKicked,
  shotMade,
  throughBall,
  resolveBallMovement,
  resolveDeflection,
  getBallDirection,
  ballPassed,
  ballCrossed,
  moveBall,
};
