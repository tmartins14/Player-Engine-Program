// User Settings
var gamelength = 12000;
var speed = 100;
var matchInfo;
var its = 0;
var logs = "";
let loggingON = false;
var pause = false;
const playerSizeMultiplier = 4;
const ballSizeMultiplier = 3;

/**
 * Converts in-game player positions (relative to the pitch) to frontend coordinates.
 * The in-game coordinate system has (0, 0) at the center, while the frontend coordinate system has (0, 0) at the top left.
 *
 * @param {number} x - The player's in-game x position (center of the field is 0).
 * @param {number} y - The player's in-game y position (center of the field is 0).
 * @param {Object} pitchData - The pitch dimensions and coordinates.
 * @returns {Object} - The converted frontend coordinates.
 */
function convertToFrontendCoordinates(x, y, pitchData) {
  const { pitchWidth, pitchHeight } = pitchData;

  // Infer corners based on pitch dimensions (centered)
  const topLeftCorner = { x: 0, y: 0 };
  const bottomRightCorner = { x: pitchWidth, y: -pitchHeight };

  // Calculate the in-game pitch dimensions (width and height)
  const inGameWidth = bottomRightCorner.x - topLeftCorner.x;
  const inGameHeight = topLeftCorner.y - bottomRightCorner.y;

  // Scale the in-game x and y positions to the frontend coordinates (0, 0 in top-left)
  const scaledX = ((x + pitchWidth / 2) / inGameWidth) * pitchWidth;
  const scaledY = ((-y + pitchHeight / 2) / inGameHeight) * pitchHeight;

  return {
    x: scaledX,
    y: scaledY,
  };
}

/**
 * Initiates the match by fetching initial player positions and drawing the pitch and players.
 */
function startMatch() {
  setPositions();
}

/**
 * Fetches the starting positions of players and ball from the server and renders them on the canvas.
 */
function setPositions() {
  var http = new XMLHttpRequest();
  http.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      var result = JSON.parse(this.responseText);
      console.log(result);
      // Set canvas size according to pitch size
      var c = document.getElementById("map");
      var ctx = c.getContext("2d");
      ctx.canvas.width = result[0]; // pitchWidth
      ctx.canvas.height = result[1]; // pitchHeight

      const pitchData = {
        pitchWidth: result[0],
        pitchHeight: result[1],
        topLeftCorner: { x: -340, y: 525 },
        bottomRightCorner: { x: 340, y: -525 },
      };

      // Iterate over the result to draw players and ball
      for (let i = 2; i < result.length - 2; i += 2) {
        // Convert positions using the function
        const { x: convertedX, y: convertedY } = convertToFrontendCoordinates(
          result[i],
          result[i + 1],
          pitchData
        );

        ctx.beginPath();
        if (i < 24) {
          ctx.fillStyle = "red"; // Home team
        } else if (i >= 24 && i < result.length - 3) {
          ctx.fillStyle = "blue"; // Away team
        } else {
          ctx.fillStyle = "lime"; // Ball
        }

        // Draw the players and the ball
        ctx.arc(
          convertedX,
          convertedY,
          i >= result.length - 3 ? ballSizeMultiplier : playerSizeMultiplier,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }

      // Update match information and result display
      matchInfo = result[result.length - 1];
      document.getElementById(
        "result"
      ).innerHTML = `${matchInfo.homeTeam.name}: ${matchInfo.homeTeamStatistics.goals} - ${matchInfo.awayTeamStatistics.goals} : ${matchInfo.awayTeam.name}`;
    }
  };
  http.open("GET", "/getstartPOS", true);
  http.send();
}

/**
 * Pauses the game simulation.
 */
function pauseGame() {
  pause = true;
}

/**
 * Resumes the game simulation.
 */
function playGame() {
  pause = false;
  getMatch();
}

/**
 * Fetches and updates player positions on the pitch at regular intervals during the match.
 */
function getMatch() {
  const interval = setInterval(() => {
    if (pause) {
      clearInterval(interval); // Pause the game if needed
    } else if (its === gamelength / 2) {
      clearInterval(interval); // Halftime, switch sides
      switchSides();
      console.log("Switched sides at halftime.");
    } else if (its > gamelength) {
      clearInterval(interval); // End of the match
    } else {
      movePlayers("/movePlayers");
    }
  }, speed);
}

/**
 * Moves the players based on server-side simulation data and updates the canvas display.
 */
function movePlayers(endpoint) {
  var http = new XMLHttpRequest();
  http.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      its++; // Increment iteration count
      var result = JSON.parse(this.responseText);

      var c = document.getElementById("map");
      var ctx = c.getContext("2d");

      // Set canvas size according to pitch size
      ctx.canvas.width = result[0]; // pitchWidth
      ctx.canvas.height = result[1]; // pitchHeight

      const pitchData = {
        pitchWidth: result[0],
        pitchHeight: result[1],
        topLeftCorner: { x: -340, y: 525 },
        bottomRightCorner: { x: 340, y: -525 },
      };

      // Iterate over the result, applying coordinate conversion from index 2 to length - 2
      for (let i = 2; i < result.length - 2; i += 2) {
        const { x: convertedX, y: convertedY } = convertToFrontendCoordinates(
          result[i],
          result[i + 1],
          pitchData
        );

        ctx.beginPath();
        if (i < 24) {
          ctx.fillStyle = "red"; // Home team
        } else if (i >= 24 && i < result.length - 3) {
          ctx.fillStyle = "blue"; // Away team
        } else {
          ctx.fillStyle = "lime"; // Ball
        }

        ctx.arc(
          convertedX,
          convertedY,
          i >= result.length - 3 ? ballSizeMultiplier : playerSizeMultiplier,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }

      // Update match information and result display
      matchInfo = result[result.length - 1];
      logs += `Iteration ${its}: ${matchInfo.iterationLog.join(", ")}<br>`;
      if (loggingON) {
        document.getElementById("logging").innerHTML = logs;
      }
      document.getElementById(
        "result"
      ).innerHTML = `${matchInfo.homeTeam.name}: ${matchInfo.homeTeamStatistics.goals} - ${matchInfo.awayTeamStatistics.goals} : ${matchInfo.awayTeam.name} Moves(${its})`;
    }
  };
  http.open("GET", endpoint, true);
  http.send();
}

/**
 * Switches sides at halftime and updates the positions accordingly.
 */
function switchSides() {
  its++; // Increment iteration count
  var http = new XMLHttpRequest();
  http.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      var result = JSON.parse(this.responseText);
      var c = document.getElementById("map");
      var ctx = c.getContext("2d");

      ctx.canvas.width = result[0]; // pitchWidth
      ctx.canvas.height = result[1]; // pitchHeight

      const pitchData = {
        pitchWidth: result[0],
        pitchHeight: result[1],
        topLeftCorner: { x: -340, y: 525 },
        bottomRightCorner: { x: 340, y: -525 },
      };

      // Draw players and ball after switching sides
      for (let i = 2; i < result.length - 3; i += 2) {
        const { x: convertedX, y: convertedY } = convertToFrontendCoordinates(
          result[i],
          result[i + 1],
          pitchData
        );

        ctx.beginPath();
        ctx.arc(convertedX, convertedY, playerSizeMultiplier, 0, 2 * Math.PI);

        if (i < 24) {
          ctx.fillStyle = "red"; // Home team
        } else if (i >= 24 && i < result.length - 3) {
          ctx.fillStyle = "blue"; // Away team
        } else {
          ctx.fillStyle = "lime"; // Ball
        }
        ctx.fill();
      }

      // Update match information and result display
      matchInfo = result[result.length - 1];
      document.getElementById(
        "result"
      ).innerHTML = `${matchInfo.homeTeam.name}: ${matchInfo.homeTeamStatistics.goals} - ${matchInfo.awayTeamStatistics.goals} : ${matchInfo.awayTeam.name}`;
    }
  };
  http.open("GET", "/startSecondHalf", true);
  http.send();
}

/**
 * Toggles the visibility of the match logs on the page.
 */
function showlogs() {
  var x = document.getElementById("logging");
  if (x.style.display === "none") {
    x.style.display = "block";
    loggingON = true;
  } else {
    x.style.display = "none";
    loggingON = false;
  }
}

/**
 * Fetches match details from the server.
 */
function getMatchDetails() {
  var http = new XMLHttpRequest();
  http.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      console.log("Match details retrieved.");
    }
  };
  http.open("GET", "/getMatchDetails", true);
  http.send();
}
