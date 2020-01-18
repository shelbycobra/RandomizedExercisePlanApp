const mysql = require('mysql');
const cors = require('cors')
const express = require('express')

const hostname = '127.0.0.1';
const port = process.env.PORT || 8080;

const app = express();

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "exercises"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/getexercisebytag', (req, res) => {

  const tag = req.body.tag;
  const currentExercises = req.body.exercises;

  console.log("\n\n\n\nCurrent Exercises: " + currentExercises);
  console.log("Tag: " + tag);

  //Send back database info and generate plan on FE.
  con.query(`SELECT name, equipment FROM exercises WHERE tags LIKE '%${tag}%';`, (err, result) => {
    if(err) {
      return res.send(err);
    } else {
      const numResults = result.length;
      var randomExercise = "";

      var count = 0;

      while(true) {
        var randomIndex = Math.floor(Math.random() * numResults);
        randomExercise = result[randomIndex];
        var resultIndex = currentExercises.indexOf(JSON.stringify(randomExercise));

        console.log("\nGeting exercise from database ...\n");
        console.log("Random index: " + randomIndex);
        console.log("Random Exercise: " + randomExercise.name);
        console.log("Current Exercises Index: " + resultIndex);

        count++;

        if (resultIndex === -1)
          break;
        if (count === numResults) {
          // Returns null object if loop iterates over all tagged exercises
          // and all are currently being used.
          return res.json({ data : { name : null, equipment: null }})
        }
      }

      return res.json({ data : randomExercise })
    }
  });

})

// get all tags
app.get('/tags', (req, res) => {
  con.query(`SELECT DISTINCT tags FROM exercises;`, (err, result) => {
    if(err) {
      return res.send(err);
    } else {
      var tagsArr = [];

      for(var i = 0; i < result.length; i++) {
        const tags = result[i].tags.split(",");
        tagsArr = tagsArr.concat(tags);
      }

      let uniqueTags = (tags) => tags.filter((v,i) => tags.indexOf(v) === i)

      return res.json({ data : uniqueTags(tagsArr) })
    }
  });
})

app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
})
