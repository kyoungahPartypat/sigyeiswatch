var ballClick = false;
var map, mapTwo, mapThree, mapFour, mapFive, mapSix;
var address = new Array();
var ballCount, x, y, bx, by;

map = [['m','m','y','y','y','m','m'],
       ['m','m','y','o','y','m','m'],
       ['y','y','o','o','o','y','y'],
       ['y','y','y','o','y','y','y'],
       ['y','y','y','o','y','y','y'],
       ['m','m','y','y','y','m','m'],
       ['m','m','y','y','y','m','m']];

mapTwo = [['m','m','y','y','y','m','m'],
       ['m','m','y','o','y','m','m'],
       ['y','y','y','o','y','y','y'],
       ['y','o','o','o','o','o','y'],
       ['y','y','y','o','y','y','y'],
       ['m','m','y','o','y','m','m'],
       ['m','m','y','y','y','m','m']];

mapThree = [['m','m','y','y','y','m','m'],
       ['m','m','y','y','y','m','m'],
       ['y','y','y','y','y','y','y'],
       ['y','y','o','y','o','y','y'],
       ['y','y','o','o','o','y','y'],
       ['m','m','o','o','o','m','m'],
       ['m','m','o','o','o','m','m']];

mapFour = [['m','m','y','y','y','m','m'],
       ['m','m','y','o','y','m','m'],
       ['y','y','o','o','o','y','y'],
       ['y','o','o','o','o','o','y'],
       ['o','o','o','o','o','o','o'],
       ['m','m','y','y','y','m','m'],
       ['m','m','y','y','y','m','m']];


mapFive = [['m','m','y','o','y','m','m'],
       ['m','m','o','o','o','m','m'],
       ['y','o','o','o','o','o','y'],
       ['o','o','o','y','o','o','o'],
       ['y','o','o','o','o','o','y'],
       ['m','m','o','o','o','m','m'],
       ['m','m','y','o','y','m','m']];

mapSix = [['m','m','o','o','o','m','m'],
       ['m','m','o','o','o','m','m'],
       ['o','o','o','o','o','o','o'],
       ['o','o','o','y','o','o','o'],
       ['o','o','o','o','o','o','o'],
       ['m','m','o','o','o','m','m'],
       ['m','m','o','o','o','m','m']];

function PegSolitare(){	

	this.mapSet = function(level, position){ 
		ballCount = 0;
		this.position = position;

		var copyMap = level.map(function(arr) {
			return arr.slice();
		});
		
		this.map = copyMap;

		var newMap = document.createElement('table');
		var newTbody = document.createElement('tbody');
			
		this.position.appendChild(newMap);
		newMap.appendChild(newTbody);
		this.table = newMap;

		for(var i = 0; i<7; i++){
			var newTr = document.createElement('tr');
			newTbody.appendChild(newTr);
			for(var j=0; j<7; j++){
				var newTd = document.createElement('td');
		
				switch(this.map[i][j]){
					case 'y' :
					newTd.className = 'pane';
					newTr.appendChild(newTd);
					break;

					case "o" : 
					newTd.className = 'ball_pane';
					newTr.appendChild(newTd);
					ballCount++;
					break;

					case "m" :
					newTd.className = 'empty_pane';
					newTr.appendChild(newTd);
					break
					
					default:
					break;
				}
			}
		}
	}

	this.mapInit = function(){
		this.position.removeChild(this.table);
		var deleteClear = document.getElementById("clear");
		if(deleteClear != undefined){
			this.position.removeChild(deleteClear);
		}
		ballClick = false;
	}

	this.ballEvent = function(element){
		x = element.parentNode.rowIndex;
		y = element.cellIndex;

		if(this.map[x][y] == "t" && ballClick == true){
			this.map[bx][by] = "y";
			if(x < bx && y == by){
				this.map[x+1][y] = "y";
				this.table.rows[x+1].cells[y].className = "pane";
				this.levelClear();
			}else if(x > bx && y == by){
				this.map[x-1][y] = "y";
				this.table.rows[x-1].cells[y].className = "pane";
				this.levelClear();
			}else if(x == bx && y < by){
				this.map[x][y+1] = "y";
				this.table.rows[x].cells[y+1].className =  "pane";
				this.levelClear();
			}else if(x == bx && y > by){
				this.map[x][y-1] = "y";
				this.table.rows[x].cells[y-1].className = "pane";
				this.levelClear();
			}else if(x == bx && y ==by){
				this.map[bx][by] = "o";
			}
	
			for(var k = 0; k < address.length; k++){
				switch(address[k]){
					case "left" :
						this.map[bx][by-2] = "y";
						break;
					case "right" :
						this.map[bx][by+2] = "y";
						break;
					case "top" :
						this.map[bx-2][by] = "y";
						break;
					case "bottom" :
						this.map[bx+2][by] = "y"; 
						break;	
					default :
						break;
				}
			}	
			
			address = [];
			this.map[x][y] = "o";
			this.table.rows[bx].cells[by].className = "pane";
			element.className = "ball_pane";
			ballClick = false;
			
		}else if(element.className == "ball_pane" && ballClick == false){
			
			if(y-2>=0 && this.map[x][y-1] == "o" && this.map[x][y-2] == "y"){
				this.map[x][y-2] = "t";
				address.push("left");
			}
			if(y+2<7 && this.map[x][y+1] == "o" && this.map[x][y+2] == "y"){
				this.map[x][y+2] = "t";
				address.push("right");
			}
			if(x-2>=0 && this.map[x-1][y] == "o" && this.map[x-2][y] == "y"){
				this.map[x-2][y] = "t";
				address.push("top");
			}
			if(x+2<7 && this.map[x+1][y] == "o" && this.map[x+2][y] == "y"){
				this.map[x+2][y] = "t";
				address.push("bottom");
			}
			
			this.map[x][y] = "t";
			bx = x;
			by = y;
			ballClick = true;
			element.className = "put_pane";
			console.log(address);
		}

	}
	
	this.levelClear = function(){
		ballCount--;
		if(ballCount == 1){
			var clear = document.createElement("span");
			clear.innerHTML = "Clear!";
			clear.setAttribute("id",  "clear");
			this.position.appendChild(clear);
		}
	}
}
