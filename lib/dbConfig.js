var mysql = require('mysql');
var db_config = {
  host: 'sigyeiswatch.cca8wgdf70vy.ap-northeast-2.rds.amazonaws.com',
  user: 'kyoungah',
  password: 'dbrud3489',
  database: 'SigyeisWatch'
};

exports.handleDisconnect = function(){
  var connection = null;

  connection = mysql.createConnection(db_config);

  connection.connect(function(err){
    if(err){
      console.log('error when connection to db:', err);
      setTimeout(exports.handleDisconnect, 2000);
    }
  });

  connection.on('error', function(err){
    console.log('db error', err);
    
    if(err.code === "PROTOCOL_CONNECTION_LOST"){
      exports.handleDisconnect();
    }else{
      throw err;
    }
  });

  return connection;
}
