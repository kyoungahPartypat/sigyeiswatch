var express = require('express');
var mysql = require('mysql');
var redis = require('redis');
var Girlfriend = require('../models/Girlfriend');

var db = mysql.createConnection({
  host: 'sigyeiswatch.cca8wgdf70vy.ap-northeast-2.rds.amazonaws.com',
  user: 'kyoungah',
  password: 'dbrud3489',
  database: 'SigyeisWatch'
});

var client = redis.createClient(6379, "127.0.0.1");
client.on('connect', function(){
  console.log('connected');
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
   db.query("SELECT * FROM girlfriends WHERE idx = ?", 0, function(err, result){
    if(result[0] !== undefined){   
      res.render('game/girlfriend', {title: "여자친구 강화 게임 - 시계 is 와치", result:result[0]});
    }else{
      res.render('game/girlfriend', {title:"여자친구 강화 게임 - 시계 is 와치", result:"false"});
    }
  });
});

router.get('/girlfriend/up', function(req, res, next){
   db.query("SELECT * FROM girlfriends WHERE idx = ?", req.query.idx, function(err, result){
    if(result[0] !== undefined){   
      res.send(result[0]);
    }else{
      res.send({result:"false"});
    }
  });
});

router.post('/girlfriend/save', function(req, res, next){
    var board1 = "richRank";
    var board2 = "levelRank";
    var rich = req.body.money + req.body.noFarewell + req.body.present + req.body.coupling + req.body.car + req.body.house + req.body.land;
    var id = req.user.name;   

    client.zadd(board1, rich, id);
    client.zadd(board2, req.body.idx, id);

    Girlfriend.findOne({name:req.user.name}, function(err, row){
      if(row !== null){
         Girlfriend.update({name:req.user.name}, {$set:{level:req.body.idx, money:req.body.money, noFarewell: req.body.noFarewell, present: req.body.present, coupling: req.body.coupling, car: req.body.car, house:req.body.house, land:req.body.land}}, function(err, r){
           res.send({result: "saved"}); 
         });
      }else{
        Girlfriend.create({ name:req.user.name, level:req.body.idx, money:req.body.money, noFarewell: req.body.noFarewell, present: req.body.present, coupling: req.body.coupling, car: req.body.car, house: req.body.house, land: req.body.land}, function(err){
          if(err) throw next(err);
     
          res.send({result: "saved"});
        });
      }
   });
});

router.get('/girlfriend/continue', function(req, res, next){
  Girlfriend.findOne({name:req.user.name}, function(err, row){
    if(err) throw err;

    if(row !== null){
      res.send({result: "found", row:row});
    }else{
      res.send({result: "notFound"});
    }
  });
});

router.get('/girlfriend/richRank', function(req, res, next){
  var board = "richRank";
  var start = 0;
  var end = 4;

  client.ZREVRANGE(board, start, end, function(err, result){
    res.send({result:result});
  });
});

router.get('/girlfriend/levelRank', function(req, res, next){
  var board = "levelRank";
  var start = 0;
  var end = 4;

  client.ZREVRANGE(board, start, end, function(err, result){
    res.send({result:result});
  });
});

module.exports = router;
