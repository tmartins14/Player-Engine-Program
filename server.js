//------------------------
//    NPM Modules
//------------------------
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const async = require("async");
const http = require("http");
const footballEngine = require("./footballsimulationengine/engine"); // Create teams from this script
const matchInfo = {};
let its;

//---create a new express server-------
const app = express();
app.use(cookieParser());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

//------------------------
//    Express Endpoints
//------------------------
app.all("/", function (req, res) {
  return res.redirect("/match.html");
});

// Endpoint to start the game and initialize player positions
app.get("/getstartPOS", async function (req, res) {
  try {
    const pitchDetails = await readFile("./data/pitch.json");

    // Create the teams using the footballEngine's createTeam function
    const team1 = await footballEngine.createTeam("Slugs", "4-4-2");
    const team2 = await footballEngine.createTeam("Dragons", "4-4-2");

    footballEngine
      .initiateGame(team1, team2, pitchDetails)
      .then(function (matchSetup) {
        console.log("matchSetup:", matchSetup);

        matchInfo.matchSetup = matchSetup;
        console.log(matchSetup);
        processPositions(matchSetup.homeTeam, matchSetup.awayTeam, matchSetup)
          .then(function (sendArray) {
            res.send(sendArray);
          })
          .catch(function (error) {
            console.error("Error when processing positions: ", error);
          });
      })
      .catch(function (error) {
        console.error("Error: ", error);
      });
  } catch (error) {
    console.error("Error: ", error);
  }
});

// Endpoint to start the second half of the match
app.get("/startSecondHalf", function (req, res) {
  footballEngine
    .startSecondHalf(matchInfo.matchSetup)
    .then(function (matchSetup) {
      matchInfo.matchSetup = matchSetup;
      processPositions(matchSetup.homeTeam, matchSetup.awayTeam, matchSetup)
        .then(function (sendArray) {
          res.send(sendArray);
        })
        .catch(function (error) {
          console.error("Error when processing positions: ", error);
        });
    })
    .catch(function (error) {
      console.error("Error: ", error);
    });
});

// Endpoint for moving players and updating the game state
app.get("/movePlayers", function (req, res) {
  footballEngine
    .playIteration(matchInfo.matchSetup)
    .then(function (matchSetup) {
      its++;
      matchInfo.matchSetup = matchSetup;
      processPositions(matchSetup.homeTeam, matchSetup.awayTeam, matchSetup)
        .then(function (sendArray) {
          res.send(sendArray);
        })
        .catch(function (error) {
          console.error("Error when processing positions: ", error);
        });
    })
    .catch(function (error) {
      console.error("Error: ", error);
    });
});

// Endpoint to fetch current match details
app.get("/getMatchDetails", function (req, res) {
  console.log(matchInfo.matchSetup);
  res.send(matchInfo.matchSetup);
});

//------------------------
//   Functions
//------------------------
function readFile(filePath) {
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, "utf8", function (err, data) {
      if (err) {
        reject(err);
      } else {
        data = JSON.parse(data);
        resolve(data);
      }
    });
  });
}

function processPositions(kickOffTeam, secondTeam, matchDetails) {
  return new Promise(function (resolve, reject) {
    const sendArray = [];

    // Use pitch dimensions from matchDetails (updated pitch JSON)
    sendArray.push(matchDetails.field.pitchWidth);
    sendArray.push(matchDetails.field.pitchHeight);

    async.eachSeries(
      kickOffTeam.players,
      function eachPlayer(thisPlayer, callback) {
        sendArray.push(thisPlayer.currentPosition.x); // Use currentPosition for x
        sendArray.push(thisPlayer.currentPosition.y); // Use currentPosition for y
        callback();
      },
      function afterAllPlayersA() {
        async.eachSeries(
          secondTeam.players,
          function eachPlayer(thisPlayer, callback) {
            sendArray.push(thisPlayer.currentPosition.x); // Use currentPosition for x
            sendArray.push(thisPlayer.currentPosition.y); // Use currentPosition for y
            callback();
          },
          function afterAllPlayersB() {
            sendArray.push(matchDetails.ball.position.x); // Ball position x
            sendArray.push(matchDetails.ball.position.y); // Ball position y
            resolve(sendArray);
          }
        );
      }
    );
  });
}

//------------------------
//    Express HTTP
//------------------------

// Serve the files out of ./public as our main files
app.use(express.static("public"));

// Create an HTTP listener
http.createServer(app).listen(1442);
console.log("server starting on IP using port 1442 for HTTP");
