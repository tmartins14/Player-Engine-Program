// Team class contains information such as formation, tactics, position instructions

class Team {
  constructor(players, formation) {
    this.players = players;
    this.formation = formation;
    this.setFormationPositions();
  }

  setFormationPositions() {
    for (let player of this.players) {
      if (formations[this.formation][player.position]) {
        player.setPosition(formations[this.formation][player.position]);
      }
    }
  }

  updateFormation(newFormation) {
    this.formation = newFormation;
    this.setFormationPositions();
  }
}
