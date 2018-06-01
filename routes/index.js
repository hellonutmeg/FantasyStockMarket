var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});


var mongoose = require('mongoose');
var Trade = mongoose.model('Trade');
var Stock = mongoose.model('Stock');
var User = mongoose.model('User');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

// get all stocks
router.get('/stocks', function(req, res, next) {
  Post.find(function(err, stocks){
    if(err){ return next(err); }

    res.json(stocks);
  });
});

// create a new stock item
// RALC - note this will ultimately only be done via a REST api retrieving a list of stocks
router.post('/stocks', auth, function(req, res, next) {
  var stock = new Stock(req.body);

  post.save(function(err, post){
    if(err){ return next(err); }

    res.json(stock);
  });
});

// retrieve a specific stock item
// Preload stock objects on routes with ':stock'
router.param('stock', function(req, res, next, id) {
  var query = Stock.findById(id);

  query.exec(function (err, post){
    if (err) { return next(err); }
    if (!stock) { return next(new Error("can't find stock")); }

    req.stock = stock;
    return next();
  });
});

// update a stock item status to enabled (ie not included in the game)
// RALC - need to ensure that this is only accessible by admin users
router.put('/admin/stocks/:stock/enable', auth, function(req, res, next) {
    req.stock.enable(function(err, stock){
        if (err) { return next(err); }

        res.json(stock);
    });
});

// update a stock item status to disabled (ie not included in the game)
// RALC - need to ensure that this is only accessible by admin users
router.put('/admin/stocks/:stock/disable', auth, function(req, res, next) {
    req.stock.disable(function(err, stock){
        if (err) { return next(err); }

        res.json(stock);
    });
});

// get users trades
// RALC - need to add something here to only return trades where trader = logged in user
router.get('/trades', function(req, res, next) {
    Trade.find(function(err, trades){
        if(err){ return next(err); }

        res.json(trades);
    });
});

// get all trades (admin only)
// RALC - need to add something here to ensure user is an admin
router.get('/admin/trades', function(req, res, next) {
    Trade.find(function(err, trades){
        if(err){ return next(err); }

        res.json(trades);
    });
});

// post a new trade
router.post('/trades', auth, function(req, res, next) {
    var trade = new Trade(req.body);

    trade.trader = req.payload.username;

    trade.save(function(err, trade){
      if(err){ return next(err); }
      res.json(trade);
    });
});

// Preload trade objects on routes with trade:
router.param('trade', function(req, res, next, id) {
  var query = Trade.findById(id);

  query.exec(function (err, trade){
    if (err) { return next(err); }
    if (!trade) { return next(new Error("can't find trade")); }

    req.trade= trade;
    return next();
  });
});

/*
// create a new comment
router.post('/posts/:post/comments', auth, function(req, res, next) {
  var comment = new Comment(req.body);

  comment.post = req.post;
  comment.author = req.payload.username;

  comment.save(function(err, comment) {
      if (err) {
          return next(err);
      }

      req.post.comments.push(comment);
      req.post.save(function(err, post){

      if(err){
        console.log(err);
        return next(err); }

      res.json(comment._id);

    });
  });

});


// upvote a comment
router.put('/posts/:post/comments/:comment/upvote', auth, function(req, res, next) {
  req.comment.upvote(function(err, comment){
    if (err) { return next(err); }

    res.json(comment);
  });
});
*/

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }


  var user = new User();

  user.username = req.body.username;
  console.log(req.body.password);
  user.setPassword(req.body.password);
  console.log("here");
  user.save(function (err){
    if(err){ return next(err); }

    return res.json({token: user.generateJWT()})
  });
});

module.exports = router;
