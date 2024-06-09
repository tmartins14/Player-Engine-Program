const fs = require("fs");
const path = require("path");
const pitch = require("../../data/pitch.json");

const chooseFormation = require("./chooseFormation");

const pitchWidth = pitch.pitchWidth;
const pitchHeight = pitch.pitchHeight;

const defaultPitchWidth = 680;
const defaultPitchHeight = 1050;

const adjustCoordinates = (formationObject, fieldWidth, fieldHeight) => {
  const adjustedFormation = formationObject.map((player) => ({
    position_id: player.position_id,
    x: player.x * (fieldWidth / defaultPitchWidth),
    y: player.y * (fieldHeight / defaultPitchHeight), // Ensuring y doesn't go past the half line
  }));
  return adjustedFormation;
};

// Example usage:
chooseFormation("4-4-2")
  .then((formationObject) => {
    console.log(formationObject);
    const adjustedFormation = adjustCoordinates(
      formationObject,
      pitchWidth,
      pitchHeight
    );
    console.log(adjustedFormation);

    // Save the result to a JSON file
    const outputPath = path.join(__dirname, "starting_positions.json");
    fs.writeFileSync(outputPath, JSON.stringify(adjustedFormation, null, 2));
  })
  .catch((error) => {
    console.error("Error:", error);
  });
