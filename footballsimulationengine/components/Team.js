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

  calculatePlayerPosition(player) {
    // Logic to determine the player's position based on the formation
    // This is a simplified example; the actual implementation would be more complex
    const formationPositions = this.getFormationPositions();
    return formationPositions[player.position] || { x: 0, y: 0 };
  }

  getFormationPositions() {
    // Define formation positions based on formation type
    const formations = {
      "4-4-2": {
        GK: { x: 0, y: -45 },
        RB: { x: -30, y: -30 },
        CB1: { x: -10, y: -30 },
        CB2: { x: 10, y: -30 },
        LB: { x: 30, y: -30 },
        RM: { x: -30, y: 0 },
        CM1: { x: -10, y: 0 },
        CM2: { x: 10, y: 0 },
        LM: { x: 30, y: 0 },
        ST1: { x: -10, y: 30 },
        ST2: { x: 10, y: 30 },
      },
      "4-3-3": {
        GK: { x: 0, y: -45 },
        RB: { x: -30, y: -30 },
        CB1: { x: -10, y: -30 },
        CB2: { x: 10, y: -30 },
        LB: { x: 30, y: -30 },
        CM: { x: 0, y: 0 },
        RM: { x: -20, y: 0 },
        LM: { x: 20, y: 0 },
        RW: { x: -20, y: 30 },
        ST: { x: 0, y: 30 },
        LW: { x: 20, y: 30 },
      },
      // Add other formations as needed
    };

    return formations[this.formation] || {};
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
