var passport = require('passport');
var passportSocketIo = require('passport.socketio');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose'); //방목록 디비에 담을거임

//방을 위한 변수와 객체
var roomList = []; //방 목록
var rooms = []; //방객체
var people = []; //무슨방에 있는지 저장
var lobby = []; //로비변수
var game = []; //게임변수
var num = 0; //방 번호

//오목판
var map = [['lt','t','t','t','t','t','t','t','t','t','t','t','t','t','rt'],
           ['l','o','o','o','o','o','o','o','o','o','o','o','o','o','r'],
           ['l','o','o','o','o','o','o','o','o','o','o','o','o','o','r'],
           ['l','o','o','o','o','o','o','o','o','o','o','o','o','o','r'],
           ['l','o','o','o','o','o','o','o','o','o','o','o','o','o','r'],
           ['l','o','o','o','o','o','o','o','o','o','o','o','o','o','r'],
           ['l','o','o','o','o','o','o','o','o','o','o','o','o','o','r'],
           ['l','o','o','o','o','o','o','o','o','o','o','o','o','o','r'],
           ['l','o','o','o','o','o','o','o','o','o','o','o','o','o','r'],
           ['l','o','o','o','o','o','o','o','o','o','o','o','o','o','r'],
           ['l','o','o','o','o','o','o','o','o','o','o','o','o','o','r'],
           ['l','o','o','o','o','o','o','o','o','o','o','o','o','o','r'],
           ['l','o','o','o','o','o','o','o','o','o','o','o','o','o','r'],
           ['l','o','o','o','o','o','o','o','o','o','o','o','o','o','r'],
           ['lb','b','b','b','b','b','b','b','b','b','b','b','b','b','rb']];

function Room(num,  type, title, count, owner){
  this.num = num;
  this.type = type;
  this.title = title;
  this.count = count;
  this.owner = owner;
  this.people = [];
  this.status = "대기중";
};

Room.prototype.addPerson = function(personID) {  
  if (this.people.length  < this.count) {
    this.people.push(personID);
  }
};

Room.prototype.findPerson = function(person) {
  var personIndex = -1;
  for(var i = 0; i < this.people.length; i++){
    if(this.people[i] === person){
      personIndex = i;
      break;
    }
  }
  return personIndex;
};

Room.prototype.removePerson = function(person) {
  var personIndex = -1;
  for(var i = 0; i < this.people.length; i++){
    if(this.people[i] === person){
      personIndex = i;
      break;
    }
  }
  this.people.splice(personIndex, 1);
};


//웨어울프 함수
function WareS(){
  this.wake = 0;
  this.people = [];
  this.job = [];
  this.card = [];
  this.ware = [];
  this.mason = [];
}

//오목 함수
function OmokS(){
  this.people = [];
  this.map = null;
  this.black = null;
  this.white = null;
  this.count = 225;
}

//오목 돌 세는 함수 
function checkPointer(turn,  i,  j){
  var win = "no";
  var x = i;
  var y = j;
  var winCount = 0;

  while(game[room].map[x][y] === turn && win === "no"){
    winCount++;

    if(winCount == 5){
      win = turn;
    }else{
      x -=1;
      y -=1;
    }
  }

  x = i;
  y = j;
  winCount = 0;
 
  while(game[room].map[x][y] === turn && win === "no"){
    winCount ++;

    if(winCount === 5){
      win = turn; 
    }else{
      x -= 1;
    }
      
  }

  x = i;
  y = j;
  winCount = 0;

  while(game[room].map[x][y] === turn && win === "no"){
    winCount ++;

    if(winCount === 5){
      win = turn; 
    }else{
      x -= 1;
      y += 1;
    }
  }

  x = i;
  y = j;
  winCount = 0;

  while(game[room].map[x][y] === turn && win === "no"){
    winCount ++;

    if(winCount === 5){
      win = turn; 
    }else{
      y -= 1;
    }       
  }

  x = i;
  y = j;
  winCount = 0;

  while(game[room].map[i][j] === turn && win === "no"){
    winCount ++;

    if(winCount === 5){
      win = turn; 
    }else{
      y += 1;
    }  
  }

  x = i;
  y = j;
  winCount = 0;

  while(game[room].map[x][y] === turn && win === "no"){
    winCount ++;

    if(winCount === 5){
      win = turn; 
    }else{
      x += 1;
      y -= 1;
    }       
  }

  x = i;
  y = j;
  winCount = 0;

  while(game[room].map[i][j] === turn && win === "no"){
    winCount ++;

    if(winCount === 5){
      win = turn; 
    }else{
      x += 1;
    }           
  }

  x = i;
  y = j;
  winCount = 0;

  while(game[room].map[x][y] === turn && win === "no"){
    winCount ++;

    if(winCount === 5){
      win = turn; 
    }else{
      x += 1;
      y += 1;
    }         
  }

  return win;

}

//세션 확인 함수
function onAuthorizeSuccess(data, accept, error){
  console.log('successful connection to socket.io');

  // The accept-callback still allows us to decide whether to
  // accept the connection or not.
  accept(null, true);

  // OR

  // If you use socket.io@1.X the callback looks different
  accept();
}

//웨어울프 직업 섞어주는 함수
function shuffle(arr){
  for(var j, x, i = arr.length; i; j = Math.floor(Math.random() *i), x = arr[--i],arr[i] = arr[j], arr[j] = x);
  return arr;
}

//세션이 없으면 이 함수가 작동함
function onAuthorizeFail(data, message, error, accept){
  if(error) throw new Error(message);
  console.log('failed connection to socket.io:', message);

  // We use this callback to log all of our failed connections.
  accept(null, false);

  // OR

  // If you use socket.io@1.X the callback looks different
  // If you don't want to accept the connection
  if(error)
    accept(new Error(message));
  // this error will be sent to the user as a special error-package
  // see: http://socket.io/docs/client-api/#socket > error-object
}


exports.listen = function(io,  store, secret){

  io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: 'express.sid',
    secret: secret,
    store: store,
    sucess: onAuthorizeFail,
    fail: onAuthorizeFail
  }));

  io.on('connection', function(socket){
    
    var user = socket.request.user.name;
 
    //로비 입장
    socket.on('joinLobby', function(){
      if(people[user] != undefined){
        socket.emit('error', {type:1}); //다른방에 입장 중 일때
      }else if(lobby[user] != undefined){
        socket.emit('error', {type:2}); //로비에 입장 중 일때
      }else{

        var room = "lobby";
        lobby[user] = new Object();
        lobby[user] = user;

        socket.join(room);          
        io.sockets.in(room).emit('roomList', {rooms:roomList});
        io.sockets.in(room).emit('userList', {users:Object.keys(lobby)});
        io.sockets.in(room).emit('lobbyMsg', {user:user, msg: "님이 입장하셨습니다."}); 
      }
    });   
 
   //로비 채팅
    socket.on('lobbyChat', function(data){
      data.user = user;
      data.msg = ": " + data.msg; 
      socket.broadcast.to('lobby').emit('lobbyMsg', data);
      socket.emit('lobbyMsg', data);
    });

    //로비 메세지
    socket.on('sendMessage', function(data){
      var room = people[user];
      data.user = user;
      data.msg = ": " + data.msg;
      socket.broadcast.to(room).emit('message', data);
      socket.emit('message', data);
    });

    //방생성
    socket.on('createRoom', function(data){
      console.log(data);
      if(people[user] != undefined){
        socket.emit('error', {type:1});
      }else{
        num++;
        var room = "room" + num;
	var type = data.type;
        var title = data.title;
        var count = data.count;
        var owner = user;
       
        if(rooms[room] == undefined){

          rooms[room] = new Room(num, type, title, count, owner);
          rooms[room].addPerson(user);
          roomList.push(rooms[room]);     
        
          people[user] = room;
        }
      }
    });
  
    //방이름 변경 ->방장 전용
    socket.on('changeRoomTitle', function(data){
      var room = people[user];
      var roomNum = roomList.indexOf(rooms[room]);
      if(rooms[room].owner != user){
        data.msg = "당신은 방장이 아닙니다.";
        socket.emit('message', data);
     }else{
        rooms[room].title = data.title;
        data.num = roomNum;
        data.msg = "방제가 변경되었습니다.";
        io.sockets.emit('getRoomTitle', {num:roomNum, newTitle:data.title});
        socket.emit('message', {msg:data.msg});
      }
    });

    //방장변경 ->방장 전용
    socket.on('changeRoomOwner', function(data){
      var room = people[user];
      var roomNum = roomList.indexOf(rooms[room]);
      var name = data.name;

      if(rooms[room].owner != user){
        data.msg = "당신은 방장이 아닙니다.";
        socket.emit('message', data);
      }else if(user == name){
        data.msg = "당신은 이미 방장입니다.";
        socket.emit('message', data);
      }else{

        if(rooms[room].findPerson(name) == -1){
          data.msg = "없는 유저 입니다";
          socket.emit('message', data);
        }else{
          rooms[room].owner = name;
          data.num = roomNum;
          io.sockets.in('lobby').emit('getOwner', {num:roomNum, owner:data.name});
          io.sockets.in(room).emit('owner', {owner:name})
          socket.emit('message', {user:name, msg:"님이 방장이 되었습니다."});
        }
      }
    });


    //강퇴 ->방장 전용
    socket.on('getOut', function(data){
      var room = people[user];
      var name = data.name;

      if(rooms[room].owner != user){
        data.msg = "당신은 방장이 아닙니다.";
        socket.emit('message', data);
      }else if(rooms[room].owner == name){
        data.msg = "자기자신을 강퇴시킬 수 없습니다.";
        socket.emit('message', data);
      }else{

        if(rooms[room].findPerson(name) == -1){
          data.msg = "없는 유저 입니다.";
          socket.emit('message', data);
        }else{
       
          data.msg = name + "님이 강퇴당하였습니다.";
          io.sockets.in(room).emit('message', data);
          io.sockets.in(room).emit('goOut', {name:name});
        }
      }
    });

    //방 눌렀을때
    socket.on('roomClick', function(data){
      var room = "room" + data.num;
      var userNum = rooms[room].people.length;
      
      if(people[user] == undefined){
        if(userNum < rooms[room].count){
          people[user] = room;  
          rooms[room].addPerson(user);
         
          socket.emit("gotoRoom", {type:rooms[room].type, join:"yes"});    
          io.sockets.in("lobby").emit('avaliable', {userNum: userNum});
        }else{
          socket.emit("gotoRoom", {join:"no"});
        }

      }else{
        socket.emit('error', {type:1});
      }

    });

    //방입장 
    socket.on('joinRoom', function(data){
        var room = people[user];
        console.log(people[user] + ' joinroom');

        if(people[user] != undefined){
          socket.join(room);

          if(rooms[room].type === "omok"){
	    socket.emit('setOmok', {room:rooms[room], map:map});
          }else{
	    socket.emit('setWarewolf', {room:rooms[room]});
          }

          io.sockets.in(room).emit('userList', {users:rooms[room].people});
          io.sockets.in(room).emit('message', {user:user, msg:"님이 입장하였습니다."});
        }else{
          socket.emit('error', {type:3}); //오류
        }
        
    });


    socket.on("gameSet", function(data){ 
      var room = people[user];

      if(rooms[room].status === "대기중"){
        if(rooms[room].people.length < rooms[room].count){
          socket.emit('message', {msg: "인원이 부족합니다."});
        }else{

          if(rooms[room].type === "warewolf"){
            game[room]  = new WareS();
            var j = 0;
        
            switch(rooms[room].count){
              case '3':
                var type = ['늑대인간', '늑대인간', '천리안', '도둑', '문제아', '마을사람' ];
                var wake = 4; 
                break;
              case '5':
                var type = ['늑대인간', '늑대인간', '천리안', '도둑', '문제아', '마을사람', '마을사람', '마을사람'];
                var wake = 4;
                break;
              default :
                break;
            };

            shuffle(type);
            game[room].wake = wake; 
            game[room].people = rooms[room].people;

            for(var i = 0; i < rooms[room].count; i++){
              game[room].job[i] = type[i];

              if(type[i] === "늑대인간"){
                game[room].ware.push(rooms[room].people[i]);  
              }else if(type[i] === "비밀요원"){
                game[room].mason.push(rooms[room].people[i]);
              }
              j++;
            }
          
            for(var i = 0; i < 3; i++){
              game[room].card[i] = type[j];
              j++; 
            }
    
            io.sockets.in(room).emit('warewolfStart', {game:game[room]});

          }else{
            var turn = "black";
            game[room] = new OmokS();
            game[room].map = map.map(function (arr) {return arr.slice();});
      
            game[room].black = rooms[room].people[0];
            game[room].white = rooms[room].people[1];

           io.sockets.in(room).emit('omokStart', {game:game[room], turn:turn});
          }
 
          io.sockets.in(room).emit('message', {msg:"게임을 시작합니다."});
          rooms[room].status = "게임중";
           
        }
      }else{
        socket.emit('message', {msg:"이미 게임이 진행중 입니다."});
      }
    });

    // -------------- 웨어울프 -------------- //

    socket.on('firstTurn', function(data){
      var room = people[user];
      var wake = 0;
      io.sockets.in(room).emit('moveNight', {game:data.game, myJob:data.myJob, wake:wake});
    });

    socket.on('nextTurn',function(data){
      var wake = data.wake + 1;
      console.log(wake);
      socket.emit('moveNight', {game:data.game, wake:wake, myJob:data.myJob});
    });

    socket.on('showWare', function(data){
      var text = "늑대인간은"
      
      for(var i = 0; i < game.ware; i++){
        if(i< game.ware){
          text = text + ",";
        }else{
          text = text + "입니다";
        }
      };

      socket.emit('message', {msg:text});
    });
    
    socket.on('showRobber', function(data){
      console.log(data);
    });

    socket.on('showTrouble', function(data){
        console.log(data);
    });
 
    // -------------- 오목 -------------- //
    socket.on('checkPoint', function (data){
      var room = people[user];
      var x = data.x;
      var y = data.y;
      var win = null;

      game[room].map[x][y]  = data.turn;
      win = checkPointer(data.turn ,x , y);    
      console.log(win);      
      game[room].count--;
      

      if(game[room].count <= 0){
        io.sockets.in(room).emit('result', {result:"draw"});
        game[room].status = "대기중";
      }else if(game[room].count > 0 && win != "no"){        
        game[room].status = "대기중";
        io.sockets.in(room).emit('result', {result:win});
      }else{
        if(data.turn === 'black'){
          data.turn = 'white';
        }else{
          data.turn = 'black';
        }
        io.sockets.in(room).emit('turn',{turn:data.turn, x:data.x, y:data.y, changeValue:game[room].map[data.x][data.y]});
      }
    }); 
    //
  
    socket.on('disconnect', function(data){
      var room = people[user];
      var roomNum = roomList.indexOf(rooms[room]);

      if(people[user] != undefined && lobby[user] == undefined){
        console.log(user + "나감");
        rooms[room].removePerson(user);
        
        
        io.sockets.in(room).emit('message', {user:user, msg:"님이 퇴장하였습니다."});        
    
        if(rooms[room].people.length == 0){
          roomList.splice(roomNum, 1);
          delete rooms[room];
        }else{
          console.log(user + "로비 퇴장");
          io.sockets.in(room).emit('userList', {users:rooms[room].people});  

          if(rooms[room].owner == user){
            rooms[room].owner = rooms[room].people[0];
            io.sockets.in(room).emit('owner', {owner: rooms[room].owner});
            io.sockets.in(room).emit('message', {user:rooms[room].owner, msg:"님이 방장이 되었습니다."});
          }
        }
   
        delete people[user];
 
      }else{
        io.sockets.in("lobby").emit('lobbyMsg', {user:user, msg:"님이 퇴장하였습니다."});
        delete lobby[user];
        io.sockets.in("lobby").emit('userList', {users: Object.keys(lobby)});
        io.sockets.in("lobby").emit('roomList', {rooms:roomList});
      }
    });

    socket.on('error', function(data){
      if(data.type == 1){
        socket.emit('errorOutput', {text:"이미 다른방에 접속되어 있습니다!"});
      }else if(data.type == 2){
        socket.emit('errorOutput', {text:"이미 로비에 접속되어 있습니다!"});
      }else if(data.type == 3){
        socket.emit('errorOutput', {text:"로비로 이동합니다!"});
      }
    });
  });
}
