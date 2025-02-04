import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import topMusicData from "./data/top-music.json";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-mongo"; 
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true }); // connection. Using the method connect, passing on the url and then the parameter object
mongoose.Promise = Promise;

//model how your data set will look like
const Song = mongoose.model("Song", {
  "id": Number,
  "trackName": String,
  "artistName": String,
  "genre": String,
  "bpm": Number,
  "energy": Number,
  "danceability": Number,
  "loudness": Number,
  "liveness": Number,
  "valence": Number,
  "length": Number,
  "acousticness": Number,
  "speechiness": Number,
  "popularity": Number
});


//map out all data from our json into our db
if (process.env.RESET_DB) {
    const resetDataBase = async () => {
    await Song.deleteMany();
    topMusicData.forEach(singleSong => {
    const newSong = new Song (singleSong);
    newSong.save();
   })
  }
  resetDataBase();
}

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Start defining your routes here
app.get("/", (req, res) => {
  res.status(200).json({
    Hello: "Here you can see all my routes!",
    Routes: [
      { "/songs": "All the song data" },
      { "/songs/id/:id": "A specific song, for instance use id 637f5d218aae5dd90801358b" },
      { "/songs/?danceability=70" : "or instead of 70 try another pase for instace 50"},
      { "/songs/?genre=pop" : "or instead of pop try another genre, for instance trap music"},
    ],
  });
});

// app.get("/songs", async (req, res) => {
//   const allTheSongs = await Song.find({}); //Song is the model variable
//   res.status(200).json({
//     success: true,
//     body: allTheSongs
//   });
// });


//get a single song by using findById
app.get("/songs/id/:id", async (req, res) => {
  try {
    const singleSong = await Song.findById(req.params.id);
    if (singleSong) {
      res.status(200).json({
        success: true,
        body: singleSong
      });
    } else {
      res.status(404).json({
        success: false,
        body: {
        message: "Could not find the song"
        }
      });
    }
  } catch(error) {
    res.status(400).json({
      success: false,
      body: {
      message: "Invalid id"
      }
    });
  }
});

app.get("/songs/", async (req, res) => {

  const {genre, danceability} = req.query;
  const response = {
    success: true,
    body: {}
  }
  const matchAllRegex = new RegExp(".*");  //.* regular expre meaning match any genre
  const genreQuery = genre ? genre : matchAllRegex;
  const danceabilityQuery = danceability ? danceability : /.*/;

  try {
      response.body = await Song.find({genre: genreQuery, danceability: danceabilityQuery}).limit(2).sort({energy: 1}).select({trackName: 1, artistName: 1})
   
      res.status(200).json({
        success: true,
        body: response
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        body: {
        message: error
        }
      });
    }
  
  });

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});