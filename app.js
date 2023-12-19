const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
let db = null;
const initalizeDBAndServer = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, "cricketMatchDetails.db"),
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initalizeDBAndServer();
const dbOjectToResponseObject = (player) => {
  return {
    playerId: player.player_id,
    playerName: player.player_name,
  };
};
app.get("/players/", async (request, response) => {
  const getPlayers = `
    SELECT * FROM player_details
    ORDER BY player_id;`;
  const playersArray = await db.all(getPlayers);
  response.send(playersArray.map((player) => dbOjectToResponseObject(player)));
});
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerById = `
    SELECT * FROM player_details
    WHERE player_id = ${playerId};
    `;
  const player = await db.get(getPlayerById);
  response.send({
    playerId: player.player_id,
    playerName: player.player_name,
  });
});
app.post("/players/:playerId/", async (request, response) => {
  const playerName = request.body;
  const addPlayer = `
    INSERT INTO player_details
    (player_name)
    VALUES(
        '${playerName}'
    );
    `;
  await db.run(addPlayer);
  response.send("Player Details Updated");
});
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchById = `SELECT * FROM match_details
    WHERE match_id = ${matchId}`;
  const matchDetails = await db.get(getMatchById);
  response.send({
    matchId: matchDetails.match_id,
    match: matchDetails.match,
    year: matchDetails.year,
  });
});

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const joinTablesQuery = `
    SELECT * FROM match_details
    NATURAL JOIN player_match_score;
    `;
  // WHERE player_id = ${playerId}
  const matchDetails = await db.get(joinTablesQuery);
  console.log(matchDetails);
  response.send({
    matchId: matchDetails.match_id,
    match: matchDetails.match,
    year: matchDetails.year,
  });
});
