var passport = require('passport');
var passportSocketIo = require('passport.socketio');
var cookieParser = require('cookie-parser');
var redis = require('redis');
var adapter = require('socket.io-redis');
var pub =  redis.createClient(6379, "127.0.0.1", {return_buffers:true});
var sub =  redis.createClient(6379, "127.0.0.1", {return_buffers: true});


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
  this.skip = [];
  this.vote = [];
  this.dead = [];
  this.isVote = false;
  this.isSkip = false;
}

WareS.prototype.search = function(nameKey){
  var index = -1;

  for(var i=0; i<this.people.length; i++){
    if(this.people[i].name === nameKey){
      index = i;
    }
  }

  return index;
}

WareS.prototype.jobSearch = function(nameKey){
  var index = -1;

  for(var i=0; i<this.job.length; i++){
    if(this.job[i].name === nameKey){
      index = i;
    }
  }

  return index;
}

//오목 함수
function OmokS(){
  this.people = [];
  this.map = null;
  this.black = null;
  this.white = null;
  this.count = 225;
}

function rowLeft(map, i, j){
  var x = i-1;
  var isWall = x-1;
  var row = 1;

  if(i-1 >= 0){
    for(var n=0; n<3; n++){
      if(isWall >= 0 && map[x][j] === "white" ){
        return 0;
      }else if(isWall >= 0 && map[x][j] === "black"){
        row++;
      }

      x = x-1;
      isWall = x-1;
    }

    if(row === 3 && isWall >= 0 && map[x][j] === "black"){
      row++;
    }
  }else{
    row =0;
  }

  return row;

}

function rowRight(map, i, j){
  var x = i+1;
  var isWall = x+1;
  var row = 1;


  if(i-1 >= 0 && i+1 < map.length){
    for(var n=0; n<3; n++){
      if(isWall < map.length && map[x][j] === "white"){
        return 0;
      }else if(isWall < map.length &&map[x][j] === "black"){
        row++;
      }

      x = x+1;
      isWall = x+1;
    }

    if(row === 3 && isWall < map.length && map[x][j] === "black"){
      row++;
    }
  }else{
    row = 0;
  }

  return row;
}

function cellLeft(map, i, j){
  var y = j-1;
  var isWall = y-1;
  var cell = 1;

  if(j-1 >= 0){
    for(var n=0; n<3; n++){
      if(isWall >= 0 && map[i][y] === "white"){
        return 0;
      }else if(isWall >= 0  && map[i][y] === "black"){
        cell++;
      }

      y = y -1;
      isWall = y-1;
    }

    if(cell === 3 && isWall >=0 && map[i][y] === "black"){
      cell++;
    }
  }else{
    cell = 0;
  }

  return cell;
}

function cellRight(map, i, j){
  var y = j+1;
  var isWall = y+1;
  var cell = 1;
  
  if(j-1 >= 0 && j+1 < map[i].length){
    for(var n=0; n<3; n++){
      if(isWall < map[i].length && map[i][y] === "white"){
        return 0;
      }else if(isWall < map[i].length  && map[i][y] === "black"){
       
        cell++;
      }

      y = y + 1;
      isWall = y+1;
    }

    if(cell === 3 && isWall <map.length && map[i][y] === "black"){
      cell++;
    }
  }else{
    cell = 0;
  }

  return cell;
}

function ldLeft(map, i, j){
  var x = i-1;
  var y = j-1;
  var isWall = x-1;
  var isWall2 = y-1;
  var ld = 1;

  if(i-1 >= 0 && j-1 >= 0){
    for(var n = 0; n<3; n++){
      if(isWall >= 0 && isWall2 > 0 && map[x][y] === "white"){
        return 0;
      }else if(isWall >= 0 && isWall2 > 0 && map[x][y] === "black"){
        ld++;
      }
      x = x-1;
      y = y-1;
      isWall = x-1;
      isWall2 = x-2;
    }

    if(ld === 3 && isWall >= 0 && isWall2 > 0  && map[x][y] === "black"){
      ld++;
    }
  }else{
    ld = 0;
  }
  return ld;
}

function ldRight(map, i, j){
  var x = i+1;
  var y = j+1;
  var isWall = x+1;
  var isWall2 = y+1;
  var ld = 1;

  if(i-1 >= 0 && j-1 >= 0 && i+1 < map.length && j+1 < map[i].length){
    for(var n=0; n<3; n++){
      if(isWall < map.length && isWall2 < map[i].length && map[x][y] === "white"){
       return 0;
      }else if(isWall < map.length && isWall2 < map[i].length && map[x][y] === "black"){
        ld++;
      }
  
      x = x+1;
      y = y+1;
      isWall = x+1;
      isWall2 = y+1;
    }

    if(ld === 3 && isWall < map.length && isWall2 < map[i].length  && map[x][y] === "black"){
      ld++;
    }
  }else{
    ld = 0;
  }
  return ld;
}

function rdLeft(map, i, j){
  var x = i-1;
  var y = j+1;
  var isWall = x-1;
  var isWall2 = y+1;
  var rd = 1;

  if(i-1 >= 0 && j-1 >= 0){
    for(var n=0; n<3; n++){
      if(isWall >= 0 && isWall2 < map[i].length && map[x][y] === "white"){
        return 0;
      }else if(isWall >= 0 && isWall2 < map[i].length && map[x][y] === "black"){
        rd++;
      }

      x = x-1;
      y = y+1;
      isWall = x-1;
      isWall2 = y+1; 
    }

    if(rd === 3 && isWall >= 0 && isWall2 < map[i].length  && map[x][y] === "black"){
      rd++;
    }
  }else{
    rd = 0;
  }

  return rd;
}

function rdRight(map, i, j){
  var x = i+1;
  var y = j-1;
  var isWall = x+1;
  var isWall2 = y-1;
  var rd = 1;

  if(i-1 >= 0 && j-1 >= 0 && i+1 < map.length && j+1 < map[i].length){
    for(var n=0; n<3; n++){
      if(isWall < map.length && isWall2 >= 0 && map[x][y] === "white"){
        return 0;
      }else if(isWall < map.length && isWall2 >= 0 && map[x][y] === "black"){
        rd++;
      }
      x = x+1;
      y = y-1;
      isWall = x+1;
      isWall2 = y-1;
    }

    if(rd === 3 && isWall >= 0 && isWall2 < map[i].length  && map[x][y] === "black"){
      rd++;
    }
  }else{
    rd = 0;
  }

  return rd;
}


//선택 정렬
function selectionSort(list){
  var i, j, indexMin, temp;
  
  for (i = 0; i < list.length - 1; i++){
    indexMin = i;

    for (j = i + 1; j < list.length; j++){
      if (list[j] < list[indexMin]){
        indexMin = j;
      }
    }
    
	temp = list[indexMin];
    list[indexMin] = list[i];
    list[i] = temp;
  }
  

  return list;
}


//33 찾는 함수
function checkDoubleThree(map, turn, i, j){
  var row = rowLeft(map, i , j) + rowRight(map, i, j) -1;
  var cell = cellLeft(map, i, j) + cellRight(map, i, j) -1;
  var ld = ldLeft(map, i, j) + ldRight(map, i, j) -1;
  var rd = rdLeft(map, i, j) + rdRight(map, i, j) -1;
  
  var arr = [row, cell, ld, rd];
  var list = selectionSort(arr);
  console.log(list);
  console.log("/----------------/"); 
  if(turn === "black"){
    if(list[3] === 3 && list[2] === 3){
      return "dont";
    }else{
      return "do";
    }
  }else{
    return "do";
  }
}

//rowCount

function rowCount(map, turn, i, j){
  var x = i - 1;
  var y = j;
  var rowNum = 1;

  //↑
  while(x >= 0 && y >= 0 && map[x][y] === turn){
    rowNum++;
    x -=1;
  }

  x = i + 1;
  y = j;

  //↓
  while(x < map.length && map[x][y] === turn){
    rowNum++; 
    x +=1;
  }
 
  return rowNum;
}

//cellCount
function cellCount(map, turn, i, j){
  var x = i;
  var y = j - 1;
  var cellNum = 1;
  
  //←
  while(y >= 0 && map[x][y] === turn){
    cellNum ++;
    y -= 1
  }

  x = i;
  y = j + 1;

  //→ 
  while(y < map[i].length && map[x][y] === turn){
    cellNum ++;
    y += 1;
  }

  return cellNum;
}

//lDCount
function lDCount(map, turn, i ,j){
  var x = i-1;
  var y = j-1;
  var lDNum = 1;

 
  //↖
  while(x >= 0 && y >= 0 && map[x][y] === turn){
    lDNum++;
    x -=1;
    y -=1;
  }

  x = i + 1;
  y = j + 1;

  //↘
  while(x < map.length && y < map[i].length && map[x][y] === turn){
    lDNum++;
    x +=1;
    y +=1;    
  }

  return lDNum;
}
//RDCount

function rDCount(map, turn, i ,j){
  var x = i - 1;
  var y = j + 1;
  var rDNum = 1;

  //↗
  while(x >= 0 && y < map[i].length && map[x][y] === turn){
    rDNum++;
    x -= 1;
    y += 1;
  }

  x = i + 1;
  y = j - 1;

  //↙
  while(x < map.length && y >= 0 && map[x][y] === turn){
    rDNum++;
    x +=1;
    y -=1;
  }

  return rDNum;

}

//오목 돌 세는 함수 
function checkPointer(map, turn,  i,  j){
  var win = "no";

  var row = rowCount(map, turn, i, j);
  var cell = cellCount(map, turn, i, j);
  var row = rowCount(map, turn, i, j);
  var ld = lDCount(map, turn, i, j);
  var rd = rDCount(map, turn, i, j);

  if(row === 5 || cell === 5 || ld === 5 || rd === 5){
    win = turn;
  }
  return win
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

  io.adapter(adapter({publicClient:pub, subClient:sub}));

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
        io.sockets.in(room).emit('systemMessage', {msg: user + "님이 입장하셨습니다."}); 
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
        socket.emit('systemMessage', data);
     }else{
        rooms[room].title = data.title;
        data.num = roomNum;
        data.msg = "방제가 변경되었습니다.";
        io.sockets.emit('getRoomTitle', {num:roomNum, newTitle:data.title});
        socket.emit('systemMessage', {msg:data.msg});
      }
    });

    //방장변경 ->방장 전용
    socket.on('changeRoomOwner', function(data){
      var room = people[user];
      var roomNum = roomList.indexOf(rooms[room]);
      var name = data.name;

      if(rooms[room].owner != user){
        data.msg = "당신은 방장이 아닙니다.";
        socket.emit('systemMessage', data);
      }else if(user == name){
        data.msg = "당신은 이미 방장입니다.";
        socket.emit('systemMessage', data);
      }else{

        if(rooms[room].findPerson(name) == -1){
          data.msg = "없는 유저 입니다";
          socket.emit('systemMessage', data);
        }else{
          rooms[room].owner = name;
          data.num = roomNum;
          io.sockets.in('lobby').emit('getOwner', {num:roomNum, owner:data.name, });
          io.sockets.in(room).emit('owner', {owner:name})
          io.sockets.in(room).emit('systemMessage', {msg: name + "님이 방장이 되었습니다."});
        }
      }
    });


    //강퇴 ->방장 전용
    socket.on('getOut', function(data){
      var room = people[user];
      var name = data.name;

      if(rooms[room].owner != user){
        data.msg = "당신은 방장이 아닙니다.";
        socket.emit('systemMessage', data);
      }else if(rooms[room].owner == name){
        data.msg = "자기자신을 강퇴시킬 수 없습니다.";
        socket.emit('systemMessage', data);
      }else{

        if(rooms[room].findPerson(name) == -1){
          data.msg = "없는 유저 입니다.";
          socket.emit('systemMessage', data);
        }else{
       
          data.msg = name + "님이 강퇴당하였습니다.";
          io.sockets.in(room).emit('systemMessage', data);
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
          io.sockets.in(room).emit('systemMessage', { msg: user + "님이 입장하였습니다."});
        }else{
          socket.emit('error', {type:3}); //오류
        }
        
    });


    socket.on("gameSet", function(data){ 
      var room = people[user];
 
      if(rooms[room].status === "대기중"){
        if(data.userList < rooms[room].count){
          socket.emit('systemMessage', {msg: "인원이 부족합니다."});
        }else{
          if(rooms[room].type === "warewolf"){
            game[room] = new WareS();
            var j = 0;
        
            switch(rooms[room].count){
              case '3':
                var type = [{type:'warewolf', name:'늑대인간'}, {type:'warewolf', name:'늑대인간'}, {type:'citizen', name:'천리안'}, {type:'citizen', name:'도둑'}, {type:'citizen', name:'문제아'}, {type:'citizen', name:'마을사람'}];
                var wake = 4; 
                break;
              case '5':
                var type = [{type:'warewolf', name:'늑대인간'}, {type:'warewolf', name:'늑대인간'}, {type:'citizen', name:'천리안'}, {type:'citizen', name:'도둑'}, {type:'citizen', name:'문제아'}, {type:'citizen', name:'주정뱅이'}, {type:'citizen', name:'마을사람'}, {type:'citizen', name:'마을사람'}];
                var wake = 4;
                break;
              case '7':
                var type = [{type:'warewolf', name:'늑대인간'}, {type:'warewolf', name:'늑대인간'}, {type:'citizen', name:'미니언'}, {type:'citizen', name:'천리안'},  {type:'citizen', name:'도둑'}, {type:'citizen', name:'문제아'}, {type:'citizen', name:'주정뱅이'}, {type:'citizen', name:'불면증 환자'}, {type:'citizen', name:'마을사람'}, {type:'citizne', name:'마을사람'}];
                var wake = 5; 
              case '10':
                break; 
              default :
                break;
            };

            shuffle(type);
            game[room].wake = wake; 
            
            for(var i = 0; i< rooms[room].people.length; i++){
              var person = new Object();
              person.name = rooms[room].people[i];
              person.vote = 0;

              game[room].people[i] = person; 
            }

            for(var i = 0; i < rooms[room].count; i++){
              game[room].job[i] = type[i];

              if(type[i].name === "늑대인간"){
                game[room].ware.push(rooms[room].people[i]);  
              }else if(type[i].name === "비밀요원"){
                game[room].mason.push(rooms[room].people[i]);
              }
              j++;
            }
          
            for(var i = 0; i < 3; i++){
              game[room].card[i] = type[j];
              j++; 
            }
    
            io.sockets.in(room).emit('warewolfStart', {game:game[room], people:rooms[room].people});

          }else{
            var turn = "black";
            game[room] = new OmokS();
            game[room].map = map.map(function (arr) {return arr.slice();});

            game[room].black = rooms[room].people[0];
            game[room].white = rooms[room].people[1];

           io.sockets.in(room).emit('omokStart', {game:game[room], turn:turn});
          }  

          rooms[room].status = "게임중";  
        } 
      }else{
        socket.emit('systemMessage', {msg:"이미 게임이 진행중 입니다."});
      }
    });

    // -------------- 웨어울프 -------------- //

    socket.on('firstTurn', function(data){
      var room = people[user];
      var wake = 0;
      socket.emit('moveNight', {game:game[room], myJob:data.myJob, people:rooms[room].people, wake:wake});
      socket.emit('systemMessage', {msg: "빨리 떠들고 노세여!"});
    });

    socket.on('nextTurn',function(data){
      var room = people[user];
      var wake = data.wake + 1;

      if(wake != 1){ 
        socket.emit('systemMessage', {msg:"누군가가 움직이고 있습니다..."}); 
      }

      socket.emit('moveNight', {game:game[room], myJob:data.myJob, people:rooms[room].people, wake:wake});
    });

    socket.on('showWare', function(data){
      var room = people[user];
      var text = "늑대인간 목록: " + game[room].ware[0] + ", " + game[room].ware[1];
     
      socket.emit('systemMessage', {msg:text});
    });

    socket.on('showMinion', function(data){
      var room = people[user];
      
      if(game[rooms].ware <= 0){
        socket.emit('systemMessage', {msg: "늑대인간이 없습니다."});
      }else{
        var text = "늑대인간 목록: "
      
        for(var i = 0; i < game[room].ware.length; i++){
          if(i === game[room].ware.length -1){
            text += game[room].ware; //마지막 늑대 출력
          }else{
            text += game[room].ware + ",";
          }
        }

        socket.emit('systemMessage', {msg:text});
      }
    });

    socket.on('showMason', function(data){
      var room = people[user];
      var text = "비밀요원 목록: "
      
      for(var i = 0; i < game[room].ware.length; i++){
        if(i === game[room].ware.length -1){
          text += game[room].ware; //마지막 늑대 출력
        }else{
          text += game[room].ware + ",";
        }
      }

      socket.emit('systemMessage', {msg:text});
    }); 

    socket.on('showSeer', function(data){
      var room = people[user];
      var sUser = data.user;
     
      if(user != "noUser"){
        var num = game[room].search(sUser);
        
        if(num != -1){
          var job = game[room].job[num].name;
          socket.emit("systemMessage", {msg:sUser + "님의 직업은 " + job + "입니다."});
        }else{
          socket.emit("systemMessage", {msg:"천리안은 폭파해따 뻥!!"});
        }
      }
    });

    socket.on('showRobber', function(data){
      var room = people[user];
      var sUser = data.user;
      var myJob = data.myJob;
      var num = game[room].search(sUser);
      var job = game[room].job[num] //선택한 사람의 직업
      var rUser = game[room].jobSearch(myJob.name); //도둑이 담겨 있는 배열
      var temp = game[room].job[rUser]; //도둑 

      console.log(game[room].job);
      game[room].job[num] = temp; //선택한 사람을 도둑으로 바꾸고
      game[room].job[rUser] = job; //내직업을 선택한 사람의 직업으로 바꿈
      
      console.log(game[room].job);
       
      socket.emit("systemMessage", {msg:"당신의 직업은 " + job.name + "입니다."});
      
    });

    socket.on('showTrouble', function(data){
      var room = people[user];
      var sUser = data.user1; //첫번째 선택한 사람
      var sUser2 = data.user2; //두번째 선택한 사람
      var num = game[room].search(sUser);
      var num2 = game[room].search(sUser2);
      var temp = game[room].job[num]; //첫번째 유저 직업

      console.log(game[room].job);

      game[room].job[num] = game[room].job[num2];
      game[room].job[num2] = temp;

      console.log(game[room].job);
    });

    socket.on('showDrunk', function(data){
      var room = people[user];
    });
 
    socket.on('checkVote', function(data){
      var room = people[user];

      if(game[room].status == "대기중"){
        socket.emit('systemMessage', {msg:"게임중이 아닙니다."});
      }else{
        if(!game[room].isVote){
          game[room].isVote = true;

          io.sockets.in(room).emit('showVote', {people:rooms[room].people});
          socket.emit('systemMessage', {msg:"투표를 시작합니다. 의심되는 사람을 지목해주세요."});
        }
      }
    });

    socket.on('skipVote', function(data){
      var room = people[user];
      
      if(rooms[room].status == "대기중"){
        socket.emit('systemMessage', {msg:"게임중이 아닙니다."});
      }else{
       
        if(!game[room].isVote){
          var num = game[room].skip.indexOf(user);
          var pNum = rooms[room].people.length/2;

          if(num === -1){
            game[room].skip.push(user);

            io.sockets.in(room).emit('systemMessage', {msg:user + "님이 낮 스킵에 동의했습니다."});

            if(game[room].skip.length > pNum){
              game[room].isVote = true;

              io.sockets.in(room).emit('showVote', {people:rooms[room].people});
              io.sockets.in(room).emit('systemMessage', {msg:"과반수 스킵 동의로 투표를 시작합니다. 의심되는 사람을 지목해주세요."});
            }

          }else{
            socket.emit('systemMessage', {msg:"이미 스킵버튼을 눌렀습니다."});
          }
        }
      }
    });
   
    socket.on("voteUser", function(data){
      var room = people[user];
      var vUser = data.vUser;
      var vNum = game[room].search(vUser);
      var time = null;
      var select = null;

      game[room].people[vNum].vote++;

      select = game[room].people.sort(function(a, b){
        if(a.vote < b.vote){
          return 1;
        }else if(a.vote > b.vote){
          return -1;
        }

        return 0;
      });
      
      for(var i = 0; i<game[room].people.length; i++){
         if(i === 0){
           game[room].dead.push(select[i]);
         }else{
           if(select[i].vote >= select[0].vote){
             game[room].dead.push(select[i]);
           }
         }
      }

      console.log(game[room].dead);

      time = setTimeout(function(){
        socket.emit('showResult', {});
      }, 30000);
    });

    // -------------- 오목 -------------- //
    socket.on('checkPoint', function (data){

      var room = people[user];
      var x = data.x;
      var y = data.y;
      var win = null;
      var three = null;

      if(rooms[room].status != "대기중"){
        win = checkPointer(game[room].map, data.turn ,x , y);    
	three = checkDoubleThree(game[room].map, data.turn, x, y);
  
        game[room].count--;
       	  
	if(game[room].count <= 0){
	  io.sockets.in(room).emit('omokResult', {result:"draw"});
	  rooms[room].status = "대기중";
	}else if(game[room].count > 0 && win != "no"){        
	  rooms[room].status = "대기중";
          game[room].map[x][y] = data.turn;

	  io.sockets.in(room).emit('omokResult', {result:win, black:game[room].black, white:game[room].white, x:data.x, y:data.y});
	}else{
          if(three === "do"){
            game[room].map[x][y] = data.turn;

	    if(data.turn === 'black'){
	      data.turn = 'white';
	    }else{
	      data.turn = 'black';
	    }

	    io.sockets.in(room).emit('turn',{turn:data.turn, x:data.x, y:data.y, changeValue:game[room].map[data.x][data.y]});
          }else{
            socket.emit('systemMessage', {msg:"쌍삼 입니다 :) 아님 말고요!"});
          }
	}
      }else{
         socket.emit('systemMessage', {msg:"게임중이 아닙니다."});
      }
    }); 

    socket.on('compulsionTurn', function(data){
      var room = people[user];

      if(data.turn === 'black'){
        data.cTurn = "black";
        data.turn = 'white';
      }else{
        data.cTurn = 'white';
        data.turn = 'black';
      }
      io.sockets.in(room).emit('cTurn', {cTurn:data.cTurn, turn:data.turn});     
    });
    //
  
    socket.on('disconnect', function(data){
      var room = people[user];
      var roomNum = roomList.indexOf(rooms[room]);

      
      if(people[user] != undefined && lobby[user] === undefined){
        console.log(user + "나감");
        rooms[room].removePerson(user);
        
        
        io.sockets.in(room).emit('systemMessage', { msg: user + "님이 퇴장하였습니다."});        
    
        if(rooms[room].people.length == 0){
          roomList.splice(roomNum, 1);
          delete rooms[room];

        }else{
          io.sockets.in(room).emit('userList', {users:rooms[room].people});  

          if(rooms[room].owner == user){
            rooms[room].owner = rooms[room].people[0];
            io.sockets.in(room).emit('owner', {owner: rooms[room].owner});
            io.sockets.in(room).emit('systemMessage', {msg:rooms[room].owner + "님이 방장이 되었습니다."});
          }

          if(rooms[room].status === "게임중"){
            if(rooms[room].type === "omok"){
              if(game[room].black === user){
	        io.sockets.in(room).emit('omokCResult', {result:"white", black:game[room].black, white:game[room].white});               
                rooms[room].status = "대기중";
              }else{
                io.sockets.in(room).emit('omokCResult', {result:"black", black:game[room].black, white:game[room].white});
                rooms[room].status = "대기중"; 
              }
            }else{
            
            }
          }
        }
   
        delete people[user];
 
      }else{
        io.sockets.in("lobby").emit('systemMessage', {msg: user + "님이 퇴장하였습니다."});
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
