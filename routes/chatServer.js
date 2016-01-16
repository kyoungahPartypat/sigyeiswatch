var express = require('express');
var http = require('http');
var path = require('path');
var mime = require('mime');

var router = express.Router();

/*
var httpServer = http.createServer(app).listen(8080, function(req, res){
   console.log("서버 시작!");
});
chatServer.listen(httpServer);
*/

function ensureAuthenticated(req, res, next) {
    // 로그인이 되어 있으면, 다음 파이프라인으로 진행
    if (req.isAuthenticated()) { return next(); }
    // 로그인이 안되어 있으면, login 페이지로 진행
    res.redirect('/users/login');
}

router.get('/', ensureAuthenticated, function(req, res, next){
  res.render("chat", {title:'로비'});
});

router.post('/', ensureAuthenticated, function(req, res, next){
  res.redirect('/chat/room');
});

router.get('/room', ensureAuthenticated, function(req, res, next){
  res.render('chat/chat');
});

module.exports = router;
