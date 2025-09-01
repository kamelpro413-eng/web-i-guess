// server.js
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;

const app = express();

// Replace with your values
const CLIENT_ID = "1411025062680854588"; // Your bot Client ID
const CLIENT_SECRET = "r5WKWVJYnOFIzNzo3zw9H7PRGUbbJkTi"; // ⚠️
const CALLBACK_URL = "http://localhost:3000/callback"; // Must match what you set in Developer Portal

// Session middleware
app.use(
  session({
    secret: "super-secret-key", // change this
    resave: false,
    saveUninitialized: false,
  })
);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(
  new DiscordStrategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      scope: ["identify", "guilds"],
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

// Routes
app.get("/", (req, res) => {
  res.send('<a href="/login">Login with Discord</a>');
});

app.get("/login", passport.authenticate("discord"));

app.get(
  "/callback",
  passport.authenticate("discord", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

app.get("/dashboard", (req, res) => {
  if (!req.user) return res.redirect("/");
  res.send(`
    <h1>Hello, ${req.user.username}#${req.user.discriminator}</h1>
    <p>You are in ${req.user.guilds.length} servers.</p>
    <a href="/logout">Logout</a>
  `);
});

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// Start server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
