var express = require('express');
var http = require('http');
var path = require('path');
var mime = require('mime');

var router = express.Router();

function ensureAuthenticated(req, res, next) {
    // 로그인이 되어 있으면, 다음 파이프라인으로 진행
    if (req.isAuthenticated()) { return next(); }
    // 로그인이 안되어 있으면, login 페이지로 진행
    req.session.returnTo = "/chat";
    res.redirect('/users/login');
}
 
router.get('/', ensureAuthenticated, function(req, res, next){
  res.render("chat", {title:'로비'});
});

router.post('/', ensureAuthenticated, function(req, res, next){
  if(req.body.type == "warewolf"){
    res.redirect('/chat/warewolf');
  }else{
    res.redirect('/chat/omok');
  }
});

router.get('/rule', ensureAuthenticated, function(req, res, next){
  res.render('chat/rule');
});

router.get('/warewolf', ensureAuthenticated, function(req, res, next){
  res.render('chat/warewolf');
});

router.get('/omok', ensureAuthenticated, function(req, res, next){
  res.render('chat/omok');
});


module.exports = router;
