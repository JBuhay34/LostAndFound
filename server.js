// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");

// some of the ones we have used before
const bodyParser = require("body-parser");
// const sqlite3 = require('sqlite3');  // we'll need this later

// and some new ones related to doing the login process
const passport = require("passport");
// There are other strategies, including Facebook and Spotify
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Some modules related to cookies, which indicate that the user
// is logged in
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");

const request = require("request");

// Start setting up the Server pipeline
const app = express();
console.log("setting up pipeline");

// take HTTP message body and put it as a string into req.body
app.use(bodyParser.urlencoded({ extended: true }));

// puts cookies into req.cookies
app.use(cookieParser());

// pipeline stage that echos the url and shows the cookies, for debugging.
app.use("/", printIncomingRequest);

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

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
  if(req.url === "/?email=notUCD") {
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
