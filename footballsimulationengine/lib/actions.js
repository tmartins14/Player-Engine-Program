const common = require("./common");
const setPositions = require("./setPositions");

/**
 * Selects an action from a list of possible actions based on their assigned probabilities.
 * Each action's chance of being selected is proportional to the number of points it has,
 * which are represented in the list by repeated occurrences. If no actions are available,
 * it defaults to a "wait" action.
 * @param {Array} possibleActions - An array of objects, each containing an 'name' and 'points' indicating
 *                                  the weight of the action.
 * @returns {String} The name of the selected action or "wait" if no actions are provided.
 */
function selectAction(possibleActions) {
  let goodActions = [];
  for (const thisAction of possibleActions) {
    let tempArray = Array(thisAction.points).fill(thisAction.name);
    goodActions = goodActions.concat(tempArray);
  }
  if (goodActions[0] == null) {
    return "wait";
  }
  return goodActions[common.getRandomNumber(0, goodActions.length - 1)];
}

/**
 * Determines possible actions for a player based on their position, proximity to other players, and
 * the state of the ball in a soccer match. It evaluates conditions such as whether the player has the ball,
 * the player's proximity to the ball, their position on the field, and nearby teammates and opponents.
 * Based on these factors, it assigns weights to different actions like shooting, passing, or tackling,
 * which are then used to populate an array of possible actions with their respective weights.
 *
 * @param {Object} player - The player for whom to determine possible actions.
 * @param {Object} team - The team of the player.
 * @param {Object} opposition - The opposing team.
 * @param {number} ballX - The x-coordinate of the ball.
 * @param {number} ballY - The y-coordinate of the ball.
 * @param {Object} matchDetails - Object containing details about the match, such as pitch dimensions.
 * @returns {Array} An array of objects, each representing a possible action with its name and weighted points.
 */
function findPossActions(player, team, opposition, ballX, ballY, matchDetails) {
  let possibleActions = [
    {
      name: "shoot",
      points: 0,
    },
    {
      name: "throughBall",
      points: 0,
    },
    {
      name: "pass",
      points: 0,
    },
    {
      name: "cross",
      points: 0,
    },
    {
      name: "tackle",
      points: 0,
    },
    {
      name: "intercept",
      points: 0,
    },
    {
      name: "slide",
      points: 0,
    },
    {
      name: "run",
      points: 0,
    },
    {
      name: "sprint",
      points: 0,
    },
    {
      name: "cleared",
      points: 0,
    },
    {
      name: "boot",
      points: 0,
    },
  ];
  let playerInformation = setPositions.closestPlayerToPosition(
    player,
    opposition,
    player.startPOS
  );
  let ownPlayerInformation = setPositions.closestPlayerToPosition(
    player,
    team,
    player.startPOS
  );
  let playerProximity = [
    Math.abs(playerInformation.proximity[0]),
    Math.abs(playerInformation.proximity[1]),
  ];
  let tmateProximity = [
    Math.abs(ownPlayerInformation.proximity[0]),
    Math.abs(ownPlayerInformation.proximity[1]),
  ];
  let closePlayerPosition = playerInformation.thePlayer;
  const [pitchWidth, pitchHeight] = matchDetails.pitchSize;
  let { hasBall, position, startPOS, originPOS, skill } = player;
  //[0]shoot, [1]throughBall, [2]pass, [3]cross, [4]tackle, [5]intercept
  //[6]slide, [7]run, [8]sprint [9]cleared [10]boot
  let parameters = [];
  let xPos3 = common.isBetween(
    startPOS[0],
    pitchWidth / 4 - 5,
    pitchWidth - pitchWidth / 4 + 5
  );
  let yPos3 = common.isBetween(
    startPOS[1],
    pitchHeight - pitchHeight / 6 + 5,
    pitchHeight
  );
  if (hasBall === false) {
    if (position === "GK") {
      //GK without the ball
      parameters = [0, 0, 0, 0, 0, 0, 0, 60, 40, 0, 0];
    } else if (
      common.isBetween(ballX, -2, 2) &&
      common.isBetween(ballY, -2, 2)
    ) {
      //non GK close to ball
      let xPos1 = common.isBetween(
        startPOS[0],
        pitchWidth / 4 - 5,
        pitchWidth - pitchWidth / 4 + 5
      );
      let yPos1 = common.isBetween(startPOS[1], 0, pitchHeight / 6 - 5);
      if (originPOS[1] > pitchHeight / 2) {
        let yPos2 = common.isBetween(
          startPOS[0],
          pitchWidth / 4 - 5,
          pitchWidth - pitchWidth / 4 + 5
        );
        let xPos2 = common.isBetween(
          startPOS[1],
          pitchHeight - pitchHeight / 6 + 5,
          pitchHeight
        );
        if (yPos2 && xPos2) {
          if (matchDetails.ball.withPlayer === false) {
            //no other player near ball run towards it
            parameters = [0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0];
          } else {
            //opposition has ball: tackle, slide, run, sprint
            parameters = [0, 0, 0, 0, 50, 0, 10, 20, 20, 0, 0];
          }
        } else if (matchDetails.ball.withPlayer === false) {
          //no other player near ball run towards it
          parameters = [0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0];
        } else {
          //opposition has ball: tackle, slide, run, sprint
          parameters = [0, 0, 0, 0, 70, 10, 20, 0, 0, 0, 0];
        }
      } else if (xPos1 && yPos1) {
        if (matchDetails.ball.withPlayer === false) {
          //no other player near ball run towards it
          parameters = [0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0];
        } else {
          //opposition has ball: tackle, slide, run, sprint
          parameters = [0, 0, 0, 0, 40, 0, 20, 10, 30, 0, 0];
        }
      } else if (matchDetails.ball.withPlayer === false) {
        //no other player near ball run towards it
        parameters = [0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0];
      } else {
        //opposition has ball: tackle, intercept, slide
        parameters = [0, 0, 0, 0, 70, 10, 20, 0, 0, 0, 0];
      }
    } else if (
      common.isBetween(ballX, -4, 4) &&
      common.isBetween(ballY, -4, 4)
    ) {
      //non GK in close to ball limits
      let xPos1 = common.isBetween(
        startPOS[0],
        pitchWidth / 4 - 5,
        pitchWidth - pitchWidth / 4 + 5
      );
      let yPos1 = common.isBetween(startPOS[1], 0, pitchHeight / 6 - 5);
      if (originPOS[1] > pitchHeight / 2) {
        let xPosition = common.isBetween(
          startPOS[0],
          pitchWidth / 4 - 5,
          pitchWidth - pitchWidth / 4 + 5
        );
        let yPosition = common.isBetween(
          startPOS[1],
          pitchHeight - pitchHeight / 6 + 5,
          pitchHeight
        );
        if (xPosition && yPosition) {
          if (matchDetails.ball.withPlayer === false) {
            //no other player near ball run towards it
            parameters = [0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0];
          } else {
            //opposition has ball: tackle, slide, run, sprint
            parameters = [0, 0, 0, 0, 40, 0, 20, 10, 30, 0, 0];
          }
        } else if (matchDetails.ball.withPlayer === false) {
          //no other player near ball run towards it
          parameters = [0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0];
        } else {
          //opposition has ball: tackle, slide
          parameters = [0, 0, 0, 0, 50, 0, 50, 0, 0, 0, 0];
        }
      } else if (xPos1 && yPos1) {
        if (matchDetails.ball.withPlayer === false) {
          //no other player near ball run towards it
          parameters = [0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0];
        } else {
          //opposition has ball: tackle, slide, run, sprint
          parameters = [0, 0, 0, 0, 40, 0, 20, 10, 30, 0, 0];
        }
      } else if (matchDetails.ball.withPlayer === false) {
        //no other player near ball run towards it
        parameters = [0, 0, 0, 0, 0, 0, 0, 20, 80, 0, 0];
      } else {
        //opposition has ball: tackle, slide
        parameters = [0, 0, 0, 0, 50, 0, 50, 0, 0, 0, 0];
      }
    } else if (
      common.isBetween(ballX, -20, 20) &&
      common.isBetween(ballY, -20, 20)
    ) {
      if (matchDetails.ball.withPlayer === false) {
        //no other player near ball run towards it
        parameters = [0, 0, 0, 0, 0, 0, 0, 60, 40, 0, 0];
      } else {
        //opposition has ball: intercept, run, sprint
        parameters = [0, 0, 0, 0, 0, 40, 0, 30, 30, 0, 0];
      }
    } else {
      //opposition has ball: intercept, run, sprint
      parameters = [0, 0, 0, 0, 0, 10, 0, 50, 30, 0, 0];
    }
  } else if (originPOS[1] > pitchHeight / 2) {
    //bottom team player has ball
    //[0]shoot, [1]throughBall, [2]pass, [3]cross, [4]tackle, [5]intercept
    //[6]slide, [7]run, [8]sprint //[9]cleared //[10]boot
    let xPos1 = common.isBetween(
      startPOS[0],
      pitchWidth / 4 - 5,
      pitchWidth - pitchWidth / 4 + 5
    );
    let yPos1 = common.isBetween(startPOS[1], 0, pitchHeight / 6 - 5);
    if (position === "GK") {
      if (playerProximity[0] < 10 && playerProximity[1] < 25) {
        //another player close: pass, run, clear, boot
        parameters = [0, 0, 10, 0, 0, 0, 0, 10, 0, 40, 40];
      } else {
        //no player close: pass, run, clear, boot
        parameters = [0, 0, 50, 0, 0, 0, 0, 10, 0, 20, 20];
      }
    } else if (
      startPOS[1] == 0 &&
      (startPOS[0] == 0 || startPOS[0] == pitchWidth)
    ) {
      //bottom team player is on the pitch boundary at opposition end: pass, cross
      parameters = [0, 0, 20, 80, 0, 0, 0, 0, 0, 0, 0];
    } else if (xPos1 && yPos1) {
      //bottom team player is near opposition goal
      let xPosition = common.isBetween(
        startPOS[0],
        pitchWidth / 3 - 5,
        pitchWidth - pitchWidth / 3 + 5
      );
      let yPosition = common.isBetween(startPOS[1], 0, pitchHeight / 12 - 5);
      if (xPosition && yPosition) {
        //bottom team player is in the box
        if (playerProximity[0] < 6 && playerProximity[1] < 6) {
          //opposition close
          let closePlyX = common.isBetween(
            closePlayerPosition[0],
            startPOS[0] - 4,
            startPOS[0] + 4
          );
          if (closePlyX && closePlayerPosition[1] < startPOS[1]) {
            //opposition ahead
            if (
              common.isBetween(tmateProximity[0], -10, 10) &&
              common.isBetween(tmateProximity[1], -10, 10)
            ) {
              //opposition ahead, teammate close: shoot, pass, run
              parameters = [20, 0, 70, 0, 0, 0, 0, 10, 0, 0, 0];
            } else if (common.isBetween(startPOS[0], 0, skill.shooting / 2)) {
              //opposition, no teammate close, in close shooting distance: shoot
              parameters = [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            } else if (common.isBetween(startPOS[0], 0, skill.shooting)) {
              //opposition, no teammate close, in shooting distance: shoot, run
              parameters = [70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0];
            } else {
              //opposition, no teammate close, out of shooting distance
              parameters = [20, 0, 0, 0, 0, 0, 0, 40, 20, 0, 0];
            }
          } else if (
            common.isBetween(tmateProximity[0], -10, 10) &&
            common.isBetween(tmateProximity[1], -4, 10)
          ) {
            //clear on goal: shoot
            if (common.isBetween(startPOS[0], 0, skill.shooting / 2)) {
              //teammate close, in close shooting distance: shoot, pass
              parameters = [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0];
            } else if (common.isBetween(startPOS[0], 0, skill.shooting)) {
              //teammate close, in shooting distance: shoot, run
              parameters = [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0];
            } else {
              //teammate close, out of shooting distance
              parameters = [20, 0, 30, 0, 0, 0, 0, 30, 20, 0, 0];
            }
          } else if (common.isBetween(startPOS[0], 0, skill.shooting / 2)) {
            //clear on goal, teammate close, in close shooting distance: shoot, pass
            parameters = [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0];
          } else if (common.isBetween(startPOS[0], 0, skill.shooting)) {
            //clear on goal, teammate close, in shooting distance: shoot, run
            parameters = [70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0];
          } else {
            //clear on goal, out of shooting distance
            parameters = [20, 0, 0, 0, 0, 0, 0, 50, 30, 0, 0];
          }
        } else if (
          common.isBetween(tmateProximity[0], -10, 10) &&
          common.isBetween(tmateProximity[1], -4, 10)
        ) {
          if (common.isBetween(startPOS[0], 0, skill.shooting / 2)) {
            //alone, teammate close, in close shooting distance: shoot, pass
            parameters = [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0];
          } else if (common.isBetween(startPOS[0], 0, skill.shooting)) {
            //alone, teammate close, in shooting distance: shoot, run
            parameters = [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0];
          } else {
            //alone, teammate close, out of shooting distance
            parameters = [20, 0, 30, 0, 0, 0, 0, 30, 20, 0, 0];
          }
        } else if (common.isBetween(startPOS[0], 0, skill.shooting / 2)) {
          //alone, in close shooting distance: shoot, pass
          parameters = [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        } else if (common.isBetween(startPOS[0], 0, skill.shooting)) {
          //alone, in shooting distance: shoot, run
          parameters = [60, 0, 0, 0, 0, 0, 0, 40, 0, 0, 0];
        } else {
          //alone, out of shooting distance
          parameters = [30, 0, 0, 0, 0, 0, 0, 40, 30, 0, 0];
        }
      } else if (playerProximity[0] < 6 && playerProximity[1] < 6) {
        //bottom team player at edges of pitch, opposition close: shoot, pass, run
        parameters = [10, 0, 70, 0, 0, 0, 0, 20, 0, 0, 0];
      } else {
        //bottom team player at edges of pitch, nobody nearby: shoot, pass, cross, run
        parameters = [50, 0, 20, 20, 0, 0, 0, 10, 0, 0, 0];
      }
    } else if (
      common.isBetween(startPOS[1], pitchHeight / 6 - 5, pitchHeight / 3)
    ) {
      //bottom team player is in the rest of the of the upper third of the opposition side
      if (playerProximity[0] < 10 && playerProximity[1] < 10) {
        //opposition close: shoot, throughball, pass, cross, run
        parameters = [30, 20, 20, 10, 0, 0, 0, 20, 0, 0, 0];
      } else {
        //no opposition close: shoot, throughball, pass, run
        parameters = [70, 10, 10, 0, 0, 0, 0, 10, 0, 0, 0];
      }
    } else if (
      common.isBetween(startPOS[1], pitchHeight / 3, 2 * (pitchHeight / 3))
    ) {
      //bottom team player middle of the pitch
      if (playerProximity[0] < 10 && playerProximity[1] < 10) {
        //opposition close: throughball, pass, cross, run, boot
        parameters = [0, 20, 30, 20, 0, 0, 0, 20, 0, 0, 10];
      } else if (skill.shooting > 85) {
        //no opposition close and good shooter: shoot, throughball, pass, run
        parameters = [60, 10, 10, 0, 0, 0, 0, 20, 0, 0, 0];
      } else if (position === "LM" || position === "CM" || position === "RM") {
        //no opp. close, not good shooting, midfielder: throughball, pass, cross, run sprint
        parameters = [0, 10, 10, 10, 0, 0, 0, 30, 40, 0, 0];
      } else if (position === "ST") {
        //no opp. close, not good shooting, stiker: run, sprint
        parameters = [0, 0, 0, 0, 0, 0, 0, 50, 50, 0, 0];
      } else {
        //no opp. close, not good shooting, other: shoot, throughball, pass, cross, run, sprint, boot
        parameters = [10, 10, 10, 10, 0, 0, 0, 30, 20, 0, 10];
      }
    } else if (playerProximity[0] < 10 && playerProximity[1] < 10) {
      //bottom team player, own third of pitch
      //opposition close: run, clear, boot
      parameters = [0, 0, 0, 0, 0, 0, 0, 10, 0, 70, 20];
    } else if (position === "LM" || position === "CM" || position === "RM") {
      //no opposition close & midfielder: pass, run, sprint
      parameters = [0, 0, 30, 0, 0, 0, 0, 30, 40, 0, 0];
    } else if (position === "ST") {
      //no opposition close & striker: run, sprint
      parameters = [0, 0, 0, 0, 0, 0, 0, 50, 50, 0, 0];
    } else {
      //no opposition close & defender: pass, run, clear, boot
      parameters = [0, 0, 40, 0, 0, 0, 0, 30, 0, 20, 10];
    }
  } else if (position === "GK") {
    //bottom team goalie
    if (playerProximity[0] < 10 && playerProximity[1] < 25) {
      //opposition close: pass, run, clear, boot
      parameters = [0, 0, 10, 0, 0, 0, 0, 10, 0, 40, 40];
    } else {
      //opposition not close: pass, run, clear, boot
      parameters = [0, 0, 50, 0, 0, 0, 0, 10, 0, 20, 20];
    }
  } else if (
    startPOS[1] == pitchHeight &&
    (startPOS[0] == 0 || startPOS[0] == pitchWidth)
  ) {
    //bottom team player on own pitch edge: pass, cross
    parameters = [0, 0, 20, 80, 0, 0, 0, 0, 0, 0, 0];
  } else if (xPos3 && yPos3) {
    //top team player has ball
    //[0]shoot, [1]throughBall, [2]pass, [3]cross, [4]tackle, [5]intercept
    //[6]slide, [7]run, [8]sprint //[9]cleared //[10]boot
    let xPosition = common.isBetween(
      startPOS[0],
      pitchWidth / 3 - 5,
      pitchWidth - pitchWidth / 3 + 5
    );
    let yPosition = common.isBetween(
      startPOS[1],
      pitchHeight - pitchHeight / 12 + 5,
      pitchHeight
    );
    if (xPosition && yPosition) {
      //top team player, in opposition box
      if (playerProximity[0] < 6 && playerProximity[1] < 6) {
        //opposition close
        if (closePlayerPosition[1] > startPOS[1]) {
          //opposition player is in front of player
          if (
            common.isBetween(tmateProximity[0], -10, 10) &&
            common.isBetween(tmateProximity[1], -10, 10)
          ) {
            //opposition ahead, teammate close: shoot, pass, run
            parameters = [20, 0, 70, 0, 0, 0, 0, 10, 0, 0, 0];
          } else if (
            common.isBetween(
              startPOS[0],
              pitchHeight - skill.shooting / 2,
              pitchHeight
            )
          ) {
            //opposition, no teammate close, in close shooting distance: shoot
            parameters = [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          } else if (
            common.isBetween(
              startPOS[0],
              pitchHeight - skill.shooting,
              pitchHeight
            )
          ) {
            //opposition, no teammate close, in shooting distance: shoot, run
            parameters = [70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0];
          } else {
            //opposition, no teammate close, out of shooting distance
            parameters = [20, 0, 0, 0, 0, 0, 0, 40, 20, 0, 0];
          }
        } else if (
          common.isBetween(tmateProximity[0], -10, 10) &&
          common.isBetween(tmateProximity[1], -4, 10)
        ) {
          //clear on goal: shoot
          if (
            common.isBetween(
              startPOS[0],
              pitchHeight - skill.shooting / 2,
              pitchHeight
            )
          ) {
            //teammate close, in close shooting distance: shoot, pass
            parameters = [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0];
          } else if (
            common.isBetween(
              startPOS[0],
              pitchHeight - skill.shooting,
              pitchHeight
            )
          ) {
            //teammate close, in shooting distance: shoot, run
            parameters = [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0];
          } else {
            //teammate close, out of shooting distance
            parameters = [20, 0, 30, 0, 0, 0, 0, 30, 20, 0, 0];
          }
        } else if (
          common.isBetween(
            startPOS[0],
            pitchHeight - skill.shooting / 2,
            pitchHeight
          )
        ) {
          //clear on goal, teammate close, in close shooting distance: shoot, pass
          parameters = [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0];
        } else if (
          common.isBetween(
            startPOS[0],
            pitchHeight,
            pitchHeight - skill.shooting
          )
        ) {
          //clear on goal, teammate close, in shooting distance: shoot, run
          parameters = [70, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0];
        } else {
          //clear on goal, out of shooting distance
          parameters = [20, 0, 0, 0, 0, 0, 0, 50, 30, 0, 0];
        }
      } else if (
        common.isBetween(tmateProximity[0], -10, 10) &&
        common.isBetween(tmateProximity[1], -4, 10)
      ) {
        if (common.isBetween(startPOS[0], 0, skill.shooting / 2)) {
          //alone, teammate close, in close shooting distance: shoot, pass
          parameters = [90, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0];
        } else if (common.isBetween(startPOS[0], 0, skill.shooting)) {
          //alone, teammate close, in shooting distance: shoot, run
          parameters = [50, 0, 20, 0, 0, 0, 0, 30, 0, 0, 0];
        } else {
          //alone, teammate close, out of shooting distance
          parameters = [20, 0, 30, 0, 0, 0, 0, 30, 20, 0, 0];
        }
      } else if (common.isBetween(startPOS[0], 0, skill.shooting / 2)) {
        //alone, in close shooting distance: shoot, pass
        parameters = [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      } else if (common.isBetween(startPOS[0], 0, skill.shooting)) {
        //alone, in shooting distance: shoot, run
        parameters = [60, 0, 0, 0, 0, 0, 0, 40, 0, 0, 0];
      } else {
        //alone, out of shooting distance
        parameters = [30, 0, 0, 0, 0, 0, 0, 40, 30, 0, 0];
      }
    } else if (playerProximity[0] < 6 && playerProximity[1] < 6) {
      //opposition player close, edges of box: shoot, pass, run
      parameters = [10, 0, 70, 0, 0, 0, 0, 20, 0, 0, 0];
    } else {
      //no opposition player close, edges of box: shoot, pass, run
      parameters = [70, 0, 20, 0, 0, 0, 0, 10, 0, 0, 0];
    }
  } else if (
    common.isBetween(
      startPOS[1],
      pitchHeight - pitchHeight / 3,
      pitchHeight - pitchHeight / 6 + 5
    )
  ) {
    //top team player in lower upper third
    if (playerProximity[0] < 10 && playerProximity[1] < 10) {
      //opposition player close: shoot, throughball, pass, cross, run
      parameters = [30, 20, 20, 10, 0, 0, 0, 20, 0, 0, 0];
    } else {
      //no opposition player close: shoot, throughball, pass, run
      parameters = [70, 10, 10, 0, 0, 0, 0, 10, 0, 0, 0];
    }
  } else if (
    common.isBetween(
      startPOS[1],
      pitchHeight / 3,
      pitchHeight - pitchHeight / 3
    )
  ) {
    //top player in middle third of pitch
    if (playerProximity[0] < 10 && playerProximity[1] < 10) {
      //opposition player close: throughball, pass, cross, run, boot
      parameters = [0, 20, 30, 20, 0, 0, 20, 0, 0, 0, 10];
    } else if (skill.shooting > 85) {
      //no opposition close and good shooter: shoot, throughball, pass, run
      parameters = [60, 10, 10, 0, 0, 0, 20, 0, 0, 0, 0];
    } else if (position === "LM" || position === "CM" || position === "RM") {
      //no opp. close, not good shooting, midfielder: throughball, pass, cross, run, sprint
      parameters = [0, 10, 10, 10, 0, 0, 0, 30, 40, 0, 0];
    } else if (position === "ST") {
      //no opp. close, not good shooting, stiker: run, sprint
      parameters = [0, 0, 0, 0, 0, 0, 0, 50, 50, 0, 0];
    } else {
      //no opp. close, not good shooting, other: shoot, throughball, pass, cross, run, sprint, boot
      parameters = [10, 10, 10, 10, 0, 0, 0, 30, 20, 0, 10];
    }
  } else if (playerProximity[0] < 10 && playerProximity[1] < 10) {
    //top team player, own third, opposition close: run, clear, boot
    parameters = [0, 0, 0, 0, 0, 0, 0, 10, 0, 70, 20];
  } else if (position === "LM" || position === "CM" || position === "RM") {
    //no opposition close & midfielder: pass, run, sprint
    parameters = [0, 0, 30, 0, 0, 0, 0, 30, 40, 0, 0];
  } else if (position === "ST") {
    //no opposition close & stiker: run, sprint
    parameters = [0, 0, 0, 0, 0, 0, 0, 50, 50, 0, 0];
  } else {
    //no opposition close & defender: pass, run, clear, boot
    parameters = [0, 0, 40, 0, 0, 0, 0, 30, 0, 20, 10];
  }
  return populatePossibleActions(possibleActions, ...parameters);
}

/**
 * Assigns point values to a list of possible actions for a player in a soccer game. Each action like
 * shooting, passing, or tackling is given a specific weight based on the current situation of the player,
 * such as their position on the field and proximity to the ball and opponents. This function populates
 * these actions with the assigned weights, effectively prioritizing them for decision-making processes.
 *
 * @param {Array} possibleActions - An array of action objects where each object has a name and points.
 * @param {number} a - Points for shooting.
 * @param {number} b - Points for a through ball.
 * @param {number} c - Points for passing.
 * @param {number} d - Points for crossing.
 * @param {number} e - Points for tackling.
 * @param {number} f - Points for intercepting.
 * @param {number} g - Points for sliding.
 * @param {number} h - Points for running.
 * @param {number} i - Points for sprinting.
 * @param {number} j - Points for clearing.
 * @param {number} k - Points for booting the ball.
 * @returns {Array} The updated array of possible actions, each with their respective weighted points.
 */
function populatePossibleActions(
  possibleActions,
  a,
  b,
  c,
  d,
  e,
  f,
  g,
  h,
  i,
  j,
  k
) {
  //a-shoot, b-throughBall, c-pass, d-cross, e-tackle, f-intercept
  //g-slide, h-run, i-sprint j-cleared k-boot
  possibleActions[0].points = a;
  possibleActions[1].points = b;
  possibleActions[2].points = c;
  possibleActions[3].points = d;
  possibleActions[4].points = e;
  possibleActions[5].points = f;
  possibleActions[6].points = g;
  possibleActions[7].points = h;
  possibleActions[8].points = i;
  possibleActions[9].points = j;
  possibleActions[10].points = k;
  return possibleActions;
}

/**
 * Simulates the outcome of a tackle attempt in a soccer game. It evaluates the tackle based on the tackling
 * and strength skills of the player making the tackle and the agility and strength of the player possessing
 * the ball. The function checks for fouls and potential injuries during the tackle, updates game statistics,
 * and modifies the game state depending on whether the tackle was successful or not.
 *
 * @param {object} player - The player attempting the tackle.
 * @param {object} team - The team of the player attempting the tackle.
 * @param {object} opposition - The opposing team.
 * @param {object} matchDetails - Object containing details of the match and current game state.
 * @returns {boolean} foul - True if a foul occurred during the tackle, false otherwise.
 */
function resolveTackle(player, team, opposition, matchDetails) {
  const [, pitchHeight] = matchDetails.pitchSize;
  let foul = false;
  matchDetails.iterationLog.push(`Tackle attempted by: ${player.name}`);
  for (const thatPlayer of opposition.players) {
    if (matchDetails.ball.Player === thatPlayer.name) {
      let tackleScore =
        (parseInt(player.skill.tackling, 10) +
          parseInt(player.skill.strength, 10)) /
        2;
      tackleScore += common.getRandomNumber(-5, 5);
      let retentionScore =
        (parseInt(thatPlayer.skill.agility, 10) +
          parseInt(thatPlayer.skill.strength, 10)) /
        2;
      retentionScore += common.getRandomNumber(-5, 5);
      if (wasFoul(10, 18) === true) {
        matchDetails.iterationLog.push("Foul against: ", thatPlayer.name);
        if (team.name === matchDetails.kickOffTeam.name) {
          matchDetails.kickOffTeamStatistics.fouls++;
        } else {
          matchDetails.secondTeamStatistics.fouls++;
        }
        foul = true;
      } else if (tackleScore > retentionScore) {
        matchDetails.iterationLog.push("Successful tackle by: ", player.name);
        if (common.isInjured(14000) === true) {
          thatPlayer.injured = true;
          matchDetails.iterationLog.push(`Player Injured - ${thatPlayer.name}`);
        }
        if (common.isInjured(15000) === true) {
          player.injured = true;
          matchDetails.iterationLog.push(`Player Injured - ${thatPlayer.name}`);
        }
        player.hasBall = true;
        let tempArray = player.startPOS;
        matchDetails.ball.position = tempArray.map((x) => x);
        matchDetails.ball.Player = player.name;
        matchDetails.ball.withPlayer = true;
        matchDetails.ball.withTeam = team.name;
        team.intent = "attack";
        opposition.intent = "defend";
        if (player.originPOS[1] > pitchHeight / 2) {
          player.startPOS[1]--;
          matchDetails.ball.position[1]--;
          thatPlayer.startPOS[1]++;
        } else {
          player.startPOS[1]++;
          matchDetails.ball.position[1]++;
          thatPlayer.startPOS[1]--;
        }
      } else {
        matchDetails.iterationLog.push("Failed tackle by: ", player.name);
        if (common.isInjured(15000) === true) {
          thatPlayer.injured = true;
          matchDetails.iterationLog.push(`Player Injured - ${thatPlayer.name}`);
        }
        if (common.isInjured(14000) === true) {
          player.injured = true;
          matchDetails.iterationLog.push(`Player Injured - ${thatPlayer.name}`);
        }
        if (thatPlayer.originPOS[1] > pitchHeight / 2) {
          thatPlayer.startPOS[1]--;
          matchDetails.ball.position[1]--;
          player.startPOS[1]++;
        } else {
          thatPlayer.startPOS[1]++;
          matchDetails.ball.position[1]++;
          player.startPOS[1]--;
        }
      }
    }
  }
  return foul;
}

/**
 * Handles the mechanics of a slide tackle attempt in a soccer game simulation. This function assesses
 * the success of a slide tackle based on the player's tackling and strength against the ball holder's
 * agility and strength. It considers the probability of fouling, updates game stats, checks for injuries,
 * and adjusts player and ball positions accordingly.
 *
 * @param {object} player - The player performing the slide tackle.
 * @param {object} team - The team of the player performing the tackle.
 * @param {object} opposition - The team of the player possessing the ball.
 * @param {object} matchDetails - Contains detailed information about the current match state.
 * @returns {boolean} foul - Indicates whether the tackle resulted in a foul.
 */
function resolveSlide(player, team, opposition, matchDetails) {
  const [, pitchHeight] = matchDetails.pitchSize;
  let foul = false;
  matchDetails.iterationLog.push(`Slide tackle attempted by: ${player.name}`);
  for (const thatPlayer of opposition.players) {
    if (matchDetails.ball.Player === thatPlayer.name) {
      let tackleScore =
        (parseInt(player.skill.tackling, 10) +
          parseInt(player.skill.strength, 10)) /
        2;
      tackleScore += common.getRandomNumber(-5, 5);
      let retentionScore =
        (parseInt(thatPlayer.skill.agility, 10) +
          parseInt(thatPlayer.skill.strength, 10)) /
        2;
      retentionScore += common.getRandomNumber(-5, 5);
      if (wasFoul(11, 20) === true) {
        matchDetails.iterationLog.push(`Foul against: ${thatPlayer.name}`);
        if (team.name === matchDetails.kickOffTeam.name) {
          matchDetails.kickOffTeamStatistics.fouls++;
        } else {
          matchDetails.secondTeamStatistics.fouls++;
        }
        foul = true;
      } else if (tackleScore > retentionScore) {
        matchDetails.iterationLog.push("Successful tackle by: ", player.name);
        if (common.isInjured(14000) === true) {
          thatPlayer.injured = true;
          matchDetails.iterationLog.push(`Player Injured - ${thatPlayer.name}`);
        }
        if (common.isInjured(15000) === true) {
          player.injured = true;
          matchDetails.iterationLog.push(`Player Injured - ${thatPlayer.name}`);
        }
        player.hasBall = true;
        let tempArray = player.startPOS;
        matchDetails.ball.position = tempArray.map((x) => x);
        matchDetails.ball.Player = player.name;
        matchDetails.ball.withPlayer = true;
        matchDetails.ball.withTeam = team.name;
        team.intent = "attack";
        opposition.intent = "defend";
        if (player.originPOS[1] > pitchHeight / 2) {
          player.startPOS[1] += -3;
          matchDetails.ball.position[1] += -3;
          thatPlayer.startPOS[1]++;
        } else {
          player.startPOS[1] += 3;
          matchDetails.ball.position[1] += 3;
          thatPlayer.startPOS[1] += -3;
        }
      } else {
        matchDetails.iterationLog.push("Failed tackle by: ", player.name);
        if (common.isInjured(15000) === true) {
          thatPlayer.injured = true;
          matchDetails.iterationLog.push(`Player Injured - ${thatPlayer.name}`);
        }
        if (common.isInjured(14000) === true) {
          player.injured = true;
          matchDetails.iterationLog.push(`Player Injured - ${thatPlayer.name}`);
        }
        if (thatPlayer.originPOS[1] > pitchHeight / 2) {
          thatPlayer.startPOS[1] += -3;
          matchDetails.ball.position[1] += -3;
          player.startPOS[1] += 3;
        } else {
          thatPlayer.startPOS[1] += 3;
          matchDetails.ball.position[1] += 3;
          player.startPOS[1] += -3;
        }
      }
    }
  }
  return foul;
}

/**
 * Determines if a soccer game action results in a foul based on a random chance.
 * The function generates a random number and checks if it falls within a specified range,
 * representing a probability of fouling during a particular action.
 *
 * @param {number} x - The upper limit for generating a random number, indicating the range of randomness.
 * @param {number} y - The threshold within the random range up to which a foul is considered to have occurred.
 * @returns {boolean} - Returns true if a foul occurred, false otherwise.
 */
function wasFoul(x, y) {
  let foul = common.getRandomNumber(0, x);
  if (common.isBetween(foul, 0, y / 2 - 1)) {
    return true;
  }
  return false;
}

/**
 * Generates a random number between 0 and 100 to represent the intensity of a foul in a soccer game.
 * This function provides a randomized intensity level that could be used to determine the severity of
 * consequences following a foul, such as the harshness of a referee's decision or the potential for player injury.
 *
 * @returns {number} - A random integer between 0 and 100, representing the intensity of the foul.
 */
function foulIntensity() {
  return common.getRandomNumber(0, 100);
}

module.exports = {
  selectAction,
  findPossActions,
  populatePossibleActions,
  resolveTackle,
  resolveSlide,
  wasFoul,
  foulIntensity,
};
