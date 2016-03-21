var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var connection = mysql.createConnection({
  host: 'sigyeiswatch.cca8wgdf70vy.ap-northeast-2.rds.amazonaws.com',
  user: 'kyoungah',
  password: 'dbrud3489',
  database: 'SigyeisWatch'
});


exports.setup = function(){
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqtoCallback: true

  }, function(email, password, done){
        connection.query('select * from users where email = ?', email, function(err, result){
          if(err) throw err;

          if(result.length == 0){
            return done(null, false, {message: '아이디 또는 비밀번호를 다시 확인하세요.'});
          }else{
            bcrypt.hash(password, result[0].salt, function(err, hash){
              if(err) throw err;
   
              if(hash == result[0].password && result[0].confirm === "Y"){
                
                var user = {
                  'idx':result[0].idx,
                  'name':result[0].name
                }
          
                return done(null, user);
              }else if(hash == result[0].password && result[0].confirm === "N"){
                return done(null, false, {message: '이메일 인증을 완료해주세요.'});
              }else{

                return done(null, false, {message: '아이디 또는 비밀번호를 다시 확인하세요.'});
              }
            });      
          }
        }); 
    })
  );

  passport.serializeUser(function(user, done){
    done(null, user);
  });

  passport.deserializeUser(function(user, done){
    done(null, user);
  });
};
