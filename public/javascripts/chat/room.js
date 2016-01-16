var socket = io.connect();
//var socket = io.connect('http://52.69.146.224:3000');
/*var socket = io.connect("http://sigyeiswatch.com:3000");*/

function divEscapedContentElement(message){
  var chatText = $("<span class = 'chat_text'></span>");
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

function ownerButton(owner){
  var client = $("a.name").text();
  
  if(client == owner){
    $("span.button").append("<button id = 'start' onclick = 'javascript:start();'>게임시작</button>");
  }
}

function start(){
  var client = $("a.name").text();
  socket.emit('gameStart', {user: client});
}

$(document).ready(function(){
  var chatApp = new Chat(socket);

  socket.emit('joinRoom', {});
  
  socket.on('setRoom', function(data){
    var title = data.room.title;
    var owner = data.room.owner;

    $("#roomTitle").text(title);
    $("#owner").text(owner);
    ownerButton(owner);
  });


  socket.on('userList', function(data){
     
    var length = data.users.length;
    console.log(length);
    console.log(data.users);

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
    ownerButton(data);
  });

  socket.on('goOut', function(data){
    var client = $("a.name").text();
   
    if(client == data.name){

      location.replace('/chat');
    }
  });
});
