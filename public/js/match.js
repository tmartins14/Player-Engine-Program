// User Settings
var gamelength = 12000;
var speed = 100;
// -----------------------
var matchInfo;
var its = 0;
var logs = "";
let loggingON = false;
var pause = false;
const playerSizeMultiplier = 4;
const ballSizeMultiplier = 3;

/**
 * This function is responsible for initiating the match visualization by calling the setPositions function.
 * It serves as a simple entry point to start displaying player positions and match statistics on the canvas,
 * typically called to start the match or to refresh the visualization at the beginning.
 *
 * Usage:
 * Called when a user initiates a match, usually linked to a UI element like a button to "Start Match".
 */
function startMatch() {
  setPositions();
}

/**
 * This function fetches the current positions of players and other game data from the server and visualizes it on a canvas.
 * It sends an HTTP GET request to the '/getstartPOS' endpoint, processes the JSON response to extract player positions,
 * and uses the HTML canvas API to draw player positions on the canvas. Each team's players are color-coded, and the game's
 * current score is updated in the DOM. The function handles different stages of the HTTP request and updates the UI upon
 * successful data retrieval.
 *
 * The canvas displays:
 * - Red dots for one team's players.
 * - Blue dots for the other team's players.
 * - A lime dot for the ball's position.
 * Player positions are updated based on their coordinates in the response array.
 *
 * Usage:
 * This function is likely called to update the positions on the UI periodically or after specific game events like a goal or half-time.
 */
function setPositions() {
  var http = new XMLHttpRequest();
  http.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      var result = JSON.parse(this.responseText);
      var c = document.getElementById("map");
      var ctx = c.getContext("2d");

      ctx.canvas.width = result[0];
      ctx.canvas.height = result[1];
      for (i = 2; i < result.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(result[i], result[i + 1]);
        // ctx.lineTo(result[i] + 2, result[i + 1] + 2);

        if (i < 24) {
          ctx.fillStyle = "red";
          ctx.arc(
            result[i],
            result[i + 1],
            2 * playerSizeMultiplier,
            0,
            2 * Math.PI
          );
        } else if (i > 12 && i < result.length - 3) {
          ctx.fillStyle = "blue";
          ctx.arc(
            result[i],
            result[i + 1],
            2 * playerSizeMultiplier,
            0,
            2 * Math.PI
          );
        } else {
          ctx.fillStyle = "lime";
          ctx.arc(
            result[i],
            result[i + 1],
            2 * ballSizeMultiplier,
            0,
            2 * Math.PI
          );
        }
        ctx.fill();
        i++;
      }
      ctx.moveTo(result[result.length - 3], result[result.length - 2]);
      ctx.lineTo(result[result.length - 3] + 1, result[result.length - 2] + 1);
      ctx.stroke();
      matchInfo = result[result.length - 1];
      document.getElementById("result").innerHTML =
        matchInfo.kickOffTeam.name +
        ": " +
        matchInfo.kickOffTeamStatistics.goals +
        " - " +
        matchInfo.secondTeamStatistics.goals +
        " :" +
        matchInfo.secondTeam.name;
    }
  };
  http.open("GET", "/getstartPOS", true);
  http.send();
}

function pauseGame() {
  pause = true;
}

function playGame() {
  pause = false;
  getMatch();
}

/**
 * This function manages the progression of a simulated match by repeatedly invoking player movement functions at a set interval.
 * It uses a JavaScript setInterval to schedule regular updates, which are controlled by several conditions:
 * 1. If the game is paused (`pause` is true), the interval is cleared, stopping further updates.
 * 2. If half of the game length is reached (`its` equals half of `gamelength`), it clears the interval, calls the `switchSides` function to switch sides, and logs the switch.
 * 3. If the game length exceeds the defined game length (`its` greater than `gamelength`), it stops the function to end the match.
 * 4. Otherwise, it calls `movePlayers` to simulate player movements.
 *
 * The function adjusts its behavior based on the `speed` variable, which defines how often the game state is updated.
 *
 * @global
 * - `pause` - A boolean that when true, pauses the game updates.
 * - `its` - A counter for the number of iterations or movements that have been processed.
 * - `gamelength` - The total length of the game in terms of iterations.
 * - `speed` - The interval in milliseconds at which the game updates are processed.
 */
function getMatch() {
  setInterval(function () {
    if (pause == true) {
      clearInterval();
    } else if (its === gamelength / 2) {
      clearInterval();
      switchSides();
      console.log("switched");
    } else if (its > gamelength) {
      return;
    } else {
      movePlayers("/movePlayers");
    }
  }, speed);
}

/**
 * Initiates an asynchronous request to the server to move players on the field and updates the game visualization on a canvas.
 * This function makes an HTTP GET request to a specified endpoint to retrieve the new positions of players and other game details.
 * Upon receiving the data, it updates the canvas to reflect the current positions of players and displays the latest game statistics.
 * This function also manages iteration logging and updates the UI to show the current score and iteration count.
 *
 * @param {string} endpoint - The server endpoint to which the HTTP GET request is made, usually associated with player movements or game updates.
 *
 * Usage:
 * Typically called periodically or in response to user actions to update the game state and refresh the visual representation of the match.
 */
function movePlayers(endpoint) {
  var http = new XMLHttpRequest();
  http.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      its++;
      var result = JSON.parse(this.responseText);
      console.log(result);
      var c = document.getElementById("map");
      var ctx = c.getContext("2d");
      ctx.canvas.width = result[0];
      ctx.canvas.height = result[1];
      for (i = 2; i < result.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(result[i], result[i + 1]);
        if (i < 24) {
          ctx.fillStyle = "red";
          ctx.arc(
            result[i],
            result[i + 1],
            2 * playerSizeMultiplier,
            0,
            2 * Math.PI
          );
        } else if (i > 12 && i < result.length - 3) {
          ctx.fillStyle = "blue";
          ctx.arc(
            result[i],
            result[i + 1],
            2 * playerSizeMultiplier,
            0,
            2 * Math.PI
          );
        } else {
          ctx.fillStyle = "lime";
          ctx.arc(
            result[i],
            result[i + 1],
            2 * ballSizeMultiplier,
            0,
            2 * Math.PI
          );
        }
        ctx.fill();
        i++;
      }
      matchInfo = result[result.length - 1];
      logs +=
        "Iteration " +
        its +
        ": " +
        result[result.length - 1].iterationLog +
        "<br>";
      if (loggingON) {
        document.getElementById("logging").innerHTML = logs;
      }
      document.getElementById("result").innerHTML =
        matchInfo.kickOffTeam.name +
        ": " +
        matchInfo.kickOffTeamStatistics.goals +
        " - " +
        matchInfo.secondTeamStatistics.goals +
        " :" +
        matchInfo.secondTeam.name +
        "   Moves(" +
        its +
        ")";
      var elem = document.getElementById("logging");
      elem.scrollTop = elem.scrollHeight;
    }
  };
  http.open("GET", endpoint, true);
  http.send();
}

/**
 * This function triggers a switch of sides for the teams at halftime in the simulation game. It sends an HTTP GET request to
 * the "/startSecondHalf" endpoint, processes the server's response to update player positions on a visual canvas, and updates
 * the display of match statistics. This function is typically invoked at halftime to reverse the playing directions of the teams.
 *
 * Usage:
 * Typically called at halftime to initiate the second half of the game with teams switching their playing ends.
 */
function switchSides() {
  its++;
  loggingArray = ["", "", "", "", "", "", "", "", "", ""];
  var http = new XMLHttpRequest();
  http.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      var result = JSON.parse(this.responseText);
      // console.log(result);
      var c = document.getElementById("map");
      var ctx = c.getContext("2d");
      ctx.canvas.width = result[0];
      ctx.canvas.height = result[1];
      for (i = 2; i < result.length - 3; i++) {
        ctx.beginPath();
        ctx.moveTo(result[i], result[i + 1]);
        // ctx.lineTo(result[i] + 4, result[i + 1] + 4);
        ctx.arc(
          result[i],
          result[i + 1],
          2 * playerSizeMultiplier,
          0,
          2 * Math.PI
        );
        if (i < 24) {
          ctx.fillStyle = "red";
        } else if (i > 12 && i < result.length - 3) {
          ctx.fillStyle = "blue";
        } else {
          ctx.fillStyle = "lime";
        }
        ctx.fill();
        i++;
      }
      ctx.moveTo(result[result.length - 3], result[result.length - 2]);
      ctx.lineTo(result[result.length - 3] + 1, result[result.length - 2] + 1);
      ctx.stroke();
      matchInfo = result[result.length - 1];
      document.getElementById("result").innerHTML =
        matchInfo.kickOffTeam.name +
        ": " +
        matchInfo.kickOffTeamStatistics.goals +
        " - " +
        matchInfo.secondTeamStatistics.goals +
        " :" +
        matchInfo.secondTeam.name;
    }
  };
  http.open("GET", "/startSecondHalf", true);
  http.send();
}

/**
 * This function toggles the visibility of the logging display on the webpage. It manages the display style of the HTML element
 * identified by the "logging" id, switching it between visible ('block') and hidden ('none'). Additionally, it updates a global
 * variable 'loggingON' to indicate the current state of the log visibility, which can be used elsewhere in the application to
 * control the logging behavior dynamically.
 *
 * Usage:
 * This function is typically bound to a button click or a similar event to allow users to show or hide logging information on demand.
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

function getMatchDetails() {
  var http = new XMLHttpRequest();
  http.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      // console.log("done");
    }
  };
  http.open("GET", "/getMatchDetails", true);
  http.send();
}
