/*
 * Team Class
 * ----------
 * Represents a football team controlled by an AI.
 * The team makes strategic decisions for all players based on the game context.
 */

const Player = require("./Player");
const { calculateDistance } = require("../utilities/utils");

class Team {
  constructor(name, formation, teamSide) {
    this.name = name;
    this.goalPosition = null; // Will be set based on field side
    this.formation = formation; // E.g., '4-4-2', '4-3-3'
    this.players = []; // Array to hold Player objects
    this.teamSide = teamSide; // 'home' or 'away'
    this.field = null; // Reference to the field object, to be set when initializing positions
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
      // Additional tactical parameters
      attackStyle: "balanced", // 'balanced', 'attackDownWings', etc.
      playStyle: "balanced", // 'balanced', 'dribble', etc.
      markingStyle: "zonal", // 'zonal', 'man', 'hybrid'
      pressingStyle: "balanced", // 'high', 'balanced', 'low'
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

    const positions = formations[this.formation] || {};
    return positions;
  }

  // Set initial positions for players based on formation
  setFormationPositions(field, isAwayTeam, isKickingOff) {
    this.field = field; // Set the field reference
    const formationPositions = this.getFormationPositions();

    // Iterate over each player to set their position
    this.players.forEach((player, index) => {
      const positionKey = player.position;
      const relativePosition = formationPositions[positionKey];

      if (!relativePosition) {
        console.error(
          `Unknown position for player ${player.name}: ${positionKey}`
        );
        return;
      }

      if (isKickingOff) {
        if (index === this.players.length - 1) {
          // Last player (typically forward)
          relativePosition.x = 0;
          relativePosition.y = 0;
          player.hasBall = true;
        } else if (index === this.players.length - 2) {
          // Second last player (another forward)
          relativePosition.x = 0.05;
          relativePosition.y = 0;
        }
      }

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
          attackStyle: "attackDownWings",
          playStyle: "possession",
          markingStyle: "zonal",
          pressingStyle: "high",
        });
        break;
      // Add more styles as needed
      default:
        console.error(`Unknown style of play: ${style}`);
    }
  }

  // Decide actions for each player based on the game context
  decideTeamActions(ball, opponentTeam, gameContext) {
    const actions = {}; // Map from player name to { action, player }

    // Analyze game context and decide on overall strategy
    const hasPossession = ball.carrier && ball.carrier.teamId === this.name;

    // For each player, decide their action
    this.players.forEach((player) => {
      if (player.injured) {
        actions[player.name] = { action: { type: "hold" }, player: player };
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
          gameContext,
          hasPossession
        );
        return { action, score };
      });

      // Select the action with the highest score
      const bestAction = scoredActions.reduce((best, current) =>
        current.score > best.score ? current : best
      ).action;

      // Assign the best action to the player
      actions[player.name] = { action: bestAction, player: player };
    });

    // After assigning actions, check for pass actions to assign receivePass actions
    Object.values(actions).forEach(({ action, player }) => {
      if (action.type === "pass") {
        const targetPlayer = action.targetPlayer;
        // Assign receivePass action to the target player if they don't already have a higher priority action
        if (!actions[targetPlayer.name]) {
          actions[targetPlayer.name] = {
            action: { type: "receivePass", passFrom: player },
            player: targetPlayer,
          };
        }
      }
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

        // Passing options
        this.players.forEach((teammate) => {
          if (teammate !== player && !teammate.injured) {
            // Determine pass type based on distance and positioning
            const passType = this.determinePassType(
              player,
              teammate,
              opponentTeam
            );
            actions.push({
              type: "pass",
              targetPlayer: teammate,
              passType: passType,
            });
          }
        });

        // Dribble towards opponent's goal
        const dribbleTarget = this.getDribbleTarget(player);
        actions.push({ type: "dribble", targetPosition: dribbleTarget });
      } else {
        // Off-the-ball movement for teammates
        if (ball.intendedReceiver === player && ball.isMoving) {
          // Player will be assigned a receivePass action in decideTeamActions
        } else {
          const supportPosition = this.getSupportPosition(player, ball);
          actions.push({ type: "move", targetPosition: supportPosition });
        }
      }
    } else {
      // Defending actions
      const defensivePosition = this.getAdjustedDefensivePosition(
        player,
        ball,
        opponentTeam
      );
      actions.push({ type: "move", targetPosition: defensivePosition });

      // Check if the ball carrier is within tackling range
      if (ball.carrier) {
        const distanceToBallCarrier = calculateDistance(
          player.currentPosition,
          ball.carrier.currentPosition
        );

        const tacklingRange = player.calculateTacklingRange(); // Adjusted based on field size

        if (distanceToBallCarrier <= tacklingRange) {
          actions.push({
            type: "tackle",
            targetOpponent: ball.carrier,
          });
        }

        // console.log(player.name, distanceToBallCarrier, tacklingRange);
      }

      // Determine defensive actions based on marking style
      if (this.tactics.markingStyle === "man") {
        const nearestOpponent = this.findNearestOpponent(player, opponentTeam);
        if (nearestOpponent) {
          actions.push({ type: "mark", targetOpponent: nearestOpponent });
        }
      } else if (this.tactics.markingStyle === "zonal") {
        // Zone-based defensive actions

        // Identify vulnerable zones
        const vulnerableZones = this.identifyVulnerableZones(
          ball,
          opponentTeam
        );

        // Assign player to a zone
        const assignedZone = this.assignPlayerToZone(player, vulnerableZones);

        // Add defendZone action
        actions.push({ type: "defendZone", zone: assignedZone });
      }

      // Optionally, decide to press the ball
      if (this.shouldPress(player, ball, gameContext)) {
        actions.push({ type: "press", targetPosition: ball.position });
      }
    }

    const actionTypes = actions.map((action) => action.type);
    // console.log(player.name, actionTypes);
    return actions;
  }

  // Determine the type of pass (to feet or through ball)
  determinePassType(player, targetPlayer, opponentTeam) {
    const distance = calculateDistance(
      player.currentPosition,
      targetPlayer.currentPosition
    );

    // Adjust distance thresholds based on field size
    const fieldScalingFactor = this.calculateFieldScalingFactor();
    const longPassDistance = 20 * fieldScalingFactor; // Adjusted distance

    // Simplified logic: if the target player is ahead and there is space, attempt a through ball
    const isForwardPass =
      (this.teamSide === "home" &&
        targetPlayer.currentPosition.y > player.currentPosition.y) ||
      (this.teamSide === "away" &&
        targetPlayer.currentPosition.y < player.currentPosition.y);

    const opponentsNearTarget = this.countOpponentsNearPosition(
      targetPlayer.currentPosition,
      opponentTeam,
      10 * fieldScalingFactor // Radius adjusted for field size
    );

    if (
      isForwardPass &&
      opponentsNearTarget === 0 &&
      distance > longPassDistance
    ) {
      return "throughBall";
    } else {
      return "toFeet";
    }
  }

  // Evaluate and score a possible action
  evaluateAction(
    player,
    action,
    ball,
    opponentTeam,
    gameContext,
    hasPossession
  ) {
    let score = 0;

    switch (action.type) {
      case "shoot":
        score += this.evaluateShootingOpportunity(player, ball, gameContext);
        // console.log("shoot", player.name, score);
        break;
      case "pass":
        score += this.evaluatePassingOpportunity(
          player,
          action.targetPlayer,
          opponentTeam,
          gameContext,
          action.passType
        );
        // console.log("pass", player.name, score);
        break;
      case "dribble":
        score += this.evaluateDribblingOpportunity(
          player,
          opponentTeam,
          gameContext
        );
        // console.log("dribble", player.name, score);
        break;
      case "move":
        score += this.evaluatePositioning(
          player,
          action.targetPosition,
          gameContext,
          hasPossession,
          opponentTeam
        );
        // console.log("move", player.name, score);
        break;
      case "mark":
        score += this.evaluateMarkingOpportunity(player, action.targetOpponent);
        // console.log("mark", player.name, score);
        break;
      case "press":
        score += this.evaluatePressingOpportunity(
          player,
          action.targetPosition,
          opponentTeam
        );
        // console.log("press", player.name, score);
        break;
      case "tackle":
        score += this.evaluateTackleOpportunity(
          player,
          action.targetOpponent,
          ball,
          gameContext
        );
        // console.log("tackle", player.name, score);
        break;
      case "defendZone":
        score += this.evaluateZoneDefending(player, action.zone, gameContext);
        // console.log("defendZone", player.name, score);
        break;
      default:
        break;
    }

    // Optional randomness to simulate human behavior
    score += Math.random() * 5 - 2.5; // Random value between -2.5 and +2.5

    return score;
  }

  // Execute actions assigned to players
  executeActions(actions, ball) {
    Object.values(actions).forEach(({ action, player }) => {
      if (action) {
        player.performAction(action, ball);
      }
    });
  }

  // Evaluate shooting opportunity
  evaluateShootingOpportunity(player, ball, gameContext) {
    const opponentGoal = player.getOpponentGoalPosition();
    const distanceToGoal = calculateDistance(
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

  // Evaluate passing opportunity, considering pass type
  evaluatePassingOpportunity(
    player,
    targetPlayer,
    opponentTeam,
    gameContext,
    passType
  ) {
    let baseScore = this.basicPassingEvaluation(
      player,
      targetPlayer,
      opponentTeam,
      gameContext
    );

    // Adjust score based on pass type
    if (passType === "throughBall") {
      // Encourage through balls when appropriate
      baseScore += 5;

      // Penalize if target player is unlikely to reach the ball
      const targetPlayerSpeed = targetPlayer.stats.pace;
      const distanceToBall = calculateDistance(
        targetPlayer.currentPosition,
        player.currentPosition
      );
      if (distanceToBall / targetPlayerSpeed > 5) {
        baseScore -= 10; // Too far for the player to reach in time
      }
    } else if (passType === "toFeet") {
      // Standard pass, no adjustment needed
    }

    return baseScore;
  }

  // Basic passing evaluation (shared logic)
  basicPassingEvaluation(player, targetPlayer, opponentTeam, gameContext) {
    const passingSkill = player.stats.passing;
    const fieldLength = this.field.length;
    const fieldWidth = this.field.width;

    // Calculate basic metrics
    const distance = calculateDistance(
      player.currentPosition,
      targetPlayer.currentPosition
    );

    const maxDistance = Math.sqrt(
      fieldLength * fieldLength + fieldWidth * fieldWidth
    );

    // Normalize distance score (closer is better, but not the only factor)
    const distanceScore = (1 - distance / maxDistance) * 10; // Scale to 0-10

    // Determine if the pass is forward
    const isForwardPass =
      (this.teamSide === "home" &&
        targetPlayer.currentPosition.y > player.currentPosition.y) ||
      (this.teamSide === "away" &&
        targetPlayer.currentPosition.y < player.currentPosition.y);

    const forwardPassScore = isForwardPass ? 5 : -5; // Encourage forward passes

    // Evaluate opponent proximity to target player
    const opponentsNearTarget = this.countOpponentsNearPosition(
      targetPlayer.currentPosition,
      opponentTeam,
      10 // Radius to consider opponents "near"
    );
    const opponentProximityScore = -opponentsNearTarget * 5; // Penalize passes to marked players

    // Evaluate number of opponents between player and targetPlayer
    const opponentsInPath = this.countOpponentsInPath(
      player,
      targetPlayer,
      opponentTeam
    );
    const opponentsInPathScore = -opponentsInPath * 5; // Penalize passes through opponents

    // Assess target player's position relative to the field zones
    const targetPlayerZone = this.determineFieldZone(
      targetPlayer.currentPosition
    );
    let fieldZoneScore = 0;
    if (targetPlayerZone === "attackingThird") {
      fieldZoneScore += 10; // Encourage passes into the attacking third
    } else if (targetPlayerZone === "defensiveThird") {
      fieldZoneScore -= 5; // Discourage passes into the defensive third
    }

    // Consider the team's tactical instructions
    const tacticScore = this.evaluateTacticalFit(
      player,
      targetPlayer,
      gameContext
    );

    // Consider risk vs. reward
    const riskRewardScore =
      forwardPassScore - (opponentsInPathScore + opponentProximityScore);

    // Adjust based on passing skill
    const skillInfluence = (passingSkill / 100) * 10; // Scale to 0-10

    // Combine all scores
    const totalScore =
      distanceScore +
      forwardPassScore +
      opponentProximityScore +
      opponentsInPathScore +
      fieldZoneScore +
      tacticScore +
      riskRewardScore +
      skillInfluence;

    return totalScore;
  }

  // Evaluate dribbling opportunity
  evaluateDribblingOpportunity(player, opponentTeam, gameContext) {
    const dribblingSkill = player.stats.dribbling;
    const pace = player.stats.pace;

    // 1. Calculate space around the player
    const spaceScore = this.calculateSpaceAroundPlayer(player, opponentTeam);

    // 2. Assess field position
    const fieldZone = this.determineFieldZone(player.currentPosition);
    let fieldZoneScore = 0;
    if (fieldZone === "attackingThird") {
      fieldZoneScore += 5; // Encourage dribbling in attacking areas
    } else if (fieldZone === "defensiveThird") {
      fieldZoneScore -= 10; // Discourage risky dribbling near own goal
    }

    // 3. Evaluate opponent proximity
    const opponentsNearby = this.countOpponentsNearPosition(
      player.currentPosition,
      opponentTeam,
      10 // Radius to consider opponents "nearby"
    );
    const opponentProximityScore = -opponentsNearby * 5; // Penalize for each nearby opponent

    // 4. Assess available passing options
    const passingOptionsScore = this.evaluatePassingOptions(
      player,
      opponentTeam
    );

    // 5. Consider player's fatigue
    const fatigueInfluence = -((100 - player.fitness) / 100) * 5; // Tired players less likely to dribble

    // 6. Adjust for team tactics
    const tacticScore = this.evaluateDribblingTacticalFit(player, gameContext);

    // 7. Skill influence
    const skillInfluence = (dribblingSkill / 100) * 10; // Scale to 0-10 based on dribbling skill

    // 8. Risk vs. Reward
    const riskRewardScore =
      fieldZoneScore +
      spaceScore +
      tacticScore +
      skillInfluence -
      (opponentProximityScore + passingOptionsScore);

    // 9. Total score
    const totalScore =
      fieldZoneScore +
      spaceScore +
      opponentProximityScore +
      passingOptionsScore +
      fatigueInfluence +
      tacticScore +
      skillInfluence +
      riskRewardScore;

    return totalScore;
  }

  // Evaluate tackling opportunity
  evaluateTackleOpportunity(player, targetOpponent, ball, gameContext) {
    // const defendingSkill = player.stats.defending;
    // const tacklingSkill = player.stats.tackling || 50; // Default if not defined
    // const aggression = player.stats.aggression || 50;
    // const discipline = player.stats.discipline || 50;
    // const distance = calculateDistance(
    //   player.currentPosition,
    //   targetOpponent.currentPosition
    // );

    // const opponentDribbling = targetOpponent.stats.dribbling;
    // const opponentPace = targetOpponent.stats.pace;

    // let score = 0;

    // // Base score influenced by player's tackling ability
    // score += (tacklingSkill / 100) * 20; // Scale to 0-20

    // // Penalize if the opponent has high dribbling skill
    // score -= (opponentDribbling / 100) * 10; // Scale to 0-10

    // // Distance influence: closer means higher chance
    // const maxTacklingDistance = 5; // Maximum effective tackling distance
    // const distanceInfluence = (1 - distance / maxTacklingDistance) * 10; // Scale to 0-10
    // score += Math.max(0, distanceInfluence); // Ensure it's not negative

    // // Consider aggression: more aggressive players may attempt riskier tackles
    // score += (aggression / 100) * 5; // Scale to 0-5

    // // Risk assessment: avoid risky tackles in dangerous areas
    // const fieldZone = this.determineFieldZone(player.currentPosition);
    // if (fieldZone === "defensiveThird") {
    //   score -= 10; // Discourage risky tackles near own goal
    // }

    // // Game context adjustments
    // if (gameContext.isLateGame && gameContext.goalDifference < 0) {
    //   // Team is losing late in the game
    //   score += 5; // Encourage winning the ball back
    // }

    // // Risk of foul: adjust based on player's discipline
    // score -= (100 - discipline) / 20; // Players with low discipline are more likely to commit fouls

    const score = 100;

    return score;
  }

  // Evaluate positioning for off-the-ball movement
  evaluatePositioning(
    player,
    targetPosition,
    gameContext,
    hasPossession,
    opponentTeam
  ) {
    let score = 0; // Base score

    const distance = calculateDistance(player.currentPosition, targetPosition);

    const fieldScalingFactor = this.calculateFieldScalingFactor();

    if (hasPossession) {
      // Offensive positioning

      const ballCarrier = this.getBallCarrier();

      if (ballCarrier && ballCarrier !== player) {
        // Calculate distance to ball carrier
        const distanceToBallCarrier = calculateDistance(
          targetPosition,
          ballCarrier.currentPosition
        );

        // Preferable distance ranges to be available for a pass
        const preferredDistance = 15 * fieldScalingFactor; // Adjusted
        const maxDistance = 30 * fieldScalingFactor;

        let distanceScore = 0;
        if (distanceToBallCarrier < preferredDistance) {
          // Too close, may crowd the ball carrier
          distanceScore -= (preferredDistance - distanceToBallCarrier) * 2;
        } else if (distanceToBallCarrier <= maxDistance) {
          // Good distance to support
          distanceScore += (distanceToBallCarrier - preferredDistance) * 1.5;
        } else {
          // Too far to support
          distanceScore -= (distanceToBallCarrier - maxDistance) * 1;
        }
        score += distanceScore;

        // Evaluate space around target position
        const spaceScore = this.calculateSpaceAroundPosition(
          targetPosition,
          opponentTeam
        );
        score += spaceScore * 2; // Weighting factor

        // Penalize being too close to teammates unless tactically appropriate
        const teammatesNearby = this.countTeammatesNearPosition(
          player,
          targetPosition,
          10 * fieldScalingFactor
        );

        const teammateProximityScore = -teammatesNearby * 5;

        score += teammateProximityScore;
      } else {
        // No ball carrier found, default to formation position
        const distanceToFormationPosition = calculateDistance(
          targetPosition,
          player.formationPosition
        );
        const formationScore = Math.max(0, 30 - distanceToFormationPosition);
        score += formationScore;
      }
    } else {
      // Defensive positioning

      // Encourage being close to formation position or defensive zone
      const distanceToFormationPosition = calculateDistance(
        targetPosition,
        player.formationPosition
      );

      const formationScore = Math.max(0, 30 - distanceToFormationPosition);
      score += formationScore;

      // Additional defensive considerations can be added here
      // For example, covering dangerous spaces or opponents
    }

    // Adjust score based on distance to target position (moving less is preferable)
    score -= distance * 0.1; // Weighting factor

    return score;
  }

  // Evaluate marking opportunity
  evaluateMarkingOpportunity(player, targetOpponent) {
    const defendingSkill = player.stats.defending;
    const distance = calculateDistance(
      player.currentPosition,
      targetOpponent.currentPosition
    );

    let score = defendingSkill - distance;

    return score;
  }

  // Evaluate pressing opportunity
  evaluatePressingOpportunity(player, targetPosition, opponentTeam) {
    const pressingIntensity = this.tactics.pressingIntensity;
    const distance = calculateDistance(player.currentPosition, targetPosition);

    let score = pressingIntensity - distance;

    return score;
  }

  // Evaluate zone defending opportunity
  evaluateZoneDefending(player, zone, gameContext) {
    const defendingSkill = player.stats.defending;

    // Calculate distance to center of the assigned zone
    const distance = calculateDistance(player.currentPosition, zone.center);

    let score = defendingSkill - distance * 0.5;

    // Encourage covering high-threat zones
    score += zone.threatLevel * 10; // Scale threat level to score

    return score;
  }

  // Helper Methods

  // Count opponents in the path between two players
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

  // Check if a point is on the line segment between two points
  isPointOnLineSegment(point, lineStart, lineEnd, tolerance = 5) {
    // Check if the point is close to the line segment
    const d1 = calculateDistance(lineStart, point);
    const d2 = calculateDistance(point, lineEnd);
    const lineLength = calculateDistance(lineStart, lineEnd);

    return Math.abs(d1 + d2 - lineLength) < tolerance;
  }

  // Count opponents near a specific position
  countOpponentsNearPosition(position, opponentTeam, radius) {
    let count = 0;
    opponentTeam.players.forEach((opponent) => {
      const distance = calculateDistance(position, opponent.currentPosition);
      if (distance <= radius) {
        count += 1;
      }
    });
    return count;
  }

  // Determine field zone based on position
  determineFieldZone(position) {
    const fieldLength = this.field.length;
    const oneThird = fieldLength / 3;
    const y = position.y;

    if (
      (this.teamSide === "home" && y < -oneThird) ||
      (this.teamSide === "away" && y > oneThird)
    ) {
      return "defensiveThird";
    } else if (Math.abs(y) <= oneThird) {
      return "middleThird";
    } else {
      return "attackingThird";
    }
  }

  // Evaluate tactical fit of a pass
  evaluateTacticalFit(player, targetPlayer, gameContext) {
    let score = 0;

    // Example: If the tactic is 'attackDownWings' and targetPlayer is a winger
    if (this.tactics.attackStyle === "attackDownWings") {
      if (["LW", "RW", "LM", "RM"].includes(targetPlayer.position)) {
        score += 10; // Encourage passes to wingers
      }
    }

    // Additional tactical considerations can be added here

    return score;
  }

  // Evaluate passing options for dribbling decision
  evaluatePassingOptions(player, opponentTeam) {
    const teammates = this.players.filter((teammate) => teammate !== player);
    let goodOptions = 0;
    teammates.forEach((teammate) => {
      const passingOpportunityScore = this.basicPassingEvaluation(
        player,
        teammate,
        opponentTeam,
        {} // Pass gameContext if needed
      );
      if (passingOpportunityScore > 50) {
        goodOptions += 1;
      }
    });
    // Penalize dribbling if there are good passing options
    return goodOptions * 5;
  }

  // Evaluate dribbling tactical fit
  evaluateDribblingTacticalFit(player, gameContext) {
    let score = 0;
    if (this.tactics.playStyle === "dribble") {
      score += 5;
    }
    // Additional tactical considerations can be added
    return score;
  }

  // Calculate space around the player
  calculateSpaceAroundPlayer(player, opponentTeam) {
    const radius = 15; // Radius to check for space
    const opponentsNearby = this.countOpponentsNearPosition(
      player.currentPosition,
      opponentTeam,
      radius
    );
    // More space (fewer opponents) yields a higher score
    return (1 - opponentsNearby / opponentTeam.players.length) * 10; // Scale to 0-10
  }

  // Get support position for off-the-ball movement
  getSupportPosition(player, ball) {
    // Weight factors for different roles
    const roleWeights = {
      Defender: 0.1,
      Midfielder: 0.3,
      Forward: 0.5,
    };

    // Determine the player's role
    let role = "Midfielder"; // Default role
    if (["GK", "CB1", "CB2", "LB", "RB"].includes(player.position)) {
      role = "Defender";
    } else if (["CM", "CM1", "CM2", "LM", "RM"].includes(player.position)) {
      role = "Midfielder";
    } else if (["ST", "ST1", "ST2", "LW", "RW"].includes(player.position)) {
      role = "Forward";
    }

    const supportWeight = roleWeights[role];

    // Calculate the vector towards the ball
    const vectorToBall = {
      x: ball.position.x - player.currentPosition.x,
      y: ball.position.y - player.currentPosition.y,
    };

    // Normalize the vector
    const distanceToBall = calculateDistance(
      player.currentPosition,
      ball.position
    );
    const normalizedVector = {
      x: vectorToBall.x / distanceToBall || 0,
      y: vectorToBall.y / distanceToBall || 0,
    };

    // Determine the support position
    const targetPosition = {
      x:
        player.formationPosition.x +
        normalizedVector.x * supportWeight * distanceToBall,
      y:
        player.formationPosition.y +
        normalizedVector.y * supportWeight * distanceToBall,
    };

    // Optionally, add some randomness to avoid predictability
    const randomness = 5; // Adjust as needed
    targetPosition.x += Math.random() * randomness - randomness / 2;
    targetPosition.y += Math.random() * randomness - randomness / 2;

    return targetPosition;
  }

  // Get adjusted defensive position based on vulnerable zones
  getAdjustedDefensivePosition(player, ball, opponentTeam) {
    // Identify vulnerable zones
    const vulnerableZones = this.identifyVulnerableZones(ball, opponentTeam);

    // Assign player to a zone
    const assignedZone = this.assignPlayerToZone(player, vulnerableZones);

    // Calculate position within the assigned zone
    const targetPosition = this.calculateZonePosition(player, assignedZone);

    return targetPosition;
  }

  // Identify vulnerable zones on the pitch
  identifyVulnerableZones(ball, opponentTeam) {
    // For simplicity, divide the defensive half into zones
    const zones = [];

    const zoneWidth = this.field.width / 3;
    const zoneHeight = this.field.length / 3;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const zone = {
          x: -this.field.width / 2 + i * zoneWidth + zoneWidth / 2,
          y: -this.field.length / 2 + j * zoneHeight + zoneHeight / 2,
          width: zoneWidth,
          height: zoneHeight,
          center: {
            x: -this.field.width / 2 + i * zoneWidth + zoneWidth / 2,
            y: -this.field.length / 2 + j * zoneHeight + zoneHeight / 2,
          },
          threatLevel: 0,
        };

        // Calculate threat level based on opponent presence
        opponentTeam.players.forEach((opponent) => {
          if (this.isPositionInZone(opponent.currentPosition, zone)) {
            zone.threatLevel += 1;
          }
        });

        zones.push(zone);
      }
    }

    return zones;
  }

  // Assign player to a vulnerable zone
  assignPlayerToZone(player, zones) {
    // Prioritize zones with higher threat levels
    zones.sort((a, b) => b.threatLevel - a.threatLevel);

    // Assign player to the nearest high-threat zone
    for (let zone of zones) {
      if (!zone.assignedPlayer) {
        zone.assignedPlayer = player;
        return zone;
      }
    }

    // If all zones are assigned, default to player's formation position
    return {
      center: player.formationPosition,
      threatLevel: 0,
    };
  }

  // Calculate position within a zone
  calculateZonePosition(player, zone) {
    // Position at the center of the zone for simplicity
    const targetPosition = { ...zone.center };

    // Adjust position slightly based on player's role
    if (["CB1", "CB2"].includes(player.position)) {
      // Central defenders stay deeper
      targetPosition.y -= 5;
    } else if (["LB", "RB"].includes(player.position)) {
      // Fullbacks cover wider areas
      targetPosition.x += player.position === "LB" ? 5 : -5;
    }

    return targetPosition;
  }

  // Check if a position is within a zone
  isPositionInZone(position, zone) {
    return (
      position.x >= zone.center.x - zone.width / 2 &&
      position.x <= zone.center.x + zone.width / 2 &&
      position.y >= zone.center.y - zone.height / 2 &&
      position.y <= zone.center.y + zone.height / 2
    );
  }

  // Decide whether a player should press
  shouldPress(player, ball, gameContext) {
    const pressingIntensity = this.tactics.pressingIntensity;
    const distanceToBall = calculateDistance(
      player.currentPosition,
      ball.position
    );

    // Pressing thresholds based on pressing style
    const pressingThresholds = {
      high: 30,
      balanced: 20,
      low: 10,
    };

    const maxPressingDistance =
      pressingThresholds[this.tactics.pressingStyle] || 20;

    return pressingIntensity > 50 && distanceToBall <= maxPressingDistance;
  }

  // Find the nearest opponent to a player
  findNearestOpponent(player, opponentTeam) {
    let nearestOpponent = null;
    let shortestDistance = Infinity;

    opponentTeam.players.forEach((opponent) => {
      const distance = calculateDistance(
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

  // Get dribble target position
  getDribbleTarget(player) {
    const forwardOffset = 10;
    return {
      x: player.currentPosition.x,
      y:
        this.teamSide === "home"
          ? player.currentPosition.y + forwardOffset
          : player.currentPosition.y - forwardOffset,
    };
  }

  // Set Piece Decision-Making

  // Decide set piece actions
  decideSetPiece(playerTakingSetPiece, ball, opponentTeam, setPieceType, side) {
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

  // Find the best option for a throw-in
  findBestThrowInOption(player) {
    let nearestTeammate = null;
    let shortestDistance = Infinity;

    this.players.forEach((teammate) => {
      if (teammate !== player && !teammate.injured) {
        const distance = calculateDistance(
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

  // Choose the corner taker based on side
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

  updatePlayers(deltaTime, ball, opponentTeam) {
    this.players.forEach((player) => {
      player.update(deltaTime, ball, opponentTeam);
    });
  }

  // Calculate field scaling factor based on field dimensions
  calculateFieldScalingFactor() {
    const standardFieldLength = 105; // meters
    const standardFieldWidth = 68; // meters

    const lengthScalingFactor = this.field.length / standardFieldLength;
    const widthScalingFactor = this.field.width / standardFieldWidth;

    // Use the geometric mean to balance scaling
    const fieldScalingFactor = Math.sqrt(
      lengthScalingFactor * widthScalingFactor
    );

    return fieldScalingFactor;
  }

  // Calculate tackling distance adjusted for field size
  calculateTacklingDistance() {
    const standardTacklingDistance = 5; // meters
    const fieldScalingFactor = this.calculateFieldScalingFactor();
    return standardTacklingDistance * fieldScalingFactor;
  }

  getBallCarrier() {
    return this.players.find((player) => player.hasBall);
  }

  // Calculate space around a position
  calculateSpaceAroundPosition(position, opponentTeam) {
    const fieldScalingFactor = this.calculateFieldScalingFactor();
    const radius = 10 * fieldScalingFactor; // Adjusted radius
    const opponentsNearby = this.countOpponentsNearPosition(
      position,
      opponentTeam,
      radius
    );

    // More space (fewer opponents) yields a higher score
    const spaceScore = (1 - opponentsNearby / opponentTeam.players.length) * 10; // Scale to 0-10

    return spaceScore;
  }

  // Count teammates near a specific position
  countTeammatesNearPosition(player, position, radius) {
    let count = 0;
    this.players.forEach((teammate) => {
      if (teammate !== player) {
        const distance = calculateDistance(position, teammate.currentPosition);
        if (distance <= radius) {
          count += 1;
        }
      }
    });
    return count;
  }

  // Calculate field scaling factor based on field dimensions
  calculateFieldScalingFactor() {
    const standardFieldLength = 105; // meters
    const standardFieldWidth = 68; // meters

    const lengthScalingFactor = this.field.length / standardFieldLength;
    const widthScalingFactor = this.field.width / standardFieldWidth;

    // Use the geometric mean to balance scaling
    const fieldScalingFactor = Math.sqrt(
      lengthScalingFactor * widthScalingFactor
    );

    return fieldScalingFactor;
  }
}

module.exports = Team;
