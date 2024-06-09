const sequelize = require("../../dataServices/database");
const Position = require("../../../models/Position");
const positionsData = require("../../../../data/positions.json");

const updatePositions = async (positionsData) => {
  try {
    // Sync the database to ensure the Positions table is created
    await sequelize.sync();

    // Create an array of promises to insert each position
    const positionPromises = Object.entries(positionsData).map(
      ([abv, name]) => {
        return Position.create({ position_abv: abv, position_name: name });
      }
    );

    // Execute all promises
    await Promise.all(positionPromises);

    console.log("Positions inserted successfully");
  } catch (error) {
    console.error("Error inserting positions:", error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
};

// Call the updatePositions function with the positionsData
updatePositions(positionsData);
