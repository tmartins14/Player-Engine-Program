// NEW

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
// Endpoint to start the game and initialize player positions
app.get("/getstartPOS", async function (req, res) {
  try {
    const pitchDetails = await readFile("./data/pitch.json");

    // Create the teams using the footballEngine's createTeam function
    const team1 = await footballEngine.createTeam("Slugs", "4-4-2");
    const team2 = await footballEngine.createTeam("Dragons", "4-4-2");

    footballEngine
      .initiateGame(team1, team2, pitchDetails) // Pass pitchDetails from pitch.json
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
        console.error("Error initiating game: ", error);
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
  // Call playIteration to simulate the next frame
  footballEngine
    .playIteration(matchInfo.matchSetup)
    .then(({ match, matchDetails }) => {
      // Destructure the result from playIteration
      its++; // Increment iteration counter

      // Update the match object in matchInfo with the new state of home/away teams and ball position
      matchInfo.matchSetup = match; // Update the match object directly

      // Process the positions to create the send array (send updated positions to the front end)
      processPositions(
        match.homeTeam, // Updated home team
        match.awayTeam, // Updated away team
        matchInfo.matchSetup // Use the updated match info
      )
        .then((sendArray) => {
          res.send(sendArray); // Send the updated positions back to the client
        })
        .catch((error) => {
          console.error("Error when processing positions: ", error);
        });
    })
    .catch((error) => {
      console.error("Error during playIteration: ", error);
      res.status(500).send("Error during playIteration");
    });
});

// Endpoint to fetch current match details
app.get("/getMatchDetails", function (req, res) {
  //   console.log(matchInfo.matchSetup);
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

function processPositions(homeTeam, awayTeam, matchDetails) {
  return new Promise(function (resolve, reject) {
    const sendArray = [];

    // Push the pitch dimensions
    sendArray.push(matchDetails.field.width);
    sendArray.push(matchDetails.field.length);

    // Process the homeTeam's player positions and details
    homeTeam.players.forEach((player) => {
      sendArray.push(player.currentPosition.x); // Player's x position
      sendArray.push(player.currentPosition.y); // Player's y position
    });

    // Process the awayTeam's player positions and details
    awayTeam.players.forEach((player) => {
      sendArray.push(player.currentPosition.x); // Player's x position
      sendArray.push(player.currentPosition.y); // Player's y position
    });

    // Add ball position (x, y)
    sendArray.push(matchDetails.ball.position.x);
    sendArray.push(matchDetails.ball.position.y);

    // Add the match details object, including players and statistics
    sendArray.push({
      homeTeam: {
        name: homeTeam.name,
        rating: homeTeam.rating,
        players: homeTeam.players.map((player) => ({
          name: player.name,
          position: player.position,
          rating: player.stats.rating,
          skill: {
            passing: player.stats.passing,
            shooting: player.stats.shooting,
            tackling: player.stats.defending,
            saving: player.stats.saving,
            agility: player.stats.dribbling,
            strength: player.stats.physical,
            penalty_taking: player.stats.shooting, // Assuming penalty_taking as a subset of shooting
            jumping: player.stats.physical, // Assuming jumping is part of physical
          },
          startPOS: [player.currentPosition.x, player.currentPosition.y], // Start position
          fitness: player.fitness,
          injured: player.injured,
          originPOS: [player.currentPosition.x, player.currentPosition.y], // Origin position
          relativePOS: [player.currentPosition.x, player.currentPosition.y], // Relative position (as per gameplay)
          action: player.action || "none", // Player's action (default to none)
          offside: player.isOffside || false, // Offside flag
          hasBall: player.hasBall || false, // Has ball flag
          cards: {
            yellow: player.yellowCards || 0,
            red: player.redCards || 0,
          },
        })),
        intent: homeTeam.intent || "attack",
      },
      awayTeam: {
        name: awayTeam.name,
        rating: awayTeam.rating,
        players: awayTeam.players.map((player) => ({
          name: player.name,
          position: player.position,
          rating: player.stats.rating,
          skill: {
            passing: player.stats.passing,
            shooting: player.stats.shooting,
            tackling: player.stats.defending,
            saving: player.stats.saving,
            agility: player.stats.dribbling,
            strength: player.stats.physical,
            penalty_taking: player.stats.shooting, // Assuming penalty_taking as a subset of shooting
            jumping: player.stats.physical, // Assuming jumping is part of physical
          },
          startPOS: [player.currentPosition.x, player.currentPosition.y], // Start position
          fitness: player.fitness,
          injured: player.injured,
          originPOS: [player.currentPosition.x, player.currentPosition.y], // Origin position
          relativePOS: [player.currentPosition.x, player.currentPosition.y], // Relative position (as per gameplay)
          action: player.action || "none", // Player's action (default to none)
          offside: player.isOffside || false, // Offside flag
          hasBall: player.hasBall || false, // Has ball flag
          cards: {
            yellow: player.yellowCards || 0,
            red: player.redCards || 0,
          },
        })),
        intent: awayTeam.intent || "defend",
      },
      pitchSize: [
        matchDetails.field.pitchWidth,
        matchDetails.field.pitchHeight,
      ],
      ball: {
        position: [
          matchDetails.ball.position.x,
          matchDetails.ball.position.y,
          0,
        ], // Ball position
        withPlayer: matchDetails.ball.withPlayer || false,
        Player: matchDetails.ball.Player || null,
        withTeam: matchDetails.ball.withTeam || null,
        direction: matchDetails.ball.direction || "unknown",
        ballOverIterations: matchDetails.ball.ballOverIterations || [],
      },
      half: matchDetails.half || 1, // Current match half
      homeTeamStatistics: matchDetails.homeTeamStatistics || {
        goals: 0,
        shots: 0,
        corners: 0,
        freekicks: 0,
        penalties: 0,
        fouls: 0,
      },
      awayTeamStatistics: matchDetails.awayTeamStatistics || {
        goals: 0,
        shots: 0,
        corners: 0,
        freekicks: 0,
        penalties: 0,
        fouls: 0,
      },
      iterationLog: matchDetails.iterationLog || [],
    });

    resolve(sendArray);
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
