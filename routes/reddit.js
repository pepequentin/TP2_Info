const express = require('express');
const snoowrap = require('snoowrap');
const simpleOAuth2Reddit = require('simple-oauth2-reddit');
const router = express.Router();

const r = new snoowrap({
  userAgent: 'A random string.',
  clientId: 'UtQiluuRlqp0Fw',
  clientSecret: 'NODE',
  refreshToken: 'NODE'
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

// reddit api

router.get('/auth', reddit.authorize);

router.get('/callback', reddit.accessToken, (req, res, next) => {
  accessToken = req.token;
  // console.log(accessToken);
  // return res.status(200).json(req.token);
  res.redirect('/dashboard')

});

router.get('/', async (req, res) => {
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

  friends[0].forEach((post) => {
    if (post.name.includes(friend_name) && friend_name !== "") {
      friend_list.push({
        date: epoch_to_human(post.date),
        name: post.name
      })
    }
  });

  res.render('reddit', { data, comments_list, nbr_comments, friend_list });
});

router.post('/', async (req, res) => {
  if (typeof req.body.new_sub !== "undefined") {
    subreddit = req.body.new_sub; // also change subreddit var in database
  }
  if (typeof req.body.select_nbr !== "undefined")
    nbr_posts = Number(req.body.select_nbr); // also change nbr_posts var in database
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

  friends[0].forEach((post) => {
    if (post.name.includes(friend_name) && friend_name !== "") {
      friend_list.push({
        date: epoch_to_human(post.date),
        name: post.name
      })
    }
  });

  res.render('reddit', { data, comments_list, nbr_comments, friend_list });
  //change db for user here
})

module.exports = router;