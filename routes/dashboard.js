// include for express
const express = require("express");
const router = express.Router();

//include for covid api
const novelCovid = require("novelcovid")
const bodyParser = require("body-parser");

//include for reddit api

const snoowrap = require("snoowrap");
const simpleOAuth2Reddit = require('simple-oauth2-reddit');

//include for youtube api

const YouTube = require('simple-youtube-api');
const youtube = new YouTube('AIzaSyD2AyAd-V2h3XI94DF4nLP42QF1FOkSoQY');

// include for weather api

const request = require("request");

// var for reddit api

const r = new snoowrap({
    userAgent: 'A random string.',
    clientId: 'UtQiluuRlqp0Fw',
    clientSecret: '1F6TFtRYGY41H-82BmrMnB12H0Nb7w',
    refreshToken: '684891759166-x72VPnb8K9FsytFfcIHxuUHh1jcL8A'
});

const reddit = simpleOAuth2Reddit.create({
    clientId: r.clientId,
    clientSecret: r.clientSecret,
    callbackURL: 'http://localhost:8081/reddit/callback',
    state: 'random-unique-string'
});

var subreddit = "AskReddit"; // default but need to access database to know user configuration
var subreddit_comments = "AskReddit";
var nbr_posts = 1; // default but need to access database to know user configuration
var nbr_comments = 1; // default but need to access database to know user configuration
var friend_name = ""
var accessToken = ""

function epoch_to_human(epoch) {
  var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
  d.setUTCSeconds(epoch);
  return d
}

// var for youtube api

var video_link = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; //change according to database
var video_title = "";
var video_channel = "";
var channel_link = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
var video_id = "";

let data = [];

// var for weather api

var apiKey = "c836ad18dbe51422b9acae135ba614cd";
var city = "rennes";
let url = 'http://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + apiKey;
var city_temp = 0;

// DashBoard
router.get('/', async (req, res) => {
    // COVID API
    const global = await novelCovid.all();
    const countries = await novelCovid.countries({sort: 'cases'})
    var ask_country = 0;

    for (const country of countries) {
        if (country.country === "France") {
            ask_country = country;
        }
    }

    request(url, { json: true }, (err, res, body) => {
      if (err) { return console.log(err); }
      city_temp = body.main.temp - 273.15;
    });

    // REDDIT API

    const subreddit_data = await r.getSubreddit(subreddit);
    const topPosts = await subreddit_data.getTop({time: 'day', limit: nbr_posts}); //change the 3 to number of top subreddit you want to see (bonus)
    const friends = await r.getFriends();
    const comments = await r.getNewComments(subreddit_comments)

    let data = [];
    let friend_list = [];
    let comments_list = [];

    topPosts.forEach((post) => {
        data.push({
        link: post.url,
        text: post.title,
        score: post.score
        })
    });

    comments.forEach((post) => {
        comments_list.push({
        title: post.link_title,
        name: post.author.name,
        text: post.body
        })
    });

    // friends[0].forEach((post) => {
    //     if (post.name.includes(friend_name) && friend_name !== "") {
    //     friend_list.push({
    //         date: epoch_to_human(post.date),
    //         name: post.name
    //     })
    //     }
    // });

    // YOUTUBE API

    await youtube.getVideo(video_link).then(post => {
        video_title = post.title;
        video_channel = post.channel.title;
    });

    await youtube.getVideo(channel_link).then(post => {
        video_id = post.id;
    });

    // DashBoard print
    res.render("dashboard", {global, countries, ask_country, video_title, video_channel, video_id, city_temp, city, data, comments_list, nbr_comments});
});

router.post('/', async (req, res) => {
    // COVID API
    const global = await novelCovid.all();
    const countries = await novelCovid.countries({sort: 'cases'})
    const update = ""

    var ask_country = '';
    if (typeof req.body.country !== "undefined") {
        ask_country = req.body.country;
    }
    for (const country of countries) {
        if (country.country.toString().localeCompare(ask_country.toString()) == 0) {
            ask_country = country;
            break;
        }
    }

    // YOUTUBE API

    if (typeof req.body.video !== "undefined") {
        video_link = req.body.video; // also change subreddit var in database
      }
    if (typeof req.body.channel !== "undefined") {
        channel_link = req.body.channel; // also change subreddit var in database
    }
    if (typeof req.body.city !== "undefined") {
      city = req.body.city; // also change subreddit var in database
      url = 'http://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + apiKey;
    }

    await youtube.getVideo(video_link).then(post => {
        video_title = post.title;
        video_channel = post.channel.title
    });

    await youtube.getVideo(channel_link).then(post => {
        video_id = post.id;
    });

    await request(url, { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        city_temp = body.main.temp - 273.15;
    });

    if (typeof req.body.new_sub !== "undefined") {
      subreddit = req.body.new_sub;
    }
    if (typeof req.body.select_nbr !== "undefined")
      nbr_posts = Number(req.body.select_nbr);
    if (typeof req.body.friend_name !== "undefined")
      friend_name = req.body.friend_name;
    if (typeof req.body.new_comment !== "undefined")
      subreddit_comments = req.body.new_comment;
    if (typeof req.body.nbr_comments !== "undefined")
      nbr_comments = req.body.nbr_comments;

    const subreddit_data = await r.getSubreddit(subreddit);
    const topPosts = await subreddit_data.getTop({time: 'day', limit: nbr_posts});
    const friends = await r.getFriends();
    const comments = await r.getNewComments(subreddit_comments)

    let data = [];
    let friend_list = [];
    let comments_list = [];

    topPosts.forEach((post) => {
      data.push({
        link: post.url,
        text: post.title,
        score: post.score
      })
    });

    comments.forEach((post) => {
      comments_list.push({
        title: post.link_title,
        name: post.author.name,
        text: post.body
      })
    });

    // friends[0].forEach((post) => {
    //   if (post.name.includes(friend_name) && friend_name !== "") {
    //     friend_list.push({
    //       date: epoch_to_human(post.date),
    //       name: post.name
    //     })
    //   }
    // });
    // res.render('dashboard', { data, comments_list, nbr_comments, friend_list });
    res.render("dashboard", {global, countries, ask_country, video_title, video_channel, video_id, city_temp, city, data, comments_list, nbr_comments});
});

module.exports = router;