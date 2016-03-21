var express = require('express');
var path = require('path');
var fs = require('fs');
var multer = require('multer');
var mysql = require('mysql');
var Watch = require('../models/Watch');

var upload = multer({dest: 'uploads/'});
var join = path.join;
var connection = mysql.createConnection({
  host: 'sigyeiswatch.cca8wgdf70vy.ap-northeast-2.rds.amazonaws.com',
  user: 'kyoungah',
  password: 'dbrud3489',
  database: 'SigyeisWatch'
});

var router = express.Router();

function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()) {return next();}
  res.redirect('/users/login');
};

function list(req, res, next, find, fn){
  var perpage = 20;
  var page = Math.max(parseInt(req.param('page') || '1', 10), 1) -1;
  
  Watch.count(function(err, total){
    req.page = res.locals.page = {
      number:page,
      perpage:perpage,
      from:page*perpage,
      to:page * perpage + perpage -1,
      total:total,
      count:Math.ceil(total/perpage)
    };

    Watch.find(find).sort({_id:"desc"}).exec(function(err, rows){
      if(err) throw err;
 
      fn(null, rows);
    });
  });
};

router.get('/', ensureAuthenticated,  function(req, res, next) {
  connection.query("SELECT idx from adminUsers where idx = ?", req.user.idx, function(err, result){
    if(result[0]){
      req.user.admin = 'Y';
      res.render('admin/index',{title:'운영 게시판 - 시계 is 와치'});
    }else{
      res.redirect('/');
    }
  });
});

//메인 시계
router.get('/watch', ensureAuthenticated, function(req, res, next){
  if(req.user.admin){
    list(req, res, next, {}, function(err, rows){
      if(err) return err;
      res.render('admin/watch/index', {title:"운영 게시판 - 시계 is 와치", watchs:rows});
    });
  }else{
    res.redirect('/'); 
  }
});

router.get('/watch/upload', ensureAuthenticated, function(req, res, next){
  if(req.user.admin){

    res.render('admin/watch/upload', {title:"시계 업로드 - 시계 is 와치"}); 
  }else{
    res.redirect('/');
  }
});

router.post('/watch/upload', upload.single('watch'), function(req, res, next){
  var name = req.body.name;
  
  if(req.user.admin){
    var date = new Date();
    var img = req.file;
    var name = req.body.name;
    console.log(img);
    var newName = date.getTime() + "_" + img.originalname;
    var path = join("public/images/watch/", newName);
    var watch = new Watch({
      name: name,
      path: newName,
    });
    
    fs.rename(img.path, path, function(err){
      if(err) throw err;

      watch.save(function(err, doc){
        if(err) return next(err);
    
        res.redirect('/admin/watch');
      });
    });
  }else{
    res.redirect('/');
  }
});

//유저목록

//공지사항

//게시글 목록

module.exports = router;
