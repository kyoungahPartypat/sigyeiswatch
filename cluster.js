require('magic-globals');

var cluster = require('cluster');
var net = require('net');
var ip = require('ip');
var num_process = _CONFIG.getENV() == 'production'? Math.round( require('os').cpus().length * 1.5):2 //CPU 자원 최대한 활용

cluster.setupMaster({
  exec: './app.js',
  args: [],
  silent: false
});

if(cluster.isMaster){
  var workers = [];

  var spawn = function(i){
    workers[i].on('exit', function(worker, code, signal){
      console.log('respawning worker', i);
      spawn(i);
    });
  };

  for(var i = 0; i< num_processes; i++){
    spawn(i);
  }

  var server = net.createServer({pauseOnConnect: true}, function(connection){
    var worker = workers[ip.toLong(ip.address())%num_processes];
    worker.send('sticky-session: connection', connection);
  }).listen(port);
}

cluster.on('exit', function(worker, code, signal){
  console.err( '#####', __line, 'worker ', worker, code, signal);
  cluster.fork({fork: worker.process.env.fork});
  console.log('#####', __line, 'worker', worker.process.env.fork, 'restart');
});

/* server.js 에서 cluster.js 와 동기화를 위한 코드 적용  */
// 마스터에서 수신포트를 사용하니 server.js에서는 포트를 사용하지 않는다.
var app = new express();
 
// 미들웨어, 라우터 적용 
 
// 외부에 내부 포트를 노출하지 않는다.
var server = app.listen(0, 'localhost'),
        io = sio(server);
 
// Redis 어댑터 사용
io.adapter(sio_redis({ host: 'localhost', port: 6379 }));
 
// socket.io 미들웨어 사용 
 
// 마스터(cluster.js)에서 보낸 메세지를 받는다. 나머지 다른것은 무시한다.
process.on('message', function(message, connection) {
    if (message !== 'sticky-session:connection') {
        return;
    }
 
    // 마스터에서 보낸 연결 이벤트를 fork된 현재 서비스에 에뮬레이트(연결…이라고 생각)한다.
    server.emit('connection', connection);
 
    connection.resume();
});
