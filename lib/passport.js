var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var connection = mysql.createConnection({
  host: 'sigyeiswatch.c3fm9fprnnz4.ap-northeast-1.rds.amazonaws.com',
  user: 'kyoungah',
  password: 'dbrud3489',
  database: 'sigyeiswatch'
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
            return done(null, false);
          }else{
            bcrypt.hash(password, result[0].salt, function(err, hash){
              if(err) throw err;
   
              if(hash == result[0].password){

                var user = {
                  'idx':result[0].idx,
                  'name':result[0].name
                }
          
                return done(null, user);
              }else{
                return done(null, false);
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
