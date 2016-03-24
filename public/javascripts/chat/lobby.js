var socket = io.connect('http://sigyeiswatch.com',{ 
  'connect timeout': 10000,
  'reconnect': true,
  'reconnection delay': 500,
  'reconnection attempts': 10
});

function createRoom(title, type, count){
  socket.emit('createRoom', {title:title, type:type, count:count});
}

function divEscapedContentElement(message){
  var chatText = $("<span class = 'chat_text'></span>");
  var user = $("<span class = 'user'></span>").text(message.user);
  var chat = $("<span class = 'text'></span>").text(message.msg);
  chatText.append(user);
  chatText.append(chat);
 
  return chatText;
}


function joinRoom(num){
    socket.emit('roomClick', {num:num});
}

$(document).ready(function(){
  socket.emit('joinLobby', {});
 
  $("#send-message").keyup(function(event){
    if(event.which == 13){
      socket.emit('lobbyChat', {msg:$(this).val()});
      $(this).val("");
      $(this).focus();
    }  
  });

  $("#send-form").submit(function(){
    var title = $('#roomTitle').val();
    var type = $('#type').val();
    var count = null;

    if(type === "warewolf"){
      count = $('#userCount').val();
    }else{
      count = 2;
    } 

    if(title.length <= 0){
      $('#roomTitle').focus();
      return false;
    }else{
      createRoom(title, type, count);
    }
  });

  socket.on('lobbyMsg', function(data){
    $("#message").append(divEscapedContentElement(data));
    $("#message").scrollTop($("#message").prop('scrollHeight'));
  });


  socket.on('userList', function(data){
   var users = data.users;
    $("#userList").empty();

    if(data.users.length <= 0){
      $("#userList").append("<li>no person</li>");
    }else{
      for(var i = 0; i < data.users.length; i++){
        $("#userList").append("<li>" + users[i] + "</li>");
      }
    }
  });

  socket.on('roomList', function(data){
   
    $("#room-list > tbody").empty(); 
    var tr = $('<tr class = "rooms"></tr>');
    var rooms = data.rooms;

    if(data.rooms.length <= 0){
       tr.append("<td colspan = '5'>개설된 방이 없습니다.</td>");
       $("#room-list > tbody").append(tr);
    }else{ 
      for(var i = 0; i<data.rooms.length; i++){
        tr.append("<td class = 'no hidden-xs'>" + rooms[i].num + "</td>");
        tr.append("<td class = 'title' onclick = 'joinRoom(" + rooms[i].num + ")'>" + rooms[i].title + "</td>");
        tr.append("<td class = 'owner hidden-xs'>" + rooms[i].owner + "</td>");
        tr.append("<td class = 'people'>" + rooms[i].people.length + "/" +  rooms[i].count + "</td>");
        tr.append("<td class = 'status'>" + rooms[i].status+ "</td>");
      
        $("#room-list > tbody").append(tr);
        var tr = $('<tr class ="rooms"></tr>');
      }
    }
  });

  socket.on('gotoRoom', function(data){
    var type = data.type;
    var check = data.join;

   
    if(type === "warewolf" && check === "yes"){
      location.href= "/chat/warewolf";
    }else if(type === "omok" && check === "yes"){
      location.href="/chat/omok";
    }else{
      return false;
    }
  });
  
  socket.on('errorOutput', function(data){
    location.href = '/users/logout';
  });

});
