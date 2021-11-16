// connection.js

const mongoose = require("mongoose");
const User = require("./models/User.model");


// location of the database and mongo-test = name of database
const connection = "mongodb://mongo/mongo-test";

const connectDb = () => {
    return mongoose.connect(connection, {useNewUrlParser: true, useUnifiedTopology: true});
}

module.exports = connectDb;