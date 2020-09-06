// ===REQUIRE===
const express = require("express"),
  app = express(),
  mongoose = require("mongoose"),
  passport = require("passport"),
  bodyParser = require("body-parser"),
  User = require("./models/user"),
  LocalStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose");

// ===REQUIRE AND APP CONFIG AT ONCE EXAMPLE===
app.use(require("express-session")({
  secret: "Rusty is the best and cutest dog in the world",
  resave: false,
  saveUninitialized: false
}));

// ===APP CONFIG===
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
// need these two lines to use passport.js
app.use(passport.initialize());
app.use(passport.session());
// ADDED FOR FUN. THIS EXECUTES ON EVERY REQUEST. 
app.use((req, res, next) => {
  console.log("hello there");
  next();
});

//So we don't have to write the authenticate method ourself
passport.use(new LocalStrategy(User.authenticate()));
//These are responsible for reading the session, taking the data from the session and decoding it (deserializing it), and then encoding it (serializing it) to put back in the session. Note that without passport-local-mongoose we'd have to define these methods ourselves in the user.js file.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ===MONGOOSE TO MONGO CONFIG===
mongoose.connect('mongodb://localhost:27017/auth_demo', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to DB!'))
  .catch(error => console.log(error.message));

// ===ROUTES===

app.get("/", (req, res) => {
  res.render("home");
});

// isLoggedIn is middleware we created.
// note that all arguments after the first are handlers that will be executed in order.
app.get("/secret", isLoggedIn, (req, res) => {
  res.render("secret");
});

// AUTH ROUTES

//show sign up form
app.get("/register", (req, res) => {
  res.render("register");
});

// handle user sign up
app.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  // We make a new user object that isn't saved to the db yet
  // We only pass in username
  // We don't actually save the password to the db. 
  // User.register will take new user and then 'hash' the password (turns it into a huge string of #s and letters) and stores that in the database.
  User.register(new User({ username }), password, (err, user) => {
    if (err) {
      console.log(err);
      return res.render('register');
    } else {
      // this runs the serializer methods and starts a session
      // note: you can replace local with twitter or fb, etc.
      passport.authenticate("local")(req, res, () => {
        res.redirect('/secret');
      });
    }
  });
});

// LOGIN ROUTES

app.get("/login", (req, res) => {
  res.render("login");
});

//login logic
//middleware - code that runs before our final callback
// in this case, passport.auth... is our middleware
// just a refresher, the final argument is the handler aka callback function
app.post("/login", passport.authenticate("local", {
  successRedirect: "/secret",
  failureRedirect: "/login"
}), (req, res) => {
});

// LOGOUT ROUTES
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

// CHECK IF LOGGED IN
// THIS IS MIDDLEWARE WE CREATED
// MIDDLEWARE ALWAYS TAKES THESE 3 PARAMETERS
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

// SERVER
app.listen(3000, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("You're live, sir!");
  }
});