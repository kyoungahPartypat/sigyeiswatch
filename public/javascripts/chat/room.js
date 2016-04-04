var socket = io.connect('http://sigyeiswatch.com',{ 
  'connect timeout': 2000,
  'reconnect': true,
  'reconnection delay': 1000,
  'max reconnection attempts': 5
});

var color = null;
var turn = null;
var map = null;
var cTurn = null;
var cTime1 = null;
var cTime2 = null;

function roomSet(room){
  var title = room.title;
  var owner = room.owner;

  $("#roomTitle").text(title);
  ownerButton(owner);
}

function divEscapedContentElement(message){
  var chatText = $("<span class = 'chat-text'></span>");
  var user = $("<span class = 'user'></span>").text(message.user);
  var chat = $("<span class = 'text'></span>").text(message.msg);
  chatText.append(user);
  chatText.append(chat);
 
  return chatText;
}

function systemMessage(message){
  var chatText = $("<span class = 'chat-text system-text'></span>");
  chatText.append(message);
 
  return chatText;
}

function processUserInput(chatApp, socket){
  var text = $("#send-message").val();
  if(text.length <= 0){
    $("#send-message").focus();
  }else if(text.charAt(0) == '/'){
    chatApp.processCommand(text);
  }else{
    chatApp.sendMessage(text);
  }

  $("#send-message").val('');
}

function gameSet(){
  var userLength = $("div.p-users > ul.user-list > li.show-user").length;
  
  socket.emit("gameSet", {userList:userLength});
}

function gameStart(){
  $("#message").empty();
  $("#message").append("<span class = 'chat-text system-text'>게임을 시작합니다</span>");
}

function ownerButton(owner){
  var client = $("a.name").text();

  if(client == owner){
    $("span.button").append("<button id = 'start' onclick = 'javascript:gameSet();' class = 'btn btn-success'>게임시작</button>");
  }else{
    $("span.button").empty();
  }
}

function omokResult(result){
  var winner = document.getElementsByClassName('winner');
 
  turn = null;
  clearInterval(cTime1);
  clearTimeout(cTime2);
  cTime1 = null;
  cTime2 = null;

  switch(result.result){
    case "draw":
      winner[0].innerHTML = "무승부";
      break;
    case "black":
      winner[0].innerHTML = result.black + "<br /> 승리!";
      break;
    case "white":
      winner[0].innerHTML = result.white + "<br /> 승리!";
      break;
    default:
      break;
  }; 

  winner[0].style.display = "block";
}

$(document).ready(function(){
  var chatApp = new Chat(socket);

  socket.emit('joinRoom', {});
  
  socket.on('userList', function(data){
    $("ul.user-list").empty();
    var length = data.users.length;
    
    for(var i = 0; i < length; i++){
      var li = $("<li class = 'show-user'>" + data.users[i] + "</li>");
      var div = $("<div class = 'm-color'></div>");
      $("ul.user-list").append(li);
      $("div.m-users > div > ul.omok-user-list > li").append(div);
    }
  });

  $("#send-message").keyup(function(event){
    if(event.which == 13){
      processUserInput(chatApp, socket);
      $(this).val('');
    }
  });

  socket.on('systemMessage', function(data){
    $("#message").append("<span class = 'chat-text system-text'>" + data.msg + "</span>");
    $("#message").scrollTop($("#message").prop('scrollHeight'));
  });

  socket.on('message', function(data){
    $("#message").append(divEscapedContentElement(data));
    $("#message").scrollTop($("#message").prop('scrollHeight'));
  });

  socket.on('owner', function(data){
    ownerButton(data.owner);
  });

  socket.on('goOut', function(data){
    var client = $("a.name").text();
   
    if(client == data.name){

      location.replace('/chat');
    }
  });

  // ------------- 웨어울프 ------------- //
  socket.on('setWarewolf', function(data){
    var room = data.room;
    roomSet(room);
  }); 

  socket.on('warewolfStart', function(data){
    var game = data.game;
    var people = data.people;
    var client = $("#myName").text();
    var jobNum = people.indexOf(client);
    var myJob = game.job[jobNum];
   
    gameStart();
    $("#message").append("<span class = 'chat-text'>당신의 직업은 " + myJob + " 입니다.</span>");

    socket.emit('firstTurn', {game:game, myJob:myJob});
  });

  socket.on('moveNight', function(data){
    moveNight(data);
  });
  // ------------------------------------ //

  // ------------- 오목 ------------- //
  socket.on('setOmok', function(data){
    var room = data.room;
    var pane = document.getElementsByTagName('td');
    
    roomSet(room);
    mapSet(document.getElementById('pane'), data.map);
    mapReset(data.map);

    for(var i = 0; i< pane.length; i++){
      pane[i].addEventListener('click', function(){clickEvent(this, color, turn, map, cTurn)});
    }
  })

  socket.on('omokStart', function(data){
    var m = 18;
    var game = data.game;
    var me = document.getElementById('myName').text;
    var job = document.getElementsByClassName('color');
    var showTurn = document.getElementsByClassName('turn');
    var mshowTurn = document.getElementsByClassName('m-users')[0].getElementsByTagName('li');
    var time = document.getElementsByClassName('time');   
    var winner = document.getElementsByClassName('winner');
 
    turn = data.turn;
    map = game.map;
    
    mapReset(game.map);
    gameStart();

    if(me === game.black){
      color = 'black';
      job[0].innerHTML = "검은돌";
    }else{
      color = 'white';
      job[0].innerHTML = "흰돌";
    }

    showTurn[0].style.background = "url('/images/omok.png')";
    showTurn[0].style.backgroundPosition = "-270px 0"; 
    mshowTurn[0].style.backgroundColor = "#ddd";
    winner[0].style.display = "none";

    cTime1 = setInterval(function(){
      if(m === 1){
        clearInterval(cTime1);
      }else{
        m -=1;
        time[0].innerHTML = m;
        time[1].innerHTML = m;
      }

    }, 1000);

    cTime2 = setTimeout(function(){
      if(!cTurn){
        socket.emit('compulsionTurn', {turn:turn});
      }
    }, 18000);
  });

  socket.on('turn', function(data){
    var m = 18;
    var showTurn = document.getElementsByClassName('turn');
    var mshowTurn = document.getElementsByClassName('m-users')[0].getElementsByTagName('li');
    var time = document.getElementsByClassName('time');
    turn = data.turn;
    map[data.x][data.y] = data.changeValue;

    document.getElementsByTagName('table')[0].rows[data.x].cells[data.y].className = data.changeValue;

    changeTurn(data.changeValue);
    cTurn = false;
    
    clearInterval(cTime1);
    clearTimeout(cTime2);

    cTime1 = setInterval(function(){
      if(m === 1){
        clearInterval(cTime1);
      }else{
        m -=1;
        time[0].innerHTML = m;
      }
    }, 1000);

    cTime2 = setTimeout(function(){
      if(!cTurn){
        socket.emit('compulsionTurn', {turn:turn});
      }
    }, 18000);
  });

  socket.on('cTurn', function(data){
    var m = 18;
    var time = document.getElementsByClassName('time');
    turn = data.turn;

    clearInterval(cTime1);
    clearTimeout(cTime2);
    changeTurn(data.cTurn);

    cTime1 = setInterval(function(){
      if(m === 1){
        clearInterval(cTime1);
      }else{
        m -=1;
        time[0].innerHTML = m;
        time[1].innerHTML = m;
      }
    }, 1000);

    cTime2 = setTimeout(function(){
      if(!cTurn){
        socket.emit('compulsionTurn', {turn:turn});
      }
    }, 18000);

  });

  socket.on('omokResult', function(data){
    var result = data;
    document.getElementsByTagName('table')[0].rows[data.x].cells[data.y].className = data.result;
    omokResult(result);

  });

  socket.on('omokCResult', function(data){
    var result = data;
    omokResult(result);
  });

  // ------------------------------------ //
  
  socket.on('errorOutput',function(){
    location.href = "/users/logout";
  });

});
