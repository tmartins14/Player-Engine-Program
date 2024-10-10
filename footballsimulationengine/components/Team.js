/*
 * Team Class
 * ----------
 * Represents a football team controlled by an AI.
 * The team makes strategic decisions for all players based on the game context.
 */

const Player = require("./Player");

class Team {
  constructor(name, formation, teamSide) {
    this.name = name;
    this.goalPosition = null; // Will be set based on field side
    this.formation = formation; // E.g., '4-4-2', '4-3-3'
    this.players = []; // Array to hold Player objects
    this.teamSide = teamSide;
    this.tactics = {
      // Default team tactics (values between 0 and 100)
      defensiveDepth: 50,
      pressingIntensity: 50,
      widthOfPlay: 50,
      tempo: 50,
      passingStyle: 50,
      buildUpPlayDirection: 50,
      buildUpPlaySpeed: 50,
      compactness: 50,
      lineOfConfrontation: 50,
      crossingFrequency: 50,
      counterPressing: 50,
      defensiveTransition: 50,
      setPieceFocus: 50,
      attackingCorners: 50,
      defendingCorners: 50,
      timeManagement: 50,
      aggressiveness: 50,
      defensiveWidth: 50,
      attackingDepth: 50,
      markingPreference: 50,
    };
  }

  // Add a player to the team
  addPlayer(player) {
    this.players.push(player);
    player.setTeam(this);
  }

  // Remove a player from the team
  removePlayer(player) {
    this.players = this.players.filter((p) => p !== player);
    player.setTeam(null);
  }

  // Get the team's players
  getPlayers() {
    return this.players;
  }

  // Get opponent players
  getOpponentPlayers(opponentTeam) {
    return opponentTeam.players;
  }

  // Get formation positions for initializing players
  getFormationPositions() {
    // Define formations with relative positions
    const formations = {
      "4-4-2": {
        GK: { x: 0, y: -0.45 },
        RB: { x: -0.3, y: -0.3 },
        CB1: { x: -0.1, y: -0.3 },
        CB2: { x: 0.1, y: -0.3 },
        LB: { x: 0.3, y: -0.3 },
        RM: { x: -0.3, y: -0.2 },
        CM1: { x: -0.1, y: -0.2 },
        CM2: { x: 0.1, y: -0.2 },
        LM: { x: 0.3, y: -0.2 },
        ST1: { x: -0.1, y: -0.1 },
        ST2: { x: 0.1, y: -0.1 },
      },
      "4-3-3": {
        GK: { x: 0, y: -0.45 },
        RB: { x: -0.3, y: -0.3 },
        CB1: { x: -0.1, y: -0.3 },
        CB2: { x: 0.1, y: -0.3 },
        LB: { x: 0.3, y: -0.3 },
        CM: { x: 0, y: -0.05 },
        RM: { x: -0.2, y: -0.05 },
        LM: { x: 0.2, y: -0.05 },
        RW: { x: -0.2, y: 0.2 },
        ST: { x: 0, y: 0.2 },
        LW: { x: 0.2, y: 0.2 },
      },
      // Add more formations as needed
    };

    let positions = formations[this.formation] || {};

    return positions;
  }

  // Set initial positions for players based on formation
  setFormationPositions(field, isAwayTeam, isKickingOff) {
    const formationPositions = this.getFormationPositions();

    // Iterate over each player to set their position
    this.players.forEach((player, index) => {
      const positionKey = player.position;
      const relativePosition = formationPositions[positionKey];

      if (isKickingOff && index === this.players.length - 1) {
        // Set the last two players (typically forwards) to (0,0) if kicking off
        relativePosition.x = 0;
        relativePosition.y = 0;
        player.hasBall = true;
      }

      if (isKickingOff && index === this.players.length - 2) {
        // Set the last two players (typically forwards) to (0,0) if kicking off
        relativePosition.x = 0.05;
        relativePosition.y = 0;
      }

      if (relativePosition) {
        let absolutePosition = {
          x: relativePosition.x * field.width,
          y: relativePosition.y * field.length,
        };

        if (isAwayTeam) {
          // Flip coordinates for the away team
          absolutePosition.x = -absolutePosition.x;
          absolutePosition.y = -absolutePosition.y;
        }

        player.setPosition(absolutePosition);
        player.formationPosition = absolutePosition;
      } else {
        console.error(
          `Unknown position for player ${player.name}: ${positionKey}`
        );
      }
    });
  }

  // Set team tactics
  setTactics(newTactics) {
    this.tactics = { ...this.tactics, ...newTactics };
    this.applyTactics();
  }

  // Apply tactics to players
  applyTactics() {
    // Apply team tactics to players
    this.players.forEach((player) => {
      player.updateTeamTactics(this.tactics);
    });
  }

  // Select a style of play and set tactics accordingly
  selectStyleOfPlay(style) {
    // Define styles of play and set tactics accordingly
    switch (style) {
      case "tiki-taka":
        this.setTactics({
          defensiveDepth: 60,
          pressingIntensity: 70,
          widthOfPlay: 40,
          tempo: 70,
          passingStyle: 80,
          buildUpPlayDirection: 70,
          compactness: 80,
          lineOfConfrontation: 70,
          crossingFrequency: 30,
          counterPressing: 60,
          defensiveTransition: 60,
          setPieceFocus: 40,
          attackingCorners: 50,
          defendingCorners: 60,
          timeManagement: 40,
          aggressiveness: 50,
          defensiveWidth: 70,
          attackingDepth: 60,
        });
        break;
      // Add more styles as needed
      default:
        console.error(`Unknown style of play: ${style}`);
    }
  }

  // Decide actions for each player based on the game context
  decideTeamActions(ball, opponentTeam, gameContext) {
    const actions = {};

    // Analyze game context and decide on overall strategy
    const hasPossession = ball.carrier && ball.carrier.teamId === this.name;

    // For each player, decide their action
    this.players.forEach((player) => {
      if (player.injured) {
        actions[player.name] = { type: "hold" };
        return;
      }

      // Generate possible actions
      const possibleActions = this.generatePossibleActions(
        player,
        hasPossession,
        ball,
        opponentTeam,
        gameContext
      );

      // Evaluate and score each action
      const scoredActions = possibleActions.map((action) => {
        const score = this.evaluateAction(
          player,
          action,
          ball,
          opponentTeam,
          gameContext
        );
        return { action, score };
      });

      // Select the action with the highest score
      const bestAction = scoredActions.reduce((best, current) =>
        current.score > best.score ? current : best
      ).action;

      // Assign the best action to the player
      actions[player.name] = bestAction;
    });

    // Execute actions
    this.executeActions(actions, ball);
  }

  // Generate possible actions for a player
  generatePossibleActions(
    player,
    hasPossession,
    ball,
    opponentTeam,
    gameContext
  ) {
    const actions = [];

    if (hasPossession) {
      if (ball.carrier === player) {
        // Ball carrier possible actions
        actions.push({ type: "shoot" });
        this.players.forEach((teammate) => {
          if (
            teammate.currentPosition !== player.currentPosition &&
            !teammate.injured
          ) {
            actions.push({ type: "pass", targetPlayer: teammate });
          }
        });
        // Dribble towards opponent's goal
        const dribbleTarget = {
          x: player.currentPosition.x,
          y:
            player.teamSide === "home"
              ? player.currentPosition.y + 10
              : player.currentPosition.y - 10,
        };
        actions.push({ type: "dribble", targetPosition: dribbleTarget });
      } else {
        // Off-the-ball movement for teammates
        const supportPosition = this.getSupportPosition(player, ball);
        actions.push({ type: "move", targetPosition: supportPosition });
      }
    } else {
      // Defending actions
      const defensivePosition = this.getDefensivePosition(player, ball);
      actions.push({ type: "move", targetPosition: defensivePosition });

      const nearestOpponent = this.findNearestOpponent(player, opponentTeam);
      if (nearestOpponent) {
        actions.push({ type: "mark", targetOpponent: nearestOpponent });
      }
      // Optionally, decide to press the ball
      actions.push({ type: "press", targetPosition: ball.position });
    }

    return actions;
  }

  // Evaluate and score a possible action
  evaluateAction(player, action, ball, opponentTeam, gameContext) {
    let score = 0;

    switch (action.type) {
      case "shoot":
        score += this.evaluateShootingOpportunity(player, ball, gameContext);
        break;
      case "pass":
        score += this.evaluatePassingOpportunity(
          player,
          action.targetPlayer,
          opponentTeam
        );
        break;
      case "dribble":
        score += this.evaluateDribblingOpportunity(
          player,
          action.targetPosition,
          opponentTeam
        );
        break;
      case "move":
        score += this.evaluatePositioning(
          player,
          action.targetPosition,
          gameContext
        );
        break;
      case "mark":
        score += this.evaluateMarkingOpportunity(player, action.targetOpponent);
        break;
      case "press":
        score += this.evaluatePressingOpportunity(
          player,
          action.targetPosition,
          opponentTeam
        );
        break;
      default:
        break;
    }

    return score;
  }

  // Execute actions assigned to players
  executeActions(actions, ball) {
    this.players.forEach((player) => {
      const action = actions[player.name];
      if (action) {
        player.performAction(action, ball);
      }
    });
  }

  // Evaluation methods

  evaluateShootingOpportunity(player, ball, gameContext) {
    const opponentGoal = player.getOpponentGoalPosition();
    const distanceToGoal = this.calculateDistance(
      player.currentPosition,
      opponentGoal
    );
    const shootingSkill = player.stats.shooting;

    let score = 0;

    // Favor shooting if close to goal and has good shooting skill
    if (distanceToGoal < 30) {
      score += 100 - distanceToGoal + shootingSkill;
    }

    // Consider game context
    if (gameContext.fieldZone === "attackingThird") {
      score += 10;
    }

    return score;
  }

  evaluatePassingOpportunity(player, targetPlayer, opponentTeam) {
    const passingSkill = player.stats.passing;
    const distance = this.calculateDistance(
      player.currentPosition,
      targetPlayer.currentPosition
    );
    const opponentsInPath = this.countOpponentsInPath(
      player,
      targetPlayer,
      opponentTeam
    );

    let score = passingSkill - distance - opponentsInPath * 10;

    // Encourage forward passes
    if (
      (player.teamSide === "home" &&
        targetPlayer.currentPosition.y > player.currentPosition.y) ||
      (player.teamSide === "away" &&
        targetPlayer.currentPosition.y < player.currentPosition.y)
    ) {
      score += 10;
    }

    return score;
  }

  evaluateDribblingOpportunity(player, targetPosition, opponentTeam) {
    const dribblingSkill = player.stats.dribbling;
    const distance = this.calculateDistance(
      player.currentPosition,
      targetPosition
    );
    const opponentsNearby = this.countOpponentsNearby(player, opponentTeam);

    let score = dribblingSkill - opponentsNearby * 15 - distance;

    return score;
  }

  evaluatePositioning(player, targetPosition, gameContext) {
    // Evaluate positioning based on team tactics and game context
    let score = 50; // Base score

    // Adjust score based on distance to target position
    const distance = this.calculateDistance(
      player.currentPosition,
      targetPosition
    );
    score -= distance * 0.5;

    // Encourage positioning in attacking areas if pushing for a goal
    if (
      gameContext.isLateGame &&
      gameContext.goalDifference < 0 &&
      gameContext.fieldZone !== "defensiveThird"
    ) {
      score += 10;
    }

    return score;
  }

  evaluateMarkingOpportunity(player, targetOpponent) {
    const defendingSkill = player.stats.defending;
    const distance = this.calculateDistance(
      player.currentPosition,
      targetOpponent.currentPosition
    );

    let score = defendingSkill - distance;

    return score;
  }

  evaluatePressingOpportunity(player, targetPosition, opponentTeam) {
    const pressingIntensity = this.tactics.pressingIntensity;
    const distance = this.calculateDistance(
      player.currentPosition,
      targetPosition
    );

    let score = pressingIntensity - distance;

    return score;
  }

  // Helper methods

  calculateDistance(pos1, pos2) {
    return Math.sqrt((pos2.x - pos1.x) ** 2 + (pos2.y - pos1.y) ** 2);
  }

  countOpponentsInPath(player, targetPlayer, opponentTeam) {
    // Simplified method to count opponents between player and targetPlayer
    const pathStart = player.currentPosition;
    const pathEnd = targetPlayer.currentPosition;

    let count = 0;
    opponentTeam.players.forEach((opponent) => {
      if (
        this.isPointOnLineSegment(opponent.currentPosition, pathStart, pathEnd)
      ) {
        count += 1;
      }
    });

    return count;
  }

  isPointOnLineSegment(point, lineStart, lineEnd, tolerance = 5) {
    // Check if the point is close to the line segment
    const d1 = this.calculateDistance(lineStart, point);
    const d2 = this.calculateDistance(point, lineEnd);
    const lineLength = this.calculateDistance(lineStart, lineEnd);

    return Math.abs(d1 + d2 - lineLength) < tolerance;
  }

  countOpponentsNearby(player, opponentTeam) {
    // Count opponents within a certain radius
    const radius = 10;
    return opponentTeam.players.filter((opponent) => {
      const distance = this.calculateDistance(
        player.currentPosition,
        opponent.currentPosition
      );
      return distance < radius;
    }).length;
  }

  getSupportPosition(player, ball) {
    // Return a position to support the ball carrier
    const offset = 10;
    return {
      x: ball.position.x + (Math.random() * offset - offset / 2),
      y: ball.position.y + (player.teamSide === "home" ? -offset : offset),
    };
  }

  getDefensivePosition(player, ball) {
    // Return a defensive position based on ball position and formation
    const defensiveLine = this.tactics.defensiveDepth;

    let targetY =
      player.teamSide === "home"
        ? -this.field.length / 2 +
          (defensiveLine / 100) * (this.field.length / 2)
        : this.field.length / 2 -
          (defensiveLine / 100) * (this.field.length / 2);

    return {
      x: player.formationPosition.x,
      y: targetY,
    };
  }

  findNearestOpponent(player, opponentTeam) {
    // Find the nearest opponent to the player
    let nearestOpponent = null;
    let shortestDistance = Infinity;

    opponentTeam.players.forEach((opponent) => {
      const distance = this.calculateDistance(
        player.currentPosition,
        opponent.currentPosition
      );
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestOpponent = opponent;
      }
    });

    return nearestOpponent;
  }

  // Set piece decision-making
  decideSetPiece(playerTakingSetPiece, ball, opponentTeam, setPieceType, side) {
    // Implement logic for different set pieces
    switch (setPieceType) {
      case "throwIn":
        // Decide on a teammate to throw to
        const targetPlayer = this.findBestThrowInOption(playerTakingSetPiece);
        playerTakingSetPiece.performAction(
          { type: "pass", targetPlayer },
          ball
        );
        break;
      case "goalKick":
        // Decide whether to play short or long
        const playShort = this.tactics.buildUpPlayDirection < 50;
        if (playShort) {
          const defender = this.players.find((p) =>
            ["CB1", "CB2", "LB", "RB"].includes(p.position)
          );
          playerTakingSetPiece.performAction(
            { type: "pass", targetPlayer: defender },
            ball
          );
        } else {
          // Kick long towards a forward
          const forward = this.players.find((p) =>
            ["ST", "ST1", "ST2"].includes(p.position)
          );
          playerTakingSetPiece.performAction(
            { type: "pass", targetPlayer: forward },
            ball
          );
        }
        break;
      case "cornerKick":
        // Decide on a target in the box
        const bestHeader = this.players.reduce((best, player) => {
          const heading = player.stats.heading || 50;
          return heading > (best.stats.heading || 50) ? player : best;
        }, this.players[0]);
        playerTakingSetPiece.performAction(
          { type: "pass", targetPlayer: bestHeader },
          ball
        );
        break;
      default:
        console.error(`Unknown set piece type: ${setPieceType}`);
    }
  }

  findBestThrowInOption(player) {
    // Simplified logic to find the nearest teammate
    let nearestTeammate = null;
    let shortestDistance = Infinity;

    this.players.forEach((teammate) => {
      if (teammate !== player && !teammate.injured) {
        const distance = this.calculateDistance(
          player.currentPosition,
          teammate.currentPosition
        );
        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestTeammate = teammate;
        }
      }
    });

    return nearestTeammate;
  }

  // Choose corner taker based on side
  chooseCornerTaker(side) {
    let cornerTaker = null;

    if (side === "left") {
      cornerTaker = this.players.find((player) => player.roles.leftCornerTaker);
    } else {
      cornerTaker = this.players.find(
        (player) => player.roles.rightCornerTaker
      );
    }

    // If no assigned corner taker, pick a player with good passing
    if (!cornerTaker) {
      cornerTaker = this.players.reduce((best, player) => {
        return player.stats.passing > best.stats.passing ? player : best;
      }, this.players[0]);
    }

    return cornerTaker;
  }
}

module.exports = Team;
