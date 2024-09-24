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

      console.log(JSON.stringify(result, null, 2));

      var c = document.getElementById("map");
      var ctx = c.getContext("2d");

      // Set canvas size according to pitch size
      ctx.canvas.width = result[0]; // pitchWidth
      ctx.canvas.height = result[1]; // pitchHeight

      // Iterate over the result to draw players and ball
      for (let i = 2; i < result.length - 1; i++) {
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
          result[i],
          result[i + 1],
          i >= result.length - 3 ? ballSizeMultiplier : playerSizeMultiplier,
          0,
          2 * Math.PI
        );
        ctx.fill();
        i++; // Move to next pair of coordinates
      }

      // Update match information and result display
      matchInfo = result[result.length - 1];
      console.log("result", result);
      console.log("matchInfo", matchInfo);
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

      // Draw players and ball
      for (let i = 2; i < result.length - 1; i++) {
        ctx.beginPath();

        if (i < 24) {
          ctx.fillStyle = "red"; // Home team
        } else if (i >= 24 && i < result.length - 3) {
          ctx.fillStyle = "blue"; // Away team
        } else {
          ctx.fillStyle = "lime"; // Ball
        }

        ctx.arc(
          result[i],
          result[i + 1],
          i >= result.length - 3 ? ballSizeMultiplier : playerSizeMultiplier,
          0,
          2 * Math.PI
        );
        ctx.fill();
        i++;
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

      // Draw players and ball after switching sides
      for (let i = 2; i < result.length - 3; i++) {
        ctx.beginPath();

        ctx.arc(result[i], result[i + 1], playerSizeMultiplier, 0, 2 * Math.PI);

        if (i < 24) {
          ctx.fillStyle = "red"; // Home team
        } else if (i >= 24 && i < result.length - 3) {
          ctx.fillStyle = "blue"; // Away team
        } else {
          ctx.fillStyle = "lime"; // Ball
        }
        ctx.fill();
        i++;
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
