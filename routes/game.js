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
  res.render('game/girlfriend');
});

router.get('/girlfriend/newGame', function(req, res, next){
   db.query("SELECT * FROM girlfriend WHERE idx = ?", 0, function(err, result){
    if(result[0] !== undefined){   
      var nextGirl = {
        idx: result[0].idx,
        name: result[0].name,
        percent: result[0].percent,
        money: result[0].money,
        present: result[0].present,
        coupling: result[0].coupling,
        car: result[0].car,
        house: result[0].house,
        land: result[0].land,
        compensation: result[0].compensation,
        description: result[0].description
      };
      res.send(nextGirl);
    }else{
      res.send({result:"false"});
    }
  });
});

router.post('/girlfriend/up', function(req, res, next){
   db.query("SELECT * FROM girlfriend WHERE idx = ?", req.body.idx, function(err, result){
    if(result[0] !== undefined){   
      var nextGirl = {
        idx: result[0].idx,
        name: result[0].name,
        percent: result[0].percent,
        money: result[0].money,
        present: result[0].present,
        coupling: result[0].coupling,
        car: result[0].car,
        house: result[0].house,
        land: result[0].land,
        compensation: result[0].compensation,
        description: result[0].description
      };
      res.send(nextGirl);
    }else{
      res.send({result:"false"});
    }
  });
});

module.exports = router;
