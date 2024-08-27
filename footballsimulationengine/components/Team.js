class Team {
  constructor(name, formation, strategy) {
    this.name = name;
    this.formation = formation; // E.g., '4-4-2', '4-3-3'
    this.strategy = strategy; // E.g., 'attacking', 'defensive'
    this.players = []; // Array to hold Player objects
  }

  addPlayer(player) {
    // Add a player to the team and set their team reference
    this.players.push(player);
    player.setTeam(this); // Establish a bidirectional relationship
  }

  removePlayer(player) {
    // Remove a player from the team
    this.players = this.players.filter((p) => p !== player);
    player.setTeam(null); // Remove the team reference from the player
  }

  getFormationPositions() {
    // Define formation positions based on formation type
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
      // Add other formations as needed
    };

    return formations[this.formation] || {};
  }

  setFormationPositions() {
    const formationPositions = this.getFormationPositions();

    this.players.forEach((player) => {
      const positionKey = player.position;
      const relativePosition = formationPositions[positionKey];

      if (relativePosition) {
        const absolutePosition = {
          x: relativePosition.x * this.field.width,
          y: relativePosition.y * this.field.length,
        };
        player.setPosition(absolutePosition);
      } else {
        console.error(
          `Unknown position for player ${player.name}: ${positionKey}`
        );
      }
    });
  }

  // Method to assign roles and instructions to players
  assignRolesAndInstructions() {
    this.players.forEach((player, index) => {
      let role;
      let formationPosition;

      // Determine role and formation position based on the formation
      if (index < this.formation.defenders) {
        role = "defender";
        formationPosition = this.getDefensivePosition(index);
      } else if (
        index <
        this.formation.defenders + this.formation.midfielders
      ) {
        role = "midfielder";
        formationPosition = this.getMidfieldPosition(index);
      } else {
        role = "attacker";
        formationPosition = this.getAttackingPosition(index);
      }

      // Create team instructions based on the role and strategy
      const teamInstructions = {
        role: role,
        aggression: this.strategy.aggression || 50, // Default aggression level
        passingStrategy: this.strategy.passing || "balanced", // Default passing strategy
      };

      // Update the player's team instructions and set their formation position
      player.updateTeamInstructions(teamInstructions);
      player.setFormationPosition(formationPosition);
    });
  }

  // Method to change the team's strategy dynamically
  updateStrategy(newStrategy) {
    this.strategy = { ...this.strategy, ...newStrategy };
    this.assignRolesAndInstructions(); // Reassign roles and instructions based on the new strategy
  }

  setFormation(newFormation) {
    // Change the team's formation and update player positions
    this.formation = newFormation;
    this.updatePlayerPositions();
  }

  updatePlayerPositions() {
    // Assign players to positions based on the formation
    for (let player of this.players) {
      const position = this.calculatePlayerPosition(player);
      player.receiveInstruction("moveToPosition", position);
    }
  }

  changeStrategy(newStrategy) {
    // Change the team's strategy (e.g., from attacking to defensive)
    this.strategy = newStrategy;
    // Depending on the strategy, you might want to give new instructions to players
    this.updatePlayerStrategies();
  }

  updatePlayerStrategies() {
    // Example: Adjust player behavior based on the team's strategy
    for (let player of this.players) {
      if (this.strategy === "attacking") {
        player.receiveInstruction("attack");
      } else if (this.strategy === "defensive") {
        player.receiveInstruction("defend");
      }
    }
  }

  pressOpponent() {
    // Command all players to press the opponent
    for (let player of this.players) {
      player.receiveInstruction("pressOpponent");
    }
  }

  fallbackToDefense() {
    // Command all players to fallback and defend
    for (let player of this.players) {
      player.receiveInstruction("fallback");
    }
  }

  initiateCounterAttack() {
    // Command all players to push forward for a counter-attack
    for (let player of this.players) {
      player.receiveInstruction("counterAttack");
    }
  }

  // Add more team-level strategies or commands as needed
}

module.exports = Team;
