const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require("passport");
require("./config/passport")(passport);
const router = express.Router();
const app = express();
const expressEjsLayouts = require('express-ejs-layouts');

// mongoose
mongoose.connect('mongodb://mongo/test', {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log('connected,,'))
.catch((err) => console.log(err));

// express session
app.use(session({
    secret : 'secret',
    resave : true,
    saveUninitialized : true
}));

app.use(passport.initialize());
app.use(passport.session());

// use flash
app.use(flash());
app.use((req, res, next)=> {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

//EJS

app.set('view engine', 'ejs');
app.use(expressEjsLayouts);

// BodyParser

app.use(express.urlencoded({extended: false}));

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/user'));
app.use('/covid', require('./routes/covid'));
app.use('/youtube', require('./routes/youtube'));

// starting app

app.listen(8081, (req, res) => {
    console.log("connected on port 8081");
})