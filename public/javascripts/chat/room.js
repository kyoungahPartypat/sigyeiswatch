var socket = io.connect('http://sigyeiswatch.com',{ 
  'connect timeout': 10000,
  'reconnect': true,
  'reconnection delay': 500,
  'reconnection attempts': 10
});

var color = null;
var turn = null;
var map = null;

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
    $("#send-message")
  }else if(text.charAt(0) == '/'){
    chatApp.processCommand(text);
  }else{
    chatApp.sendMessage(text);
  }

  $("#send-message").val('');
}

function gameSet(){
  socket.emit("gameSet", {});
}

function ownerButton(owner){
  var client = $("a.name").text();
  console.log(owner); 
  if(client == owner){
    $("span.button").append("<button id = 'start' onclick = 'javascript:gameSet();' class = 'btn btn-success'>게임시작</button>");
  }else{
    $("span.button").empty();
  }
}

$(document).ready(function(){
  var chatApp = new Chat(socket);

  socket.emit('joinRoom', {});
  
  socket.on('userList', function(data){
    $("ul.user-list").empty();
    var length = data.users.length;
    
    for(var i = 0; i < length; i++){
      var li = $("<li>" + data.users[i] + "</li>");
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
  // ------------------------------------ //

  // ------------- 오목 ------------- //
  socket.on('setOmok', function(data){
    var room = data.room;
    var pane = document.getElementsByTagName('td');
    
    roomSet(room);
    mapSet(document.getElementById('pane'), data.map);
    mapReset(data.map);

    for(var i = 0; i< pane.length; i++){
      pane[i].addEventListener('click', function(){clickEvent(this, color, turn, map)});
    }
  })

  socket.on('omokStart', function(data){
    var game = data.game;
    var me = document.getElementById('myName').text;
    var job = document.getElementsByClassName('color');
    var showTurn = document.getElementsByClassName('turn');
    var mshowTurn = document.getElementsByClassName('m-users')[0].getElementsByTagName('li');
    turn = data.turn;
    map = game.map;

    mapReset(game.map);

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
  });

  socket.on('turn', function(data){
    var showTurn = document.getElementsByClassName('turn');
    var mshowTurn = document.getElementsByClassName('m-users')[0].getElementsByTagName('li');
    turn = data.turn;
    map[data.x][data.y] = data.changeValue;

    document.getElementsByTagName('table')[0].rows[data.x].cells[data.y].className = data.changeValue;

    if(data.changeValue === "black"){
      showTurn[0].style.backgroundPosition = "-300px 0";
      mshowTurn[0].style.background = "none";
      mshowTurn[1].style.backgroundColor = "#ddd";
    }else{
      showTurn[0].style.backgroundPosition = "-270px 0";    
      mshowTurn[0].style.backgroundColor = "#ddd";
      mshowTurn[1].style.background = "none";
    }
  });

  socket.on('cTurn', function(data){
    turn = data.turn;
  });

  socket.on('result', function(data){
    switch(data.result){
      case "draw":
        alert("무승부");
        break;
      case "black":
        alert("검은돌 승리!");
        break;
      case "white":
        alert("흰돌 승리!");
        break;
      default:
        break;
    }; 
    turn = null; 
  });

  // ------------------------------------ //
  
  socket.on('errorOutput',function(){
    location.href = "/users/logout";
  });
});
