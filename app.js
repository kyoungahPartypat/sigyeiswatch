var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var mongoose = require('mongoose');
var cluster = require('cluster');
var sticky = require('sticky-session');
var MongoStore = require('connect-mongo')(session);

var routes = require('./routes/index');
var users = require('./routes/users');
var chat = require('./routes/chatServer');
var game = require('./routes/game');
var photos = require('./routes/photos');
var board = require('./routes/board');
var chatServer = require('./lib/chatServer');
var secret = "sigye";

var app = express();
app.io = require('socket.io')({
  "transports": ['websocket','flashsocket','htmlfile','xhr-polling','jsonp-polling'], // socket.io 에서 시도하는 연결 순서
  "heartbeat timeout": "pingTimeout",
  "heartbeat interval": "pingInterval" 
});

require('./lib/passport').setup();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('/photos', __dirname + '/public/photos');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('sigye'));

mongoose.createConnection('mongodb://localhost/sigye');

//var store = new session.MemoryStore();
var store = new MongoStore({mongooseConnection:mongoose.connection, ttl:2*24*60*60});

app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: secret, key: 'express.sid', resave: true, saveUninitialized:true,  store:store, cookie:{maxAge: 3600000}}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});
app.use('/', routes);
app.use('/users', users);
app.use('/photos', photos);
app.use('/free', board);
app.use('/game', game);
app.use('/chat', chat); 

//var httpServer = http.createServer(app).listen(3000, function(req,res){
//  console.log('Socket IO server has been started');
//});

//chatServer.listen(httpServer, store, secret);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
}/*
chatServer.listen(httpServer, store, cookieParser, secret);
*/);

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

console.log(app.io);
chatServer.listen(app.io, store, secret);
/*
app.io.on('connection', function(socket){
  console.log('socketio user connected...');

  socket.on('new message', function(msg){
    app.io.emit('chat message', msg);
  });
});
*/
module.exports = app;
