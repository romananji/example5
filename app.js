const express = require('express')
const app = express()
app.use(express.json())
const path = require('path')
const dbPath = path.join(__dirname, 'moviesData.db')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
let db = null

const getMovieFunction = function (dbObject) {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}
const initialisedbAndServer = async function () {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, function () {
      console.log('Server is started')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initialisedbAndServer()

app.get('/movies/', async function (request, response) {
  const getQuery = `SELECT movie_name FROM movie;`
  const resultArray = await db.all(getQuery)
  response.send(
    resultArray.map(function (each) {
      return {
        movieName: each.movie_name,
      }
    }),
  )
})

app.post('/movies/', async function (request, response) {
  const {directorId, movieName, leadActor} = request.body
  const postQuery = `
  INSERT INTO movie 
    (director_id,movie_name,lead_actor)
  VALUES
    (${directorId},"${movieName}","${leadActor}");
  `
  await db.run(postQuery)
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async function (request, response) {
  const {movieId} = request.params
  const getMovie = `
  SELECT 
    * 
  FROM 
    movie 
  WHERE 
    movie_id=${movieId};
  `
  const resultMovie = await db.get(getMovie)
  response.send(getMovieFunction(resultMovie))
})

app.put('/movies/:movieId/', async function (request, response) {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const putQuery = `
  UPDATE movie 
  SET director_id=${directorId},
      movie_name='${movieName}',
      lead_actor='${leadActor}'
  WHERE 
    movie_id=${movieId};
  `
  await db.run(putQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async function (request, response) {
  const {movieId} = request.params
  const deleteQuery = `
  DELETE FROM movie WHERE movie_id=${movieId};
  `
  await db.run(deleteQuery)
  response.send('Movie Removed')
})

app.get('/directors/', async function (request, response) {
  const getDirectorQuery = `SELECT * FROM director;`
  const resultQuery = await db.all(getDirectorQuery)
  response.send(
    resultQuery.map(function (each) {
      return {
        directorId: each.director_id,
        directorName: each.director_name,
      }
    }),
  )
})

app.get('/directors/:directorId/movies/', async function (request, response) {
  const {directorId} = request.params
  const directorMoviesQuery = `
  SELECT movie_name 
  FROM 
    movie 
  WHERE 
    director_id=${directorId};
  `
  const queryResult = await db.all(directorMoviesQuery)
  response.send(
    queryResult.map(function (each) {
      return {
        movieName: each.movie_name,
      }
    }),
  )
})

module.exports = app
