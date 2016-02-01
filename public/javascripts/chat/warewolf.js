var popDiv = document.getElementById('popup');
var jobDiv = document.getElementById('jobActive');
var cardClick = 0, wake = 0;

function showCard(li, card){
  var surplusCard = document.getElementsByClassName('surplus-card');

  for( var i = 0; i < surplusCard.length; i++){
    if(surplusCard[i] == li){
      li.innerHTML = card[i];
    }
  }
}

function selectUsers(people, myJob){
  var me = document.getElementById('myName').text;
  var select = document.createElement('select');
 
  select.onchange = function(){
    if(myJob == "천리안"){
      var ul = document.getElementById('cards');

      if(ul){
        jobDiv.removeChild(ul);
      }
    }
  }

  for(var i = 0; i < people.length; i++){
    if(people[i] != me){
      var option = document.createElement('option');
      option.text = people[i];
      option.value = i;
      select.appendChild(option);
    }
  }

  jobDiv.appendChild(select);
  
}

function surplusCard(card, myJob){
  var ul = document.createElement('ul');
  ul.id = "cards";
 
  for(var i = 0; i < card.length; i++){

    var li = document.createElement('li');
    li.className = "surplus-card";
    li.onclick = function(){
      cardClick++;
 
      if(myJob == "천리안"){
        var select = document.getElementsByTagName('select');

        if(select[0]){
           jobDiv.removeChild(select[0]);
        }
      }
      
      if(myJob == "취객"){
        if(cardClick <=1){
          var surplusCard = document.getElementsByClassName('surplus-card');

          for( var i = 0; i < surplusCard.length; i++){
            if(surplusCard[i] == this){
              socket.emit("showDrunk", {card:card[i]});
            }
          }
        }
      }else{
        if(cardClick <=2){
          var indexLi = this;
          showCard(indexLi, card);
        }
      }
    }

    ul.appendChild(li);
  }

  jobDiv.appendChild(ul);
}

function closePopup(popup){
  setTimeout(function(){
    jobDiv.remove();
    popup.close();
  }, 5000);
}

function doppelganger(game, myJob){
  if(myJob == "도플갱어"){
    console.log('준비중 ㅎ');
  }
};

function warewolf(game, myJob){
  if(myJob == "늑대인간"){
    if(game.ware.length == 1){
     var popup = new Popup(popDiv, {width:300, height:150});
     surplusCard(game.card, myJob); 
     popup.open();
     closePopup(popup);

    }else if(game.ware.length >= 2){
      socket.emit('showWare', {});
    }
  }
};

function minion(game, myJob){
  if(myJob == "미니언"){
    socket.emit("showMinion", {});
  }
};

function mason(game, myJob){
  if(myJob == "비밀요원"){
    socket.emit("showMason", {});
  }
};

function seer(game, myJob){
  if(myJob == "천리안"){
    var popup = new Popup(popDiv, {width:300, height:200});
    selectUsers(game.people, myJob);
    surplusCard(game.card, myJob);
    popup.open();
    closePopup(popup);

  }
};

function robber(game, myJob){
  wake++;

  if(myJob == "도둑"){
    var popup = new Popup(popDiv, {width:300, height:100});
    selectUsers(game.people, myJob);
    popup.open();
   
    setTimeout(function(popup){
      var showUser = document.getElementByTagName('select');
      socket.emit('showRobber', {showUser:showUser[0].value});
      socket.emit('nextTurn', {wake:wake});
    }, 5000);
  }else{
    setTimeout(function(){
      socket.emit('nextTurn', {wake:wake});
    }, 5000);
  }
};

function troubleMaker(game, myJob){
  wake++;

  if(myJob == "문제아"){
    var popup = new Popup(popDiv, {width:300, height:150});
    selectUsers(game.people, myJob);
    selectUsers(game.people, myJob);
    popup.open();

    setTImeout(function(){
      
      var showUser = document.getElementByTagName('select');
      socket.emit('showTrouble', {showUser:showUser[0].value, showUserTwo:showUser[1].value});
      socket.emit('nextTurn', {wake:wake});
    }, 5000);
  }else{
    setTimeout(function(){
      socket.emit('nextTurn', {wake:wake});
    },5000);
  }
};

function drunk(game, myJob){
  wake++;

  if(myJob == "취객"){
    var popup = new Popup(popDiv, {width:300, height:150});
    surplusCard(myJob, game,card); 
    popup.open();

  }
};

function insomeniac(myJob){
  if(myJob == "불면증환자"){
    socket.emit('showInsome', {});
  }
};

function moveNight(game, myJob){
  var moveWake = game.wake;
  wake = 0;
  cardClick = 0;

  socket.on('moveNight', function(data){
    wake = data.wake;

    if(wake < moveWake);
      switch(wake){
        case 0:
          var isDoppel = game.job.indexOf("도플갱어");
          var surDoppel = game.card.indexOf('도플갱어');

          if(isDoppel != -1 && surDoppel == -1){
            doppelganger(game,  myJob);
          }

          setTimeout(function(){
            socket.emit('nextTurn', {wake:wake});
          }, 10000);
          break;

        case 1:
          warewolf(game, myJob);
          minion(game, myJob);
          mason(game, myJob);
          seer(game, myJob);
          wake++;
          socket.emit('nextTurn', {wake:wake});
          break;

        case 2:
          robber(game, myJob);
          break;

        case 3:
          troubleMaker(game, myJob);
          break;

        case 4:
          drunk(game, myJob);
          break;

        case 5:
          insomeniac(game, myJob);
          wake++;
          socket.emit('nextTurn', {wake:wake});
          break;

        default:
          break;
      }
    }else{
      //밤 끝나다고 메세지 뿌리기 
    }
  });
};
