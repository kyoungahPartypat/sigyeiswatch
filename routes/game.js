var express = require('express');
var mongodb = require('mongodb');
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


/*주호 겜*/
router.get('/juho', function(req, res, next){
  res.render('game/juho');
});

router.post('/juhoSave', function(req, res, next){
  res.send(req.body);
});

module.exports = router;
