const express = require("express");
const passport = require("passport");
const googleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User.model");
const router = express.Router();
const keys = require("../config/keys");

passport.use(new googleStrategy(
    {
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: "/auth/google/redirect"
    },
    accessToken => {
        console.log("access token:", accessToken);
    }
));

// register handle

router.get('/register', (req, res) => {
    res.render('register');
})

router.post('/register', (req, res) => {
    const {name, email, password, password2, secretid} = req.body;
    let errors = [];
    if (!name || !email || !secretid || !password || !password2) {
        errors.push({msg : "Please fill in all fields"});
    }
    if (!secretid && password != password2) {
        errors.push({msg : "Passwords don't match"});
    }

    if (errors.length > 0) {
        res.render('register', {
            errors : errors,
            name: name,
            email : email,
            password: password,
            password2: password2,
            secretid: secretid,
        })
    } else {
        User.findOne({email: email}).exec((err, user) => {
            console.log(user);
            if (user) {
                errors.push({msg: 'email is already registered'});
                res.render('register', {errors, name, email, password, password2, secretid});
            } else {
                const newUser = new User({
                    name: name,
                    email: email,
                    password: password,
                    secretid: secretid,
                });
                newUser.save()
                .then((value) => {
                    console.log(value);
                    res.redirect('/login');
                })
                .catch(value => console.log(value));
            }
        })
    }
});

// login handle

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', (req, res) => {
    const {name, password, secretid} = req.body;
    let errors = []
    if (!name || (!password && !secretid)) {
        errors.push({msg : "Empty field"});
    }
    if (errors.length > 0) {
        res.render('login', {errors, name, password});
    } else {
        if (!password) {
            User.findOne({name: name, secretid: secretid}).exec((err, user) => {
                console.log(user);
                if (user) {
                    res.redirect('/dashboard')
                } else {
                    errors.push({msg : "this account doesn't exist"});
                    res.render('login', {errors, name, secretid});
                }
            })
        }
        else
            {
            User.findOne({name: name, password: password}).exec((err, user) => {
                console.log(user);
                if (user) {
                    res.redirect('/dashboard')
                } else {
                    errors.push({msg : "this account doesn't exist"});
                    res.render('login', {errors, name, password});
                }
            })
        }
    }
});

// google Oauth

router.get("/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}));

router.get("/auth/google/redirect",passport.authenticate('google'));

// export function

module.exports = router;