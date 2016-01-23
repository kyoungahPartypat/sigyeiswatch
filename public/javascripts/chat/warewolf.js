var me = document.getElementById('myName').value;
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

function selectUsers(people, me){
  var select = document.createElement('select');
 
  select.onchange = function(){
    if(myJob == "천리안"){
      if(cards){
        var ul = document.getElementById('cards');
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

function doppelganger(game, myJob){
  if(myJob == "도플갱어"){
    console.log('준비중 ㅎ');
  }
};

function warewolf(game, myJob){
  var popup = new Popup(popDiv, {width:300, height:150});
  if(myJob == "늑대인간"){
    if(game.ware.length == 1){
     surplusCard(game.card, myJob); 
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

function seer(game, myJob){

  if(myJob == "천리안"){
    var popup = new Popup(popDiv, {width:300, height:200});
    selectUsers(game.people, me);
    surplusCard(game.card, myJob);
    popup.open();
  }
};

function robber(game, myJob){
  if(myJob == "도둑"){
    var popup = new Popup(popDiv, {width:300, height:100});
    selectUsers(game.people, me);
    popop.open();
  }
};

function troubleMaker(game, myJob){
  if(myJob == "문제아"){
    var popup = new Popup(popDiv, {width:300, height:150});
    selectUsers(game.people, me);
    selectUsers(game.people, me);
  } 
};

function drunk(game, myJob){
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
  cardClick = 0;
  console.log(myJob);
  for(var i = 0; i < game.wake; i++){
    console.log(i);
    switch(i){
      case 0:
        var isDoppel = game.job.indexOf("도플갱어");
        var surDoppel = game.card.indexOf('도플갱어');

        if(isDoppel != -1 && surDoppel == -1){
          doppelganger(game,  myJob);
        }
        break;

      case 1:
        warewolf(game, myJob);
        minion(game, myJob);
        mason(game, myJob);
        break;

      case 2:
        seer(game, myJob);
        break;

      case 3:
        robber(game, myJob);
        break;

      case 4:
        troubleMaker(game, myJob);
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
