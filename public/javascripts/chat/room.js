var socket = io.connect('',{ 
  'connect timeout': 10000,
  'reconnect': true,
  'reconnection delay': 500,
  'reconnection attempts': 10
});
//var socket = io.connect('http://52.69.146.224:3000');
/*var socket = io.connect("http://sigyeiswatch.com:3000");*/

function divEscapedContentElement(message){
  var chatText = $("<span class = 'chat-text'></span>");
  var user = $("<span class = 'user'></span>").text(message.user);
  var chat = $("<span class = 'text'></span>").text(message.msg);
  chatText.append(user);
  chatText.append(chat);
 
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
  
  socket.on('setRoom', function(data){
    var title = data.room.title;
    var owner = data.room.owner;

    $("#roomTitle").text(title);
    ownerButton(owner);
  });


  socket.on('userList', function(data){
    $("ul.user-list").empty();
    var length = data.users.length;
    
    for(var i = 0; i < length; i++){
      var li = $("<li>" + data.users[i] + "</li>");
      $("ul.user-list").append(li);
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

  socket.on('gameStart', function(data){
    console.log(data);
    var client = $("a.name").text();
    var game = data.game;
    var jobNum = game.people.indexOf(client);
    var myJob = game.job[jobNum];

    $("span.job").text(myJob);
    $("#message").empty();
    $("#message").append("<span class = 'chat-text'>당신의 직업은 " + myJob + "입니다.</span>");

    moveNight(game, myJob);
  });
});
