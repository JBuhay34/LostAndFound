// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const multer = require("multer");
const fs = require("fs");
// some of the ones we have used before
const bodyParser = require("body-parser");
// const sqlite3 = require('sqlite3');  // we'll need this later
const FormData = require("form-data");
// and some new ones related to doing the login process
const passport = require("passport");
// There are other strategies, including Facebook and Spotify
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Some modules related to cookies, which indicate that the user
// is logged in
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");

const request = require("request");

let storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, __dirname + "/images");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});
// let upload = multer({dest: __dirname+"/assets"});
let upload = multer({ storage: storage });
// Start setting up the Server pipeline
const app = express();
console.log("setting up pipeline");
const sql = require("sqlite3").verbose();
const db = new sql.Database("lostfound.db");
// take HTTP message body and put it as a string into req.body
app.use(bodyParser.urlencoded({ extended: true }));

// puts cookies into req.cookies
app.use(cookieParser());

// pipeline stage that echos the url and shows the cookies, for debugging.
app.use("/", printIncomingRequest);

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

//Set Up database
//create db if DNE
let cmd =
  " SELECT name FROM sqlite_master WHERE type='table' AND name='lostfoundtable'";
db.get(cmd, function(err, val) {
  console.log(err, val);
  if (val == undefined) {
    console.log("No database file - creating one");
    initDB();
  } else {
    console.log("Database file found");
  }
});

function initDB() {
  const cmd =
    "CREATE TABLE lostfoundtable ( rowIdNum INTEGER PRIMARY KEY, id TEXT, lostorfound TEXT, title TEXT, category TEXT, description TEXT, photourl TEXT, date FLOAT, endDate FLOAT, location TEXT)";
  db.run(cmd, function(err, val) {
    if (err) {
      console.log("failed to create LFtable", err.message);
    } else {
      console.log("Created database");
    }
  });
}
// Setup passport, passing it information about what we want to do
passport.use(
  new GoogleStrategy(
    // object containing data to be sent to Google to kick off the login process
    // the process.env values come from the key.env file of your app
    // They won't be found unless you have put in a client ID and secret for
    // the project you set up at Google
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      // CHANGE THE FOLLOWING LINE TO USE THE NAME OF YOUR APP
      callbackURL: "https://lost-and-found-steps.glitch.me/auth/accepted",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo", // where to go for info
      scope: ["profile", "email"] // the information we will ask for from Google
    },
    // function to call to once login is accomplished, to get info about user from Google;
    // it is defined down below.
    gotProfile
  )
);

// function that handles response from Google containint the profiles information.
// It is called by Passport after the second time passport.authenticate
// is called (in /auth/accepted/)

// Now some stages that decrypt and use cookies

// express handles decryption of cooikes, storage of data about the session,
// and deletes cookies when they expire
app.use(
  expressSession({
    secret: "bananaBread", // a random string used for encryption of cookies
    maxAge: 6 * 60 * 60 * 1000, // Cookie time out - six hours in milliseconds
    // setting these to default values to prevent warning messages
    resave: true,
    saveUninitialized: false,
    // make a named session cookie; makes one called "connect.sid" as well
    name: "ecs162-session-cookie"
  })
);

// Initializes request object for further handling by passport
app.use(passport.initialize());

// If there is a valid cookie, will call passport.deserializeUser()
// which is defined below.  We can use this to get user data out of
// a user database table, if we make one.
// Does nothing if there is no cookie
app.use(passport.session());

// stage to serve files from /user, only works if user in logged in

// If user data is populated (by deserializeUser) and the
// session cookie is present, get files out
// of /user using a static server.
// Otherwise, user is redirected to public splash page (/index) by
// requireLogin (defined below)
app.get("/user/*", requireUser, requireLogin, express.static("."));

// Now the pipeline stages that handle the login process itself

// Handler for url that starts off login with Google.
// The app (in public/index.html) links to here (note not an AJAX request!)
// Kicks off login process by telling Browser to redirect to Google.
app.get("/auth/google", passport.authenticate("google"));
// The first time its called, passport.authenticate sends 302
// response (redirect) to the Browser
// with fancy redirect URL that Browser will send to Google,
// containing request for profile, and
// using this app's client ID string to identify the app trying to log in.
// The Browser passes this on to Google, which brings up the login screen.

// Google redirects here after user successfully logs in.
// This second call to "passport.authenticate" will issue Server's own HTTPS
// request to Google to access the user's profile information with the
// temporary key we got from Google.
// After that, it calls gotProfile, so we can, for instance, store the profile in
// a user database table.
// Then it will call passport.serializeUser, also defined below.
// Then it either sends a response to Google redirecting to the /setcookie endpoint, below
// or, if failure, it goes back to the public splash page.
app.get(
  "/auth/accepted",
  passport.authenticate("google", {
    successRedirect: "/setcookie",
    failureRedirect: "/?email=notUCD"
  })
);

// One more time! a cookie is set before redirecting
// to the protected homepage
// this route uses two middleware functions.
// requireUser is defined below; it makes sure req.user is defined
// the second one makes a public cookie called
// google-passport-example
app.get("/setcookie", requireUser, function(req, res) {
  // if(req.get('Referrer') && req.get('Referrer').indexOf("google.com")!=-1){
  // mark the birth of this cookie

  // set a public cookie; the session cookie was already set by Passport
  res.cookie("google-passport-example", new Date());

  if (req.user.userData == 1) {
    res.redirect("/prompt");
  } else {
    res.redirect("/?email=notUCD");
  }
});

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/?email=notUCD", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/displayerror", (request, response) => {
  console.log("error message!");
});

app.get("/prompt", (request, response) => {
  response.sendFile(__dirname + "/views/screen2.html");
});

app.get("/inputfound", (request, response) => {
  response.sendFile(__dirname + "/views/inputfound.html");
});

app.get("/inputfoundlocation", (request, response) => {
  response.sendFile(__dirname + "/views/inputfoundlocation.html");
});


app.get("/inputseeker", (request, response) => {
  response.sendFile(__dirname + "/views/inputseeker.html");
});

app.get("/inputseekerlocation", (request, response) => {
  response.sendFile(__dirname + "/views/inputseekerlocation.html");
});

app.get("/resultsseeker", (request, response) => {
  response.sendFile(__dirname + "/views/results.html");
});

app.get("/searchseeker?:item", (request, response) => {
  response.sendFile(__dirname + "/views/searchseeker.html");
});

app.get("/searchfound?:item", (request, response) => {
  response.sendFile(__dirname + "/views/searchfound.html");
});



// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

function gotProfile(accessToken, refreshToken, profile, done) {
  console.log("Google profile", profile);
  // here is a good place to check if user is in DB,
  // and to store him in DB if not already there.
  // Second arg to "done" will be passed into serializeUser,
  // should be key to get user out of database.
  let dbRowID = 2;
  if (profile._json.hd === "ucdavis.edu") {
    dbRowID = 1;
  }

  if (dbRowID == 2) {
    request.get(
      "https://accounts.google.com/o/oauth2/revoke",
      {
        qs: { token: accessToken }
      },
      function(err, res, body) {
        console.log("revoked token");
      }
    );
  }
  // temporary! Should be the real unique
  // key for db Row for this user in DB table.
  // Note: cannot be zero, has to be something that evaluates to
  // True.

  done(null, dbRowID);
}

// Function for debugging. Just prints the incoming URL, and calls next.
// Never sends response back.
function printIncomingRequest(req, res, next) {
  console.log("Serving", req.url);
  if (req.url === "/?email=notUCD") {
    console.log("error message!");
    // res.send(req.url);
  }
  next();
}

// Part of Server's sesssion set-up.
// The second operand of "done" becomes the input to deserializeUser
// on every subsequent HTTP request with this session's cookie.
// For instance, if there was some specific profile information, or
// some user history with this Website we pull out of the user table
// using dbRowID.  But for now we'll just pass out the dbRowID itself.
passport.serializeUser((dbRowID, done) => {
  console.log("SerializeUser. Input is", dbRowID);
  done(null, dbRowID);
});

// Called by passport.session pipeline stage on every HTTP request with
// a current session cookie (so, while user is logged in)
// This time,
// whatever we pass in the "done" callback goes into the req.user property
// and can be grabbed from there by other middleware functions
passport.deserializeUser((dbRowID, done) => {
  console.log("deserializeUser. Input is:", dbRowID);
  // here is a good place to look up user data in database using
  // dbRowID. Put whatever you want into an object. It ends up
  // as the property "user" of the "req" object.
  let userData = { userData: dbRowID };
  done(null, userData);
});

function requireUser(req, res, next) {
  console.log("require user", req.user);
  if (!req.user) {
    res.redirect("/");
  } else {
    console.log("user is", req.user);
    next();
  }
}

function requireLogin(req, res, next) {
  console.log("checking:", req.cookies);
  if (!req.cookies["ecs162-session-cookie"]) {
    res.redirect("/");
  } else {
    next();
  }
}
// STACKOVERFLOW
function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
app.use(bodyParser.json());
app.post("/saveitem", function(request, response, next) {
  console.log("Server recieved", request.body);
  let id = makeid(24);
  console.log(id);
  let lostorfound = request.body.lostorfound;
  let title = request.body.title;
  let category = request.body.category;
  let description = request.body.description;
  let date = request.body.date;
  let endDate = request.body.endDate;
  let location = request.body.location;
  let photourl = request.body.photourl;
  // console.log("id: ",id,"image: ",image,"message: ",message,"color",color,"font", font
  // );

  // Insert new DB row
  cmd =
    "INSERT INTO lostfoundtable ( id , lostorfound, title, category , description, photourl, date , endDate , location ) VALUES (@0,@1,@2,@3,@4,@5,@6,@7,@8) ";
  db.run(
    cmd,
    id,
    lostorfound,
    title,
    category,
    description,
    photourl,
    date,
    endDate,
    location,
    function(err) {
      if (err) {
        console.log("DB error for new val", err.message);
        next();
      } else {
        let uniqid = id; // the rowid of last item
        response.send(uniqid);
      }
    }
  );
});
// Handle a post request to upload an image.
app.post("/upload", upload.single("newImage"), function(request, response) {
  console.log(
    "Recieved",
    request.file.originalname,
    request.file.size,
    "bytes"
  );
  let filename = "/images/" + request.file.originalname;
  if (request.file) {
    // file is automatically stored in /images,
    // even though we can't see it.
    // We set this up when configuring multer
    sendMediaStore(filename, request, response);
  } else throw "error";
});

// UPLOAD img
function sendMediaStore(filename, serverRequest, serverResponse) {
  let apiKey = process.env.ECS162KEY;
  if (apiKey === undefined) {
    serverResponse.status(400);
    serverResponse.send("No API key provided");
  } else {
    // we'll send the image from the server in a FormData object
    let form = new FormData();
    // we can stick other stuff in there too, like the apiKey
    form.append("apiKey", apiKey);
    // stick the image into the formdata object
    form.append("storeImage", fs.createReadStream(__dirname + filename));
    // and send it off to this URL
    form.submit("http://ecs162.org:3000/fileUploadToAPI", function(
      err,
      APIres
    ) {
      // did we get a response from the API server at all?
      if (APIres) {
        // OK we did
        console.log("API response status", APIres.statusCode);
        // the body arrives in chunks - how gruesome!
        // this is the kind stream handling that the body-parser
        // module handles for us in Express.
        let body = "";
        APIres.on("data", chunk => {
          body += chunk;
        });
        APIres.on("end", () => {
          // now we have the whole body
          if (APIres.statusCode != 200) {
            serverResponse.status(400); // bad request
            serverResponse.send(" Media server says: " + body);
          } else {
            serverResponse.status(200);
            serverResponse.send(body);
          }
        });
        fs.unlinkSync(__dirname + "/images/" + serverRequest.file.originalname);
      } else {
        // didn't get APIres at all
        serverResponse.status(500); // internal server error
        serverResponse.send("Media server seems to be down.");
      }
    });
  }
}

function getLostAndFound(request, response, next) {
  console.log(request.body);
  
  let cmd = "SELECT * FROM lostfoundtable";
  console.log(cmd);
  
  if(request.body.lostorfound === "Found") {
    cmd += " WHERE lostorfound='Found'";
    console.log(cmd);
  } else {
    cmd += " WHERE lostorfound='Found'";
    console.log(cmd);
  }
  if(request.body.category !== '') {
    cmd += " AND category='" + request.body.category + "'";
    console.log(cmd);
  }
  if(request.body.location !== '' && request.body.location !== null) {
    cmd += " AND location='" + request.body.location + "'";
    console.log(cmd);
  }
  if(request.body.date !== '' && request.body.date !== '0' && request.body.date !== 'NaN' && request.body.endDate !== 'NaN' && request.body.endDate !== '0') {
    cmd += " AND date BETWEEN '" + request.body.date + "'" + " AND '" + request.body.endDate + "'";
    console.log(cmd);
  }
  if((request.body.date !== '' && request.body.date !== '0' && request.body.date !== 'NaN') && (request.body.endDate === 'NaN' || request.body.endDate === '0')) {
    cmd += " AND date>='" + request.body.date + "'";
    console.log(cmd);
  }
  if((request.body.date === '' || request.body.date === '0' || request.body.date !== 'NaN') && request.body.endDate !== 'NaN' && request.body.endDate !== '0') {
    cmd += " AND endDate<='" + request.body.endDate + "'";
    console.log(cmd);
  }
  
  db.all(cmd, function(err, row) {
    if (err) {
      console.log("Database reading error", err.message);
      next();
    } else {
      // send shopping list to browser in HTTP response body as JSON
      response.json(row);
      // console.log("rows", row);
    }
  });
}
app.post("/getLostAndFound", getLostAndFound);


//map stuff
app.get("/getInfo", (req, res) => {
  res.json({text: "request success"});
});
// USE REVERSE GEOCODING TO GET ADDRESS
// SEE https://developers.google.com/maps/documentation/geocoding/intro#reverse-example
app.get("/getAddress", (req, res) => {
  let url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + req.query.lat + ", " + req.query.lng + "&key="
  + process.env.API_KEY;
  request(url, { json: true }, (error, response, body) => {
    if (error) { return console.log(error); }
    res.json(body);
  });
})


