var passport = require('passport');
var passportSocketIo = require('passport.socketio');
var cookieParser = require('cookie-parser');

function Room(num, title, count, owner){
  this.num = num;
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

//링크드 리스트

function RoomList(){
  this.roomLength = 0;
  this. head = null;
}

RoomList.prototype.addRoom = function(room){
  var pHead = this.head;

  if(pHead == null){
    this.head = room; //맨 처음 노드 추가 할 때
  }else{
    while(pHead.next != null){
      pHead = pHead.next;
    }

    pHead.next = room;
  }

  this.roomLength++;
}

RoomList.prototype.removeRoom = function(room){
  var pList = this;
  var pHead = pList.head;
  var pDelNode = null;

  if(pHead == room){
    pDelNode = this.head;
    delete pDelNode;

    this.head = null;
  }else{
    while(pHead.next != room){
      pHead = pHead.next;
    }
  
    pDelNode = pHead.next;
    pHead.next = pDelNode.next;

    delete pDelNode;
   
  }

  this.roomLength--;
}


//방을 위한 변수와 객체
var roomList = []; //방 목록
var rooms = [];
var people = []; //무슨방에 있는지 저장
var lobby = []; //로비변수

var num = 0;

//

function onAuthorizeSuccess(data, accept, error){
  console.log('successful connection to socket.io');

  // The accept-callback still allows us to decide whether to
  // accept the connection or not.
  accept(null, true);

  // OR

  // If you use socket.io@1.X the callback looks different
  accept();
}

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

function shuffle(arr){
  for(var j, x, i = arr.length; i; j = Math.floor(Math.random() *i), x = arr[--i],arr[i] = arr[j], arr[j] = x);
  return arr;
}

function getRooms(io){
    var allRooms = io.sockets.adapter.rooms;
    var allClients = io.engine.clients;
    var result = [];
    for(var room in allRooms){
        // check the value is not a 'client-socket-id' but a room's name
        if(!allClients.hasOwnProperty(room)){
            result.push(room);
        }
    }
    return result;
}

exports.listen = function(io,  store, secret){

  io.set('log level', 1);
 
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
 
    console.log(user);
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
        io.sockets.in(room).emit('lobbyMsg', {user:user, msg: "님이 입장하셨습니다."} ); 
      }
    });   
 
    socket.on('createRoom', function(data){
      if(people[user] != undefined){
        socket.emit('error', {type:1});
      }else{
        num++;
        var room = "room" + num;
        var title = data.title;
        var count = data.count;
        var owner = user;
       
        if(rooms[room] == undefined){

          rooms[room] = new Room(num, title, count, owner);
          rooms[room].addPerson(user);
          roomList.push(rooms[room]);     
        
          people[user] = room;
        }
      }
    });

    socket.on('lobbyChat', function(data){
      data.user = user;
      data.msg = ": " + data.msg; 
      socket.broadcast.to('lobby').emit('lobbyMsg', data);
      socket.emit('lobbyMsg', data);
    });

    socket.on('sendMessage', function(data){
      var room = people[user];
      data.user = user;
      data.msg = ": " + data.msg;
      socket.broadcast.to(room).emit('message', data);
      socket.emit('message', data);
    });

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

    socket.on('changeRoomOwner', function(data){
      var room = people[user];
      var roomNum = roomList.indexOf(rooms[room]);

      if(rooms[room].owner != user){
        data.msg = "당신은 방장이 아닙니다.";
        socket.emit('message', data);
      }else if(user == name){
        data.msg = "당신은 이미 방장입니다.";
        socket.emit('message', data);
      }else{

        if(rooms[room].findPerson(data.name) == -1){
          data.msg = "없는 유저 입니다";
          socket.emit('message', data);
        }else{
          rooms[room].owner = data.name;
          data.num = roomNum;
          io.sockets.emit('getRoomOwner', {num:roomNum, newOwner:data.name});
          socket.emit('message', {msg:data.msg});
        }
      }
    });

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

          rooms[room].removePerson(name);
       
          data.msg = name + "님이 강퇴당하였습니다.";
          io.sockets.in(room).emit('message', data);
          io.sockets.in(room).emit('goOut', {user:user, name:name});
        }
      }
    });

    socket.on('roomClick', function(data){
      var room = "room" + data.num;
      var userNum = rooms[room].people.length;
      
      if(people[user] == undefined){
        if(userNum < rooms[room].count){
          people[user] = room;  
          rooms[room].addPerson(user);
         
          socket.emit("gotoRoom", {join:"yes"});    
          io.sockets.in("lobby").emit('avaliable', {userNum: userNum});
        }else{
          socket.emit("gotoRoom", {join:"no"});
        }

      }else{
        socket.emit('error', {type:1});
      }

    });

    socket.on('joinRoom', function(data){
        var room = people[user];
        console.log(people[user] + ' joinroom');

        if(people[user] != undefined){
          socket.join(room);
         
          socket.emit('setRoom', {room:rooms[room]});
          io.sockets.in(room).emit('userList', {users:rooms[room].people});

        }else{
          socket.emit('error', {type:3}); //오류
        }
        
    });

    socket.on("gameStart", function(data){
      console.log('start');
      var room = people[user];

      if(rooms[room].people.length < rooms[room].count){
        socket.emit('message', {msg: "인원이 부족합니다."});
      }else{
        
        switch(rooms[room].count){
          case '3':
            var type = ['warewolf', 'warewolf', 'sear', 'robber', 'trouble', 'villager' ];
            var wake = 4; 
            break;
          case '5':
            var type = ['warewolf', 'warewolf', 'sear', 'robber', 'trouble', 'villager', 'villager'];
            var wake = 4;
            break;
          default :
            break;
        };

        shuffle(type);

        for(var i = 0; i < rooms[room].count; i++){
          if(rooms[room].people[i]){
            var myType = type[i];
          }
        } 

        io.sockets.in(room).emit("message", {msg: myType});
      }
    });

    socket.on('disconnect', function(data){
      var room = people[user];
      var roomNum = roomList.indexOf(rooms[room]);

      if(people[user] != undefined && lobby[user] == undefined){
        rooms[room].removePerson(user);
        //io.sockets.in("lobby").emit('')
        
        if(rooms[room].people.length == 0){
          roomList.splice(roomNum, 1);
          delete rooms[room];
        }else{
          if(rooms[room].owner == user){
            rooms[room].owner = rooms[room].people[0];
          }
        }
        delete people[user];
      }else{
        io.sockets.in("lobby").emit('lobbyMsg', {user:user, msg:"님이 퇴장하셨습니다."});
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