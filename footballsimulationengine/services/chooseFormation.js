const fetchAllPositions = require("../services/dataServices/read/fetchAllPositions");
const formations = require("../../data/formations.json");

const chooseFormation = async (formationName) => {
  const positionsData = await fetchAllPositions();
  const formation = formations[formationName];

  if (!formation) {
    throw new Error(`Formation ${formationName} not found`);
  }

  const formationObject = formation.map((pos) => {
    const positionData = Object.values(positionsData).find(
      (p) => p.position_abv === pos.position_abv
    );
    if (!positionData) {
      throw new Error(
        `Position ${pos.position_abv} not found in positions data`
      );
    }
    return {
      position_id: Object.keys(positionsData).find(
        (key) => positionsData[key].position_abv === pos.position_abv
      ),
      x: pos.x,
      y: pos.y,
    };
  });

  return formationObject;
};

module.exports = chooseFormation;
