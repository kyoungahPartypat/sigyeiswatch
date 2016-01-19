var jobDiv = document.getElementById("jobActive");
var cardClick = 0;


function surplusCard(div, card){
  var ul = document.createElement('ul');
      
  for(var i = 0; i < card.length; i++){
    var li = document.createElement('li');
    li.className = "surplus-card";
    li.onClick = function(i){
      cardClick++;

      if(cardClick < 2){
        this.innerHtml(card[i]);
      }else{
        div.removeChlid(ul);
        return;
      }
    };
    ul.appendChlid(li);
  }

  div.append(ul);
}

function doppelganger(game, people, myJob){
  if(myJob == "도플갱어"){
    console.log('준비중 ㅎ');
  }
};

function wareWolf(game, myJob){
  if(myJob == "늑대인간"){
    if(game.ware == 1){
     surplusCard(jobDiv, game.card); 
    }else if(game.ware >= 2){
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
  if(myJob == "예언자"){
    
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

  }
};

function moveNight(game, people, myJob){
  cardClick = 0;

  for(var i = 0; i < game.wake; i++){
    switch(i){
      case 1:
        var isDoppel = game.type.indexOf("도플갱어");

        if(isDoppel != -1){
          doppelganger(game, people, myJob);
        }
        break;

      case 2:
        wareWolf(game, myJob);
        minion(game, myJob);
        mason(game, myJob);
        break;

      case 3:
        seer(game, myJob);
        break;

      case 4:
        robber(game, people, myJob);
        break;

      case 5:
        troubleMaker(people, myJob);
        break;

      case 6:
        drunk(game, myJob);
        break;

      case 7:
        insomeniac(myJob); 
        break;
    }
  }
};
