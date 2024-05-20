const common = require(`./common`);

/**
 * This function resets the starting and relative positions of each player on a soccer team to their
 * original positions. It is used primarily to reposition players to their default locations on the
 * field during gameplay resets, such as after a goal, at the start of a new half, or during set-piece
 * setups.
 *
 * @param {Object} team - The team object that contains an array of players. Each player object has
 * 'originPOS', 'startPOS', and 'relativePOS' properties representing their original, current
 * starting, and relative positions on the pitch, respectively.
 */
function resetPlayerPositions(team) {
  team.players.forEach((player) => {
    player.startPOS = player.originPOS.slice();
    player.relativePOS = player.originPOS.slice();
  });
}

/**
 * This function initializes or resets game-related variables for each player in a team at the start
 * of a game or after a significant game event. It ensures that each player's starting position is set
 * as their original position and resets their game state, including actions, offside status,
 * possession of the ball, and any accumulated cards. It also sets the team's general intent to 'none',
 * indicating no specific strategic direction initially.
 *
 * @param {Object|string} team - The team object or a string representation of it that contains an
 * array of players. If a string is provided, it is parsed into an object.
 * @returns {Object} - The modified team object with reset player variables and team intent.
 */
function setGameVariables(team) {
  if (typeof team != `object`) team = JSON.parse(team);
  team.players.forEach((player) => {
    player.originPOS = player.startPOS.slice();
    player.relativePOS = player.startPOS.slice();
    player.action = `none`;
    player.offside = false;
    player.hasBall = false;
    player.cards = {
      yellow: 0,
      red: 0,
    };
  });
  team.intent = `none`;
  return team;
}

/**
 * This function decides which player from a given team will kick off at the start of a game or after
 * a goal. It randomly selects either player 9 or 10 to take the kickoff, sets them as the player with
 * the ball, and defines the team's intent as 'attack'. It updates match details to reflect that this
 * player now has possession of the ball at the kickoff position. It also positions another player
 * close by to assist in kickoff. The function ensures the player's positional attributes are updated
 * to match the kickoff scenario.
 *
 * @param {Object|string} team1 - The team object or a string representation of it. If a string is
 * provided, it is parsed into an object.
 * @param {Object} matchDetails - An object containing details about the match, including the current
 * ball position.
 * @returns {Object} - The updated team object after deciding the kickoff player and setting initial
 * positions.
 */
function koDecider(team1, matchDetails) {
  if (typeof team1 != `object`) team1 = JSON.parse(team1);
  const playerWithBall = common.getRandomNumber(9, 10);
  matchDetails.ball.withPlayer = true;
  matchDetails.ball.Player = team1.players[playerWithBall].name;
  matchDetails.ball.withTeam = team1.name;
  team1.intent = `attack`;
  team1.players[playerWithBall].startPOS = matchDetails.ball.position.map(
    (x) => x
  );
  team1.players[playerWithBall].relativePOS = matchDetails.ball.position.map(
    (x) => x
  );
  team1.players[playerWithBall].startPOS.pop();
  team1.players[playerWithBall].relativePOS.pop();
  team1.players[playerWithBall].hasBall = true;
  matchDetails.ball.ballOverIterations = [];
  let waitingPlayer = playerWithBall == 9 ? 10 : 9;
  team1.players[waitingPlayer].startPOS = [
    matchDetails.ball.position[0] + 20,
    matchDetails.ball.position[1],
  ];
  team1.players[waitingPlayer].relativePOS = [
    matchDetails.ball.position[0] + 20,
    matchDetails.ball.position[1],
  ];
  return team1;
}

/**
 * Initializes and populates the match details for a soccer game using the provided team and pitch
 * information. This function sets up the match environment including the definition of teams, the
 * pitch size, the initial ball position, and initializes statistical tracking for both teams. It sets
 * the ball in the center of the pitch to start, pointing south, ready for kickoff. All statistics for
 * the teams (like goals, shots, and fouls) are initialized to zero.
 *
 * @param {Object} team1 - The object representing the first team.
 * @param {Object} team2 - The object representing the second team.
 * @param {Object} pitchDetails - Contains details of the pitch such as width and height.
 * @returns {Object} - A detailed object containing all initialized values and settings for the match.
 */
function populateMatchDetails(team1, team2, pitchDetails) {
  return {
    kickOffTeam: team1,
    secondTeam: team2,
    pitchSize: [pitchDetails.pitchWidth, pitchDetails.pitchHeight],
    ball: {
      position: [pitchDetails.pitchWidth / 2, pitchDetails.pitchHeight / 2, 0],
      withPlayer: true,
      Player: ``,
      withTeam: ``,
      direction: `south`,
      ballOverIterations: [],
    },
    half: 1,
    kickOffTeamStatistics: {
      goals: 0,
      shots: 0,
      corners: 0,
      freekicks: 0,
      penalties: 0,
      fouls: 0,
    },
    secondTeamStatistics: {
      goals: 0,
      shots: 0,
      corners: 0,
      freekicks: 0,
      penalties: 0,
      fouls: 0,
    },
    iterationLog: [],
  };
}

module.exports = {
  resetPlayerPositions,
  setGameVariables,
  koDecider,
  populateMatchDetails,
};
