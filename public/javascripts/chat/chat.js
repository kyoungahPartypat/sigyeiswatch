var Chat = function(socket){
  this.socket = socket;
}

Chat.prototype.sendMessage = function(text){
  var message = {
    msg: text 
  };

  this.socket.emit('sendMessage', message);
}

//명령 수행 함수
Chat.prototype.processCommand = function(command){
  var words = command.split(' ');
  var command = words[0].substring(1, words[0].length).toLowerCase();


  switch(command){
    case '방제':
      words.shift();

      var title = words.join(' ');
      this.socket.emit('changeRoomTitle', {title:title});
      break;

    case '방장':
      words.shift();

      var owner = words.join(' ');
      this.socket.emit('changeRoomOwner', {name: owner});
      break;

    case '강퇴':
      words.shift();

      var name = words.join(' ');
      this.socket.emit('getOut', {name: name});
      break;
    
    default:
      break;
  }
}
