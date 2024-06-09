const sequelize = require("../database");
const Formation = require("../../../models/formation");
const Position = require("../../../models/position");
const formationsData = require("../../../../data/formations.json");

const updateFormations = async (formationsData) => {
  try {
    // Sync the database to ensure the Formations table is created
    await sequelize.sync();

    for (const [formationName, positions] of Object.entries(formationsData)) {
      const formationPromises = positions.map(async (pos) => {
        const positionData = await Position.findOne({
          where: { position_abv: pos.position_abv },
        });

        if (!positionData) {
          throw new Error(
            `Position ${pos.position_abv} not found in positions data`
          );
        }

        return Formation.create({
          formation_name: formationName,
          position: pos.position_abv,
          x: pos.x,
          y: pos.y,
        });
      });

      // Execute all promises for the current formation
      await Promise.all(formationPromises);
    }

    console.log("Formations inserted successfully");
  } catch (error) {
    console.error("Error inserting formations:", error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
};

// Call the insertFormations function with the formationsData
updateFormations(formationsData);
