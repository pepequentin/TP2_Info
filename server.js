// server.js

const express = require("express");
const app = express();
const connectDb = require("./connection");
const expressEjsLayout = require("express-ejs-layouts");
const User = require("./models/User.model");

const PORT = 8081;

// EJS

app.set("view engine", "ejs");
app.use(expressEjsLayout);

//  BodyParser

app.use(express.urlencoded({extended: false}));

// home

app.get("/", (req, res) => {
    res.render("home");
});

// routes

app.use('/', require('./routes/users'));
app.use('/dashboard', require("./routes/dashboard"));

app.listen(PORT, () => {
    console.log('Listening on port : ', PORT);
    connectDb().then(() => {
        console.log("MongoDb connected");
    }).catch((err) => {
        console.log(err);
    });
});