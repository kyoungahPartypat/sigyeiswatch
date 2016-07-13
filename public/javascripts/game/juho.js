/*
  주호 생성자 함수

    age: 나이
    size: 신체 사이즈 
      width: 몸무게
      height: 키
    stat: 스텟
      goodness: 착한마음
      strength: 체력
      dexterity: 손재주
      knowledge: 지식
*/

var Juho = function(){
  var age = 10;
  var size = {"width": 50, "height":150};
  var stat = {"goodness": 10, "strength":10, "dexterity": 10, "knowledge": 10}
  var money = 10000;  

  var Func = function(){};

  Func.prototype = {
    getSize: function(type){
      switch(type){
        case 'width':
          return size.width;
        case 'height':
          return size.height;
        default:
          break;
      }
    },

    getStat: function(type){
      switch(type){
        case 'goodness':
          return stat.goodness;
        case 'strength':
          return stat.strength;
        case 'dexterity':
          return stat.dexterity;
        case 'knowledge':
          return stat.knowledge;
        default:
          break;
      }
    },

    setSize: function(type, num){
      switch(type){
        case 'width':
          size.width += num;
          break;
        case 'height':
          size.height += num;
          break;
        default:
          break;
        
      }
    },

    setStat: function(type, num){
      switch(type){
        case 'goodness':
          stat.goodness += num;
          break;
        case 'strength':
          stat.strength += num;
        case 'dexterity':
          stat.dexterity += num;
        case 'knowledge':
          stat.knowledge += num;
        default:
          break;
      }
    },

    getMoney: function(){
      return money;
    },

    setMoney: functin(num){
      money += num;
    }
  };

}();

/*
  방 생성자 함수

    1: 기본 아이템
    0: 소지하고 있는 아이템이 없음
    --> 숫자가 높아질 수록 좋은 아이템

    wall: 벽지
    ground: 바닥
    bed: 침대
    tv: 티비
    desk: 책상
    etc: 기타
*/

var JuhoRoom = function(){
  var wall = "normal";
  var ground = "normal";
  var bed = "normal";
  var tv = null;
  var desk = "normal";
  var etc = null;

  var Func = function(){};

  Func.prototype = {
    getRoom: function(type){
      switch(type){
        case "wall":
          return wall;
        case "ground":
          return ground;
        case "bed":
          return bed;
        case "tv":
          return tv;
        case "desk":
          return desk;
        case "etc":
          return etc;
        default:
          break;
      }
    }

    setRoom: function(type, name){
      switch(type){
        case "wall":
          wall = name;
        case "ground":
          ground = name;
        case "bed":
          bed = name;
        case "tv":
          tv = name;
        case "desk":
          desk = name;
        case "etc":
          etc = name;
        default:
          break;
      }
    }

  };
}();


/*
  가게 생성함수
*/
var store = function(text){
  var name = text; 
};
