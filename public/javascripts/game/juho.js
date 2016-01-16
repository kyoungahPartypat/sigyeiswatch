function Child(){
  this.inven = document.getElementById("inventory");
  

  /*
   새게임 시작 함수

   name : 캐릭터 이름
   age : 캐릭터 나이
   power : 체력 
   knowledge : 지식
   sens : 감수성
   fat :비만도
   good : 이거 머라 설명해야되지; 걍 착한일 하면 쌓이는거
   cloth: 입고있는 옷
   room: 현재 방
  */
  this.newGame = function(){
    this.name = "juho";
    this.age = 1;
    this.power = 5;
    this.knowledge = 10; 
    this.sens = 5;
    this.fat = 3;
    this.good = 0;

    this.cloth = "normal";
    this.room = "normal";
  };

  this.continueGame = function(){

  }; 
  
  
  /*
    인벤토리 여는 함수 
    
    input: 무슨 용도로 인벤 여는지 가르쳐주는 파라미터
  */

  this.invenOpen = function(input){
    this.inven.stlye.display = "block";

    switch(input){
      case "eat":
        eat();
        break;
      case "study":
        study();
        break;
      case "play":
        play();
        break;
      default:
        break;
    }  
  };

  this.invenClose = function(){
    this.inven.style.display = "none";
  }

  this.eat = function(){
   
  }  
}
