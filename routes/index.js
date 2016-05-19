var express = require('express');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var server = new mongodb.Server('localhost', 27017, {});
var client = new mongodb.Db('sigye', server, {w:1});

var router = express.Router();
var yesterday = 0;
var watch;

/* GET home page. */
router.get('/', function(req, res, next) {

  var date = new Date();
  var now = date.getDate();
 
  if(yesterday != now){

    client.open(function(err){
      if(err) throw err;
      
      client.collection('watches', function(err, collection){
        if(err) throw err;
        collection.count(function(err, num){ 
          
          var count = Math.floor(Math.random() * num + 1);
          console.log(count);
          collection.find({idx:count}).toArray(function(err, result){
            if(err) throw err;

            yesterday = now;       
            watch = result[0];
            
            res.render('index', { title: '시계 is 와치', watch:watch}); 
          });
        });
      });
    });    

  }else{
    res.render('index', { title: '시계 is 와치', watch:watch });
  }
});

router.get('/main_best', function(req, res, next){
  var options = {
    "limit": 20,
    "sort": [['_id', 'desc']]
  };

  client.open(function(err){
    if(err) throw err;

    client.collection('frees', function(err, collection){
      if(err) throw err;
 
      collection.find({'good': {$gte: 50}}, options).toArray(function(err, rows){
        res.send({rows: rows});
      });
    })
  });

  /*
  Table.$where('this.good >= 50').sort({_id:'desc'}).limit(10).esec(function(err, rows){
    res.send({best:rows});
  });
  */
});

router.get('/main_recent', function(req, res, next){
  var options = {
    "limit": 20,
    "sort": [['_id', 'desc']]
  };

  client.open(function(err){
    if(err) throw err;

    client.collection('frees', function(err, collection){
      if(err) throw err;
 
      collection.find({}, options).toArray(function(err, rows){
        res.send({rows: rows});
      });
    })
  });

  /*
  Table.find().sort({_id:'desc'}).limit(10).esec(function(err, rows){
    res.send({recent:rows});
  });
  */

});

module.exports = router;
