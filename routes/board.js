var express = require('express');
var mongoose = require('mongoose');
var board = require('../lib/board');
var router = express.Router();


function ensureAuthenticated(req, res, next) {
    // 로그인이 되어 있으면, 다음 파이프라인으로 진행
    if (req.isAuthenticated()) { return next(); }
    // 로그인이 안되어 있으면, login 페이지로 진행
    res.redirect('/users/login');
}



board.select('free');
board.perpage(10);

/* GET home page. */
router.get('/', function(req, res, next) {
  
  board.list(req, res, next, function(err, rows){

    if(err) return err;
    res.render('free', {rows:rows});
  });
     
});

router.get("/detail", function(req, res, next){
  var id = req.param('id');
  var page = req.param('page');

  board.detail(id, page, function(err, row){

    if(err) return err;

    if(row != "noResult"){
      res.render('free/detail', {row:row});
    }else{
      res.redirect('/free');
    }
  });
});

router.get("/comment", function(req, res, next){
  board.commentList(req, res, next, function(err, rows){
    if(err) return err;
 
    res.send({comment:rows, page:req.cPage});
  });
});

router.get("/like/:id", function(req, res, next){
  var id = req.params.id;

  board.readLike(id, function(err, row){
    if(err) return err;
    
    res.send({goods:row});
  });
});

router.post("/like/:id", function(req, res, next){
    var id = req.params.id;
    var name = req.body.name;

    board.like(id, name, function(err, data){
      if(err) return err;
 
      res.send({ok: data});
    }); 
});

router.post('/comment/:id', function(req, res, next){
  var id = req.params.id;
  var name = req.user.name;
  var comment = req.body.text;
  board.comment(id, name, comment, function(err, data){
    if(err) return err;

    res.send(data);
  });
});

router.post('/reComment/:id', function(req, res, next){
  var id = req.params.id;
  var name = req.user.name;
  var cId = req.body.grp;
  var comment = req.body.comment;
 
  board.childComment(id, cId, name, comment);
  res.send(id);
});


router.get('/write',ensureAuthenticated, function(req, res, next){
  res.render('free/write');
})

router.post('/write', function(req, res, next){
  var name = req.user.name;
  var title = req.body.title;
  var content = req.body.content; 
  board.write(name, title, content);
  /*
  board.count(req, res, next, 10);
  
  board.list(req, res, next, function(err, rows){
    var page = req.page;
    if(err) return err;
    console.log(req.page);
    res.render('free', {rows:rows});
  });
  */
  res.redirect('/free');
});

module.exports = router;


