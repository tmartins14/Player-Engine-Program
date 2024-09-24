class Team {
  constructor(name, formation) {
    this.name = name;
    this.formation = formation; // E.g., '4-4-2', '4-3-3'
    this.players = []; // Array to hold Player objects
    this.tactics = {
      defensiveDepth: 50, // Default to a balanced line (0-100)
      pressingIntensity: 50, // Default pressing intensity
      widthOfPlay: 50, // Default width of play
      tempo: 50, // Default tempo
      passingStyle: 50, // Short vs. long passes
      buildUpPlayDirection: 50, // Central vs. wide play (0-100)
      compactness: 50, // How compact the team stays
      lineOfConfrontation: 50, // Where the team starts pressing
      crossingFrequency: 50, // How often the team crosses
      counterPressing: 50, // How aggressively the team tries to win back the ball
      defensiveTransition: 50, // Speed of transitioning to defense
      setPieceFocus: 50, // How much emphasis on set pieces
      attackingCorners: 50, // Number of players in the box for attacking corners
      defendingCorners: 50, // Number of players defending during corners
      timeManagement: 50, // How much the team manages time (instead of wasting it)
      aggressiveness: 50, // Aggressiveness in tackling and duels
      defensiveWidth: 50, // Width of the defensive line
      attackingDepth: 50, // How high or deep the attacking line is
    };
  }

  addPlayer(player) {
    this.players.push(player);
    player.setTeam(this);
  }

  removePlayer(player) {
    this.players = this.players.filter((p) => p !== player);
    player.setTeam(null);
  }

  getPlayers() {
    return this.players;
  }

  getOpponentPlayers(opponentTeam) {
    return opponentTeam.players;
  }

  getFormationPositions() {
    const formations = {
      "4-4-2": {
        GK: { x: 0, y: -0.45 },
        RB: { x: -0.3, y: -0.3 },
        CB1: { x: -0.1, y: -0.3 },
        CB2: { x: 0.1, y: -0.3 },
        LB: { x: 0.3, y: -0.3 },
        RM: { x: -0.3, y: 0 },
        CM1: { x: -0.1, y: 0 },
        CM2: { x: 0.1, y: 0 },
        LM: { x: 0.3, y: 0 },
        ST1: { x: -0.1, y: 0.3 },
        ST2: { x: 0.1, y: 0.3 },
      },
      "4-3-3": {
        GK: { x: 0, y: -0.45 },
        RB: { x: -0.3, y: -0.3 },
        CB1: { x: -0.1, y: -0.3 },
        CB2: { x: 0.1, y: -0.3 },
        LB: { x: 0.3, y: -0.3 },
        CM: { x: 0, y: 0 },
        RM: { x: -0.2, y: 0 },
        LM: { x: 0.2, y: 0 },
        RW: { x: -0.2, y: 0.3 },
        ST: { x: 0, y: 0.3 },
        LW: { x: 0.2, y: 0.3 },
      },
    };

    return formations[this.formation] || {};
  }

  setFormationPositions(field) {
    const formationPositions = this.getFormationPositions();

    this.players.forEach((player) => {
      const positionKey = player.position;
      const relativePosition = formationPositions[positionKey];

      if (relativePosition) {
        const absolutePosition = {
          x: relativePosition.x * field.width,
          y: relativePosition.y * field.length,
        };
        player.setPosition(absolutePosition);
      } else {
        console.error(
          `Unknown position for player ${player.name}: ${positionKey}`
        );
      }
    });
  }

  setTactics(newTactics) {
    this.tactics = { ...this.tactics, ...newTactics };
    this.applyTactics();
  }

  applyTactics() {
    console.log(`Applying tactics: ${JSON.stringify(this.tactics)}`);
    // Implementation to apply these tactics across the team
  }

  selectStyleOfPlay(style) {
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
      case "counter-attack":
        this.setTactics({
          defensiveDepth: 30,
          pressingIntensity: 40,
          widthOfPlay: 60,
          tempo: 80,
          passingStyle: 60,
          buildUpPlayDirection: 60,
          compactness: 70,
          lineOfConfrontation: 40,
          crossingFrequency: 50,
          counterPressing: 70,
          defensiveTransition: 70,
          setPieceFocus: 50,
          attackingCorners: 60,
          defendingCorners: 50,
          timeManagement: 60,
          aggressiveness: 60,
          defensiveWidth: 60,
          attackingDepth: 70,
        });
        break;
      case "park-the-bus":
        this.setTactics({
          defensiveDepth: 20,
          pressingIntensity: 20,
          widthOfPlay: 50,
          tempo: 30,
          passingStyle: 30,
          buildUpPlayDirection: 30,
          compactness: 90,
          lineOfConfrontation: 30,
          crossingFrequency: 30,
          counterPressing: 20,
          defensiveTransition: 90,
          setPieceFocus: 60,
          attackingCorners: 40,
          defendingCorners: 70,
          timeManagement: 80,
          aggressiveness: 70,
          defensiveWidth: 40,
          attackingDepth: 20,
        });
        break;
      case "long-ball":
        this.setTactics({
          defensiveDepth: 50,
          pressingIntensity: 50,
          widthOfPlay: 70,
          tempo: 50,
          passingStyle: 20,
          buildUpPlayDirection: 50,
          compactness: 60,
          lineOfConfrontation: 50,
          crossingFrequency: 70,
          counterPressing: 40,
          defensiveTransition: 60,
          setPieceFocus: 70,
          attackingCorners: 70,
          defendingCorners: 60,
          timeManagement: 50,
          aggressiveness: 60,
          defensiveWidth: 70,
          attackingDepth: 50,
        });
        break;
      case "high-press":
        this.setTactics({
          defensiveDepth: 70,
          pressingIntensity: 90,
          widthOfPlay: 60,
          tempo: 60,
          passingStyle: 50,
          buildUpPlayDirection: 60,
          compactness: 70,
          lineOfConfrontation: 80,
          crossingFrequency: 40,
          counterPressing: 80,
          defensiveTransition: 80,
          setPieceFocus: 50,
          attackingCorners: 60,
          defendingCorners: 50,
          timeManagement: 40,
          aggressiveness: 80,
          defensiveWidth: 60,
          attackingDepth: 70,
        });
        break;
      default:
        console.error(`Unknown style of play: ${style}`);
    }
  }
}

module.exports = Team;
