var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var connection = mysql.createConnection({
  host: 'sigyeiswatch.cca8wgdf70vy.ap-northeast-2.rds.amazonaws.com',
  user: 'kyoungah',
  password: 'dbrud3489',
  database: 'SigyeisWatch'
});

var socialAuth = function (profile, done){
  connection.query('select * from users where email = ?', profile.email, function(err, result){
    if(err){
      return done(err);
    }else{
      if(result.length === 0){ 
      var user = {
        'email': profile.email,
        'name': profile.username,
        'social': profile.providerId,
        'confirm': 'N',
      };
 
      connection.query('insert into users set ?', user, function(err, result){
         if(err) return err;
         return done(null, user);
      });

      }else{
     
        if(result[0].social != null){
          if(result[0].confirm === 'N'){
            var user = {
             'email': result[0].email,
             'name':result[0].name,
             'social':result[0].social,
             'confirm': result[0].confirm
            } 

            return done(null, user);
         
           }else{
            var user = {
             'idx':result[0].idx,
             'name':result[0].name,
             'confirm': result[0].confirm
            } 
            return done(null, user);
          }
        }else{    
          return done(null, false, {message: '혹시 다른 계정으로 회원가입 하지 않았나요?'});
        }
      }

    }
  });
}

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

  passport.use(new FacebookStrategy({
    clientID: "806122709518861",
    clientSecret: "2b725678a8799e055d964a7e224afbbc",
    callbackURL: "http://sigyeiswatch.com/users/auth/facebook/callback",
    profileFields: ['id', 'emails', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified'],
    //passReqToCallback: true
  }, function(accessToken, refreshToken, profile, done){
    
    var providerData = profile._json;
    providerData.accessToken = accessToken;
    providerData.refreshToken = refreshToken;

    var providerUserProfile = {
      email: profile.emails[0].value,
      username: providerData.last_name + providerData.first_name,
      provider: 'facebook',
      providerId: profile.id,
      providerData: providerData
    }
    socialAuth(providerUserProfile, done);
  }));

  passport.serializeUser(function(user, done){
    done(null, user);
  });

  passport.deserializeUser(function(user, done){
    done(null, user);
  });
};
