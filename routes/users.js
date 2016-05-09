var express = require('express');
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var passport = require('passport');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var router = express.Router();

//require('../lib/passport').setup();

var connection = mysql.createConnection({
  host: 'sigyeiswatch.cca8wgdf70vy.ap-northeast-2.rds.amazonaws.com',
  user: 'kyoungah',
  password: 'dbrud3489',
  database: 'SigyeisWatch'
});

var smtpTransport = nodemailer.createTransport(smtpTransport({
  service: 'gmail',
  auth: {
    user: "kyoungpartypat@gmail.com",
    pass: "tpqmsdlffpqms34"
  }
}));


/* GET users listing. */
router.get('/', function(req, res, next){  
  res.redirect('/users/login', {title:'로그인 - 시계 is 와치'});
});

router.get('/join', function(req, res, next){
  
  res.render('users/join', {title:'회원가입 - 시계 is 와치'});
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
     
      var mailOptions = {
        from: '시계 is 와치 <sigye@sigyeiswatch.com>',
        to: req.body.email,
        subject: '시계 is 와치 회원가입 인증메일 입니다 :)',
        html: '<span>' + req.body.name + '님, 시계 is 와치에 가입한게 맞으시다면 아래의 링크를 클릭해주세요.</span><br/><a href = "http://sigyeiswatch.com/users/join/emailConfirm/'+ encodeURIComponent(req.body.name) +'">이메일 인증 완료하기</a>'
      }
     
      var user = {
        'email': req.body.email,
        'password': hash,
        'salt': salt,
        'name': req.body.name,
        'confirm' : 'N'
      };
      
      connection.query('insert into users set ?', user, function(err, result){
        if(err) throw err;

        smtpTransport.sendMail(mailOptions, function(error, response){
	  if (error){
            console.log(error);
	  }else{
            console.log("sent message to " + req.body.name);
          }
	  smtpTransport.close();
        });

        res.redirect('/users/join/joinResult/' + encodeURIComponent(req.body.name));
      });
    });
  });

});

router.get('/join/joinResult/:name', function(req, res, next){
  var name = req.params.name;
  console.log(name);
  if(name){
    connection.query('select email, name from users where name = ?', name, function(err, result){
      res.render('users/joinResult', {title:'회원가입 완료 - 시계 is 와치', result:result[0]});
    });
  }else{
    res.redirect('/users/join');
  }
});

router.get('/join/emailConfirm/:name', function(req, res, next){
  var name = req.params.name;
  if(name){

    connection.query('SELECT confirm FROM users WHERE name = ?', name, function(err, result){
      if(result[0] !== undefined && result[0].confirm === "Y"){
        res.render('users/emailConfirm', {title:'이메일 인증 - 시계 is 와치', chk: "YES"});
      }else if(result[0] !== undefined && result[0].confirm === "N"){
        connection.query('UPDATE users SET confirm = "Y" WHERE name = ?', name, function(err, result){
          res.render('users/emailConfirm', {title:'이메일 인증 - 시계 is 와치', chk: "NO"});
        });  
      }else{
        res.render('users/emailConfirm', {title:'이메일 인증 - 시계 is 와치', chk:"UNDEFINED"});
      }
    });
    
  }else{
    res.render('users/emailConfirm', {title:'이메일 인증 - 시계 is 와치', chk:"UNDEFINED"});
  }
});

router.get('/login', function(req, res, next){ 
  res.render('users/login', {title: "로그인 - 시계 is 와치", message:req.flash('error')});
});

router.post('/login', passport.authenticate('local', {failureRedirect:'/users/login', failureFlash:true}), function(req, res){
  
  if(req.session.returnTo){
    var url = req.session.returnTo;
    delete req.session.returnTo;

    res.redirect(url);
  }else{
    res.redirect('/');
  }
});

router.get('/logout', function(req, res, next){
  req.logout();
  res.redirect('/');
});

module.exports = router;
