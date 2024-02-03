const express = require("express");
const bodyPraser = require("body-parser");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());
const port = 3000;
const fs = require("fs");
const { Client, Pool } = require("pg");

app.use(bodyPraser.urlencoded({ extended: false }));

const users = { "administrator": "adminpass1234" };

const credentials = {
  user: "admin",
  host: "localhost",
  database: "api",
  password: "Admin1234",
  port: 5432,
};

app.use(express.static(__dirname + "/public"));

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = users[username];
  if (password === req.body.password) {
    jwt.sign({ username: username }, "secretkey", (err, token) => {
      res.status(200).json(token);
    });
  } else {
    res.sendStatus(200);
  }
});

function isAuthenticated(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    jwt.verify(bearerToken, "secretkey", (err, authData) => {
      if (err) res.sendStatus(403);
      else if (users[authData?.username]) next();
      else res.sendStatus(403);
    });
  } else {
    res.sendStatus(403);
  }
}

app.get("/api/data", isAuthenticated, function (req, res) {
  res.status(200);
});

app.get("/logout", (req, res) => {
  res.clearCookie("username");
});

app.get("/api/images/:Set", (req, res) => {
  fs.readdir(`public/images/${req.params.Set}`, (err, fileNames) => {
    if (err) {
      res.status(500).send("Error reading directory");
      return;
    }
    res.send(fileNames);
  });
});

app.get("/api/Biography/:filename", (req, res) => {
  fs.readFile(`public/Biography/${req.params.filename}`, (err, data) => {
    if (err) {
      res.status(500).send("Error getting data");
      return;
    }
    res.send(data);
  });
});

app.get("/api/Discography/:filename", (req, res) => {
  fs.readFile(`public/Discography/${req.params.filename}`, (err, jsondata) => {
    let disc = [];
    if (!err) disc = JSON.parse(jsondata);
    res.status(200).json(disc);
  });
});

app.get("/api/Discography", (req, res) => {
  fs.readdir(`public/Discography`, (err, fileNames) => {
    if (err) {
      res.status(500).send("Error reading directory");
      return;
    }
    res.send(fileNames);
  });
});

function getSong(req, res) {
  const id = parseInt(req.params.id);
  fs.readFile(
    `public/Discography/${req.params.filename}`,
    function (err, data) {
      let songs = [];
      if (!err) songs = JSON.parse(data);
      res.status(200).json(songs.filter((p) => p.id === id));
    },
  );
}

function addSong(req, res) {
  const { id, title, duration, artist } = req.body;
  const newSong = { id: parseInt(id), title, duration, artist };
  fs.readFile(
    `public/Discography/${req.params.filename}`,
    function (err, data) {
      let song = [];
      if (!err) song = JSON.parse(data);
      song.push(newSong);
      fs.writeFile(
        `public/Discography/${req.params.filename}`,
        JSON.stringify(song),
        function (err) {
          if (err) {
            res.status(200).json(`Error adding id: ${id}`);
          } else {
            res.status(200).json(`Song added with id: ${id}`);
          }
        },
      );
    },
  );
}

function updateSong(req, res) {
  const { id, title, duration, artist } = req.body;
  const aSong = { id: parseInt(id), title, duration, artist };
  fs.readFile(
    `public/Discography/${req.params.filename}`,
    function (err, data) {
      let song = [];
      if (!err) song = JSON.parse(data);
      const anIndex = song.findIndex((p) => p.id === aSong.id);
      if (anIndex < 0) {
        res.status(200).json(`Cannot find ID: ${id}`);
        return;
      }
      song[anIndex] = aSong;
      fs.writeFile(
        `public/Discography/${req.params.filename}`,
        JSON.stringify(song),
        function (err) {
          if (err) {
            res.status(200).json(`Error updating id: ${id}`);
          } else {
            res.status(200).json(`Updated id: ${id}`);
          }
        },
      );
    },
  );
}

function deleteSong(req, res) {
  const id = parseInt(req.body.id);
  fs.readFile(
    `public/Discography/${req.params.filename}`,
    function (err, data) {
      let song = [];
      if (!err) song = JSON.parse(data);
      const anIndex = song.findIndex((p) => p.id === id);
      if (anIndex < 0) {
        res.status(200).json(`Cannot find ID: ${id}`);
        return;
      }
      song.splice(anIndex, 1);
      fs.writeFile(
        `public/Discography/${req.params.filename}`,
        JSON.stringify(song),
        function (err) {
          if (err) {
            res.status(200).json(`Error deleting id: ${id}`);
          } else {
            res.status(200).json(`Deleted id: ${id}`);
          }
        },
      );
    },
  );
}

app.get("/api/Discography/:filename/:id", (req, res) => getSong(req, res));
app.post("/api/Discography/:filename", (req, res) => addSong(req, res));
app.put("/api/Discography/:filename/:id", (req, res) => updateSong(req, res));
app.delete("/api/Discography/:filename/:id", (req, res) => deleteSong(req, res));

const showResults = (response, error, results) => {
  if (error) {
    console.log(error);
    results.status(200).json([]);
  }
  response.status(200).json(results.rows);
};

async function getLinks(req, res) {
  const pool = new Pool(credentials);
  const text = `SELECT * FROM ${req.params.Table}`;
  pool.query(text, (error, results) => {
    if (error) {
      console.log(error);
      return;
    }
    showResults(res, error, results);
  });
}

async function addLink(req, res) {
  const { id, link, description } = req.body;
  const pool = new Pool(credentials);
  const text = `
      INSERT INTO ${req.params.Table} (id, link, description)
      VALUES ($1, $2, $3)
      RETURNING id`;
  const values = [id, link, description];
  return pool.query(text, values, (error, results) => {
    if (error) {
      console.log(error);
      return;
    }
    res.status(200).json(`Link added with ID: ${results.rows[0].id}`);
  });
}

async function updateLink(req, res) {
  const { id, link, description } = req.body;
  const pool = new Pool(credentials);
  const text = `UPDATE ${req.params.Table} SET (link, description) = 
                  ($2, $3) WHERE id = $1`;
  const values = [id, link, description];
  return pool.query(text, values, (error, results) => {
    if (error) {
      res.status(200).json(error);
      return;
    }
    res.status(200).json(`Link with ID: ${id} updated`);
  });
}

async function deleteLink(req, res) {
  const id = parseInt(req.body.id);
  const pool = new Pool(credentials);
  const text = `DELETE FROM ${req.params.Table} WHERE id = $1`;
  const values = [id];
  return pool.query(text, values, (error, results) => {
    if (error) {
      res.status(200).json(error);
      return;
    }
    res.status(200).json(`Link with ID: ${id} deleted`);
  });
}

app.get("/api/Links/:Table", (req, res) => getLinks(req, res));
app.post("/api/Links/:Table", (req, res) => addLink(req, res));
app.put("/api/Links/:Table/:id", (req, res) => updateLink(req, res));
app.delete("/api/Links/:Table/:id", (req, res) => deleteLink(req, res));

app.listen(port, function () {
  console.log("Listening on port:" + port);
});
