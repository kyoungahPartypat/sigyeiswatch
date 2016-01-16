var socket = io.connect();

function createRoom(title, count){
  socket.emit('createRoom', {title:title, count:count});
}

function divEscapedContentElement(message){
  var chatText = $("<span class = 'chat_text'></span>");
  var user = $("<span class = 'user'></span>").text(message.user);
  var chat = $("<span class = 'text'></span>").text(message.msg);
  chatText.append(user);
  chatText.append(chat);
 
  return chatText;
}


function joinRoom(room){
    socket.emit('roomClick', {num:room.num});
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
    var count = $('#userCount').val();

    if(title.length <= 0){
      $('#roomTitle').focus();
      return false;
    }else{
      createRoom(title, count);
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
        tr.append("<td class = 'no'>" + rooms[i].num + "</td>");
        tr.append("<td class = 'title' onclick = 'joinRoom(" + rooms[i].num + ")'>" + rooms[i].title + "</td>");
        tr.append("<td class = 'owner'>" + rooms[i].owner + "</td>");
        tr.append("<td class = 'people'>" + rooms[i].people.length + "/" +  rooms[i].count + "</td>");
        tr.append("<td class = 'status'>" + rooms[i].status+ "</td>");
      
        $("#room-list > tbody").append(tr);
        var tr = $('<tr class ="rooms"></tr>');
      }
    }
  });
  
  socket.on('errorOutput', function(data){
    alert(data.text);
  });

});
