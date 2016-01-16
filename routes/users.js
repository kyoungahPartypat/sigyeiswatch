var express = require('express');
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var passport = require('passport');
var router = express.Router();

//require('../lib/passport').setup();

var connection = mysql.createConnection({
  host: 'sigyeiswatch.c3fm9fprnnz4.ap-northeast-1.rds.amazonaws.com',
  user: 'kyoungah',
  password: 'dbrud3489',
  database: 'sigyeiswatch'
});

/* GET users listing. */
router.get('/', function(req, res, next){  
  res.redirect('/users/login');
});

router.get('/join', function(req, res, next){
  
  res.render('users/join');
});

router.post('/join/emailCheck', function(req, res, next){
  var chk;
  connection.query("SELECT COUNT(email) as emailNum from users where email = ?", req.body.email, function(err, result){
 
    if(result[0].emailNum > 0){
      chk = "false";
    }else{
      chk = "true";
    }
    res.send(chk);
  });

});

router.post('/join/nameCheck', function(req, res, next){
  var chk;
  connection.query("SELECT COUNT(name) as nameNum from users where name = ?", req.body.name, function(err, result){
    
    if(result[0].nameNum > 0){
      chk = "false";
    }else{
      chk = "true";
    }
    res.send(chk);
  });
});

router.post('/join', function(req, res, next){

  var salt;

  bcrypt.genSalt(12, function(err, salt){
   salt = salt; 
   bcrypt.hash(req.body.password, salt, function(err, hash){
      console.log(hash);

      var user = {
        'email': req.body.email,
        'password': hash,
        'salt': salt,
        'name': req.body.name,
        'confirm' : 'N'
 
      };
      
      var query = connection.query('insert into users set ?', user, function(err, result){
        if(err) throw err;

        res.redirect('/users/login');
      });
    });
  });

});

router.get('/login', function(req, res, next){ 
  res.render('users/login', {user: req.user});
});

router.post('/login', passport.authenticate('local', {successRedirect:'/', failureRedirect:'login', failureFlash: true}));

router.get('/logout', function(req, res, next){
  req.logout();
  res.redirect('/');
});

module.exports = router;
