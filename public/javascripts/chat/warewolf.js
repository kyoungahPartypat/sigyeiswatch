var popDiv = document.getElementById('popup');
var jobDiv = document.getElementById('jobActive');
var cardClick = 0;

function showCard(li, card){
  var surplusCard = document.getElementsByClassName('surplus-card');

  for( var i = 0; i < surplusCard.length; i++){
    if(surplusCard[i] == li){
      li.innerHTML = card[i];
    }
  }
}

function surplusCard(popup, myJob, card){
  var ul = document.createElement('ul');
  var card = card;
 
  for(var i = 0; i < card.length; i++){

    var li = document.createElement('li');
    li.className = "surplus-card";
    li.onclick = function(){
      cardClick++;
 
      if(myJob == "천리안"){
        var select = document.getElementById('select');

        if(select){
           jobDiv.removeChild(select);
        }
      }
     
      if(cardClick <=2){
        var indexLi = this;
        showCard(indexLi, card);
      }else{
        jobDiv.removeChild(ul);
        popup.close();
        return;
      }
    };
    ul.appendChild(li);
  }

  jobDiv.appendChild(ul);
}

function doppelganger(game, people, myJob){
  if(myJob == "도플갱어"){
    console.log('준비중 ㅎ');
  }
};

function warewolf(game, myJob){
  var popup = new Popup(popDiv, {width:300, height:150});
  if(myJob == "늑대인간"){
    if(game.ware.length == 1){
     surplusCard(popup, myJob, game.card); 
     popup.open();

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

function seer(game, people, myJob){

  if(myJob == "천리안"){
    var popup = new Popup(popDiv, {width:300, height:200});
    var select = document.createElement('select');    
    select.id = "select";    
 
    for(var i = 0; i < people.length; i++){
      var option = document.createElement('option');
      option.value = i;
      option.onchange = function(){
        socket.emit("showSeer", {});
        jobDiv.remove();
        popup.close();
      }
     
      select.appendChild(option);
    }
    jobDiv.appendChild(select);
    surplusCard(popup, myJob, game.card);
    popup.open();
  }
};

function robber(people, myJob){
  if(myJob == "도둑"){

  }
};

function drunk(game, myJob){
  if(myJob == "주정뱅이"){

  }
};

function insomeniac(myJob){
  if(myJob == "불면증환자"){
    socket.emit('showInsome', {});
  }
};

function moveNight(game, people, myJob){
  cardClick = 0;
  console.log(myJob);
  for(var i = 0; i < game.wake; i++){
    console.log(i);
    switch(i){
      case 0:
        var isDoppel = game.job.indexOf("도플갱어");
        var surDoppel = game.card.indexOf('도플갱어');

        if(isDoppel != -1 && surDoppel == -1){
          doppelganger(game, people, myJob);
        }
        break;

      case 1:
        warewolf(game, myJob);
        minion(game, myJob);
        mason(game, myJob);
        break;

      case 2:
        seer(game, people, myJob);
        break;

      case 3:
        robber(game, people, myJob);
        break;

      case 4:
        troubleMaker(people, myJob);
        break;

      case 5:
        drunk(game, myJob);
        break;

      case 6:
        insomeniac(myJob); 
        break;
    }
  }
};
