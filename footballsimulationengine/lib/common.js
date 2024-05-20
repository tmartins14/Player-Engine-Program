// Import the file system module from Node.js to handle file operations.
const fs = require("fs");

// Math Functions

// Returns a random integer between the specified minimum and maximum values, inclusive.
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Rounds a number to a specified number of decimal places.
function round(value, decimals) {
  return Number(`${Math.round(`${value}e${decimals}`)}e-${decimals}`);
}

// Checks if a given number is strictly between two boundaries.
function isBetween(num, low, high) {
  return num > low && num < high;
}

// Calculates the trajectory of a ball given starting and ending positions, and power.
function getBallTrajectory(currentPOS, newPOS, power) {
  const xMovement = (currentPOS[0] - newPOS[0]) ** 2;
  const yMovement =
    (parseInt(currentPOS[1], 10) - parseInt(newPOS[1], 10)) ** 2;
  const movementDistance = Math.round(Math.sqrt(xMovement + yMovement), 0);

  let arraySize = Math.round(currentPOS[1] - newPOS[1]);

  if (movementDistance >= power) {
    power = parseInt(power, 10) + parseInt(movementDistance, 10);
  }
  const height = Math.sqrt(
    Math.abs((movementDistance / 2) ** 2 - (power / 2) ** 2)
  );

  if (arraySize < 1) arraySize = 1;

  const yPlaces = Array(...Array(Math.abs(arraySize))).map((x, i) => i);

  const trajectory = [[currentPOS[0], currentPOS[1], 0]];

  const changeInX =
    (newPOS[0] - currentPOS[0]) / Math.abs(currentPOS[1] - newPOS[1]);
  const changeInY = (currentPOS[1] - newPOS[1]) / (newPOS[1] - currentPOS[1]);
  const changeInH = height / (yPlaces.length / 2);
  let elevation = 1;

  yPlaces.forEach(() => {
    const lastX = trajectory[trajectory.length - 1][0];
    const lastY = trajectory[trajectory.length - 1][1];
    const lastH = trajectory[trajectory.length - 1][2];
    const xPos = round(lastX + changeInX, 5);
    let yPos = 0;
    if (newPOS[1] > currentPOS[1]) {
      yPos = parseInt(lastY, 10) - parseInt(changeInY, 10);
    } else {
      yPos = parseInt(lastY, 10) + parseInt(changeInY, 10);
    }
    let hPos;
    if (elevation === 1) {
      hPos = round(lastH + changeInH, 5);

      if (hPos >= height) {
        elevation = 0;
        hPos = height;
      }
    } else {
      hPos = round(lastH - changeInH, 5);
    }
    trajectory.push([xPos, yPos, hPos]);
  });
  return trajectory;
}

// Computes the power of a hit based on strength, randomized by a factor between 1 and 5.
function calculatePower(strength) {
  let hit = getRandomNumber(1, 5);
  return parseInt(strength, 10) * hit;
}

// Calculates the result of a multiplied by b divided by the sum of the first x natural numbers.
function aTimesbDividedByC(a, b, c) {
  try {
    return a * (b / sumFrom1toX(c));
  } catch (error) {
    throw new Error(error);
  }
}

// Calculates the sum of the first x natural numbers.
function sumFrom1toX(x) {
  return (x * (x + 1)) / 2;
}

// Asynchronously reads a file and parses it as JSON.
function readFile(filePath) {
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, "utf8", function (err, data) {
      if (err) {
        reject(err); // Rejects the promise with an error object if an error occurs.
      } else {
        data = JSON.parse(data); // Parses the file data as JSON.
        resolve(data); // Resolves the promise with the parsed data.
      }
    });
  });
}

// Injury Functions

// Determines if a player is injured by generating a random number and checking if it matches a specific value.
function isInjured(x) {
  return getRandomNumber(0, x) == 23;
}

// Checks if a player in a given team is injured during a match.
function matchInjury(matchDetails, team) {
  const player = team.players[getRandomNumber(0, 10)];

  if (isInjured(40000)) {
    player.injured = true;
    matchDetails.iterationLog.push(`Player Injured - ${player.name}`);
  }
}

// Checks if a number is even.
function isEven(n) {
  return n % 2 == 0;
}

// Checks if a number is odd.
function isOdd(n) {
  return Math.abs(n % 2) == 1;
}

// Calculates the angle between three positions
function calculateAngle(position1, position2, position3) {}

// Exports functions for use in other files.
module.exports = {
  getRandomNumber,
  round,
  isInjured,
  matchInjury,
  getBallTrajectory,
  isBetween,
  calculatePower,
  isEven,
  isOdd,
  sumFrom1toX,
  aTimesbDividedByC,
  readFile,
  calculateAngle,
};
// // Import the file system module from Node.js to handle file operations.
// const fs = require("fs");

// // Math Functions

// // Returns a random integer between the specified minimum and maximum values, inclusive.
// function getRandomNumber(min, max) {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// // Rounds a number to a specified number of decimal places.
// function round(value, decimals) {
//   return Number(`${Math.round(`${value}e${decimals}`)}e-${decimals}`);
// }

// // Checks if a given number is strictly between two boundaries.
// function isBetween(num, low, high) {
//   return num > low && num < high;
// }

// // Calculates the trajectory of a ball given starting and ending positions, and power.
// function getBallTrajectory(currentPOS, newPOS, power) {
//   const xMovement = (currentPOS[0] - newPOS[0]) ** 2;
//   const yMovement =
//     (parseInt(currentPOS[1], 10) - parseInt(newPOS[1], 10)) ** 2;
//   const movementDistance = Math.round(Math.sqrt(xMovement + yMovement), 0);

//   let arraySize = Math.round(currentPOS[1] - newPOS[1]);

//   if (movementDistance >= power) {
//     power = parseInt(power, 10) + parseInt(movementDistance, 10);
//   }
//   const height = Math.sqrt(
//     Math.abs((movementDistance / 2) ** 2 - (power / 2) ** 2)
//   );

//   if (arraySize < 1) arraySize = 1;

//   const yPlaces = Array(...Array(Math.abs(arraySize))).map((x, i) => i);

//   const trajectory = [[currentPOS[0], currentPOS[1], 0]];

//   const changeInX =
//     (newPOS[0] - currentPOS[0]) / Math.abs(currentPOS[1] - newPOS[1]);
//   const changeInY = (currentPOS[1] - newPOS[1]) / (newPOS[1] - currentPOS[1]);
//   const changeInH = height / (yPlaces.length / 2);
//   let elevation = 1;

//   yPlaces.forEach(() => {
//     const lastX = trajectory[trajectory.length - 1][0];
//     const lastY = trajectory[trajectory.length - 1][1];
//     const lastH = trajectory[trajectory.length - 1][2];
//     const xPos = round(lastX + changeInX, 5);
//     let yPos = 0;
//     if (newPOS[1] > currentPOS[1]) {
//       yPos = parseInt(lastY, 10) - parseInt(changeInY, 10);
//     } else {
//       yPos = parseInt(lastY, 10) + parseInt(changeInY, 10);
//     }
//     let hPos;
//     if (elevation === 1) {
//       hPos = round(lastH + changeInH, 5);

//       if (hPos >= height) {
//         elevation = 0;
//         hPos = height;
//       }
//     } else {
//       hPos = round(lastH - changeInH, 5);
//     }
//     trajectory.push([xPos, yPos, hPos]);
//   });
//   return trajectory;
// }

// // Computes the power of a hit based on strength, randomized by a factor between 1 and 5.
// function calculatePower(strength) {
//   let hit = getRandomNumber(1, 5);
//   return parseInt(strength, 10) * hit;
// }

// // Calculates the result of a multiplied by b divided by the sum of the first x natural numbers.
// function aTimesbDividedByC(a, b, c) {
//   try {
//     return a * (b / sumFrom1toX(c));
//   } catch (error) {
//     throw new Error(error);
//   }
// }

// // Calculates the sum of the first x natural numbers.
// function sumFrom1toX(x) {
//   return (x * (x + 1)) / 2;
// }

// // Asynchronously reads a file and parses it as JSON.
// function readFile(filePath) {
//   return new Promise(function (resolve, reject) {
//     fs.readFile(filePath, "utf8", function (err, data) {
//       if (err) {
//         reject(err); // Rejects the promise with an error object if an error occurs.
//       } else {
//         data = JSON.parse(data); // Parses the file data as JSON.
//         resolve(data); // Resolves the promise with the parsed data.
//       }
//     });
//   });
// }

// // Injury Functions

// // Determines if a player is injured by generating a random number and checking if it matches a specific value.
// function isInjured(x) {
//   return getRandomNumber(0, x) == 23;
// }

// // Checks if a player in a given team is injured during a match.
// function matchInjury(matchDetails, team) {
//   const player = team.players[getRandomNumber(0, 10)];

//   if (isInjured(40000)) {
//     player.injured = true;
//     matchDetails.iterationLog.push(`Player Injured - ${player.name}`);
//   }
// }

// // Checks if a number is even.
// function isEven(n) {
//   return n % 2 == 0;
// }

// // Checks if a number is odd.
// function isOdd(n) {
//   return Math.abs(n % 2) == 1;
// }

// // Exports functions for use in other files.
// module.exports = {
//   getRandomNumber,
//   round,
//   isInjured,
//   matchInjury,
//   getBallTrajectory,
//   isBetween,
//   calculatePower,
//   isEven,
//   isOdd,
//   sumFrom1toX,
//   aTimesbDividedByC,
//   readFile,
// };
