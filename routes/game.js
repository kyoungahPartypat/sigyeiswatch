var express = require('express');
var mysql = require('mysql');
var db = mysql.createConnection({
  host: 'sigyeiswatch.c3fm9fprnnz4.ap-northeast-1.rds.amazonaws.com',
  user: 'kyoungah',
  password: 'dbrud3489',
  database: 'sigyeiswatch'
});

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next){
  res.render('game');  
});

router.get('/peg_solitare', function(req, res, next){
  res.render('game/peg_solitare');
});

router.get('/knight', function(req,res,next){
  res.render('game/knight');
});


/*여자친구 겜*/
router.get('/girlfriend', function(req, res, next){
   db.query("SELECT * FROM girlfriend WHERE idx = ?", 0, function(err, result){
    if(result[0] !== undefined){   
      res.render('game/girlfriend', {title: "여자친구 강화 게임 - 시계 is 와치", result:result[0]});
    }else{
      res.render('game/girlfriend', {title:"여자친구 강화 게임 - 시계 is 와치", result:"false"});
    }
  });
});

router.post('/girlfriend/up', function(req, res, next){
   db.query("SELECT * FROM girlfriend WHERE idx = ?", req.body.idx, function(err, result){
    if(result[0] !== undefined){   
      res.send(result[0]);
    }else{
      res.send({result:"false"});
    }
  });
});

module.exports = router;
