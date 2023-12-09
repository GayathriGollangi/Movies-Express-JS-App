const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const ConvertMovieDbAPI = (movieObject) => {
  return {
    movieId: movieObject.movie_id,
    directorId: movieObject.director_id,
    movieName: movieObject.movie_name,
    leadActor: movieObject.lead_actor,
  };
};

const ConvertDirectorbAPI = (directorObject) => {
  return {
    directorId: directorObject.director_id,
    directorName: directorObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    ORDER BY
      movie_id;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(moviesArray.map((eachPlayer) => ConvertMovieDbAPI(eachPlayer)));
});

//get player

// app.get("/movies/:movieId/", async (request, response) => {
//   const { movieId } = request.params;
//   const getMovieQuery = `
//     select
//         *
//    from
//       movie
//     where
//      movie_id = ${movieId};
//     `;
//   const movieQuery = await db.get(getMovieQuery);

//   response.send(ConvertMovieDbAPI(movieQuery));
// });

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMoviesQuery = `select * from movie where movie_id = ${movieId};`;
  const moviesArray = await db.get(getMoviesQuery);
  response.send(ConvertMovieDbAPI(moviesArray));
});

//post
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO
      movie (director_id,movie_name,lead_actor)
    VALUES
      (
        '${directorId}',
         '${movieName}',
         '${leadActor}'
      );`;
  const dbResponse = await db.run(addMovieQuery);
  const playerId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `update movie set director_id = ${directorId},
  movie_name = '${movieName}', lead_actor = '${leadActor}' where movie_id = ${movieId};`;
  const updateMovieQueryResponse = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5
//Deletes a movie from the movie table based on the movie ID

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `delete from movie where movie_id = ${movieId};`;
  const deleteMovieQueryResponse = await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API 6
//Returns a list of all directors in the director table
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
      *
    FROM
      director
    ORDER BY
      director_id;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachPlayer) => ConvertDirectorbAPI(eachPlayer))
  );
});
//API 7
//Returns a list of all movie names directed by a specific director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieNamesQuery = `select movie_name as movieName from movie where 
  director_id = ${directorId};`;
  const movieNamesArray = await db.all(getMovieNamesQuery);
  response.send(movieNamesArray);
});
module.exports = app;
