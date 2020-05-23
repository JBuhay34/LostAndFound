// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();


// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/prompt", (request, response) => {
  response.sendFile(__dirname + "/views/screen2.html");
});

app.get("/inputfound", (request, response) => {
  response.sendFile(__dirname + "/views/inputfound.html");
});

app.get("/inputfoundlocation", (request, response) => {
  response.sendFile(__dirname + "/views/inputlocation.html");
});

app.get("/search?:item", (request, response) => {
  response.sendFile(__dirname + "/views/search.html");
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
