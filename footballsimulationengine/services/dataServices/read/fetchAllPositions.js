const Position = require("../../../models/Position");

const fetchAllPositions = async () => {
  try {
    // Query the positions table
    const positions = await Position.findAll();

    // Construct the result object
    const positionsObject = positions.reduce((obj, position) => {
      obj[position.position_id] = {
        name: position.position_name,
        position_abv: position.position_abv,
      };
      return obj;
    }, {});

    return positionsObject;
  } catch (error) {
    console.error("Error reading positions:", error);
  }
};

module.exports = fetchAllPositions;

// Example usage
// fetchAllPositions()
//   .then((positions) => {
//     console.log("Positions read successfully:", positions);
//   })
//   .catch((error) => {
//     console.error("Error:", error);
//   });
