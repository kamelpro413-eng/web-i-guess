const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;

const app = express();

app.use(session({
    secret: "super-secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
    clientID: "1411025062680854588",
    clientSecret: "r5WKWVJYnOFIzNzo3zw9H7PRGUbbJkTi",
    callbackURL: "http://localhost:3000/callback",
    scope: ["identify", "guilds"]
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

// Login route
app.get("/login", passport.authenticate("discord"));

// Callback
app.get("/callback", passport.authenticate("discord", { failureRedirect: "/" }), (req, res) => {
    res.redirect("/public/dashboard.html");
});

// API to get servers
app.get("/api/servers", (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not logged in" });

    const userGuilds = req.user.guilds || [];
    res.json(userGuilds.map(g => ({ id: g.id, name: g.name })));
});

// Serve static frontend
app.use("/public", express.static("public"));

app.listen(3000, () => console.log("Dashboard running on http://localhost:3000"));
