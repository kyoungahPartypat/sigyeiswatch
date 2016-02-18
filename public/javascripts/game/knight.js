var map, mapTwo, mapThree, mapFour;
var count, x, y, bx, by;

var move = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
var beforeY;

map = [['n','b','w'],
       ['b','w','b'],
       ['w','b','w'],
       ['b','w','b']];

mapTwo = [['n','b','w','b','w'],
       ['b','w','b','w','b'],
       ['w','b','w','b','w'],
       ['b','w','b','w','b'],
       ['w','b','w','b','w'],
       ['b','w','b','w','b']];

mapThree = [['n','b','w','b','w','b','w'],
       ['b','w','b','w','b','w','b'],
       ['w','b','w','b','w','b','w'],
       ['b','w','b','w','b','w','b'],
       ['w','b','w','b','w','b','w'],
       ['b','w','b','w','b','w','b']];

mapFour = [['n','b','w','b','w','b','w','b'],
       ['b','w','b','w','b','w','b','w'],
       ['w','b','w','b','w','b','w','b'],
       ['b','w','b','w','b','w','b','w'],
       ['w','b','w','b','w','b','w','b'],
       ['b','w','b','w','b','w','b','w'],
       ['w','b','w','b','w','b','w','b']];

function knight(){	

	this.mapSet = function(level, position){ 
		count = 0;
		x = 0;
		y = 0;
		bx = x;
		by = y;
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

		for(var i = 0; i<this.map.length; i++){
			var newTr = document.createElement('tr');
			newTbody.appendChild(newTr);
			for(var j=0; j<this.map[i].length; j++){
				var newTd = document.createElement('td');
				count++;
				switch(this.map[i][j]){
					case 'n' :
					newTd.className = 'knight';
					newTr.appendChild(newTd);
					break;

					case "w" : 
					newTd.className = 'white_pane';
					newTr.appendChild(newTd);
					break;

					case "b" :
					newTd.className = 'black_pane';
					newTr.appendChild(newTd);
					break
					
					default:
					break;
				}
			}
		}

		this.moveKnight();
	}

	this.mapInit = function(){
		this.position.removeChild(this.table);
		var deleteClear = document.getElementById("clear");
		if(deleteClear != undefined){
			this.position.removeChild(deleteClear);
		}
		x = 0;
		y = 0;
		bx = x;
		by = y;
	}
	
	this.moveKnight = function(){
		for(var n=0; n<move.length; n++){
			if(x+move[n][0] >= 0 && x+move[n][0] <this.map.length && y+move[n][1] >= 0 && y+move[n][1] <this.map[0].length && this.map[x+move[n][0]][y+move[n][1]] != "i"){
				this.map[x+move[n][0]][y+move[n][1]] = "y";
				this.table.rows[x+move[n][0]].cells[y+move[n][1]].className = "put_knight";
			}
		}
		beforeY = document.getElementsByClassName("put_knight");
		
	}

	this.clickEvent = function(element){
		x = element.parentNode.rowIndex;
		y = element.cellIndex;
		if(this.map[x][y] == "y"){
			this.beforeMove();
			this.map[x][y] = "n";
			this.map[bx][by] = "i";
			this.table.rows[x].cells[y].className = "knight";
			this.table.rows[bx].cells[by].className = "empty_pane";
	
			this.moveKnight();
			this.levelClear();
				
			bx = x;
			by = y;
		}
	}
	
	this.beforeMove = function(){
		beforeY = [].slice.call(beforeY, 0);
		for(var k = 0; k<beforeY.length; ++k){
			if(beforeY[k].parentNode.rowIndex % 2 != 0){
				if(beforeY[k].cellIndex % 2 != 0){
					this.map[beforeY[k].parentNode.rowIndex][beforeY[k].cellIndex] = "w";
					this.table.rows[beforeY[k].parentNode.rowIndex].cells[beforeY[k].cellIndex].className = "white_pane";
				}else{
					this.map[beforeY[k].parentNode.rowIndex][beforeY[k].cellIndex] = "b";
					this.table.rows[beforeY[k].parentNode.rowIndex].cells[beforeY[k].cellIndex].className = "black_pane";
				}
			}else{
				if(beforeY[k].cellIndex % 2 != 0){
					this.map[beforeY[k].parentNode.rowIndex][beforeY[k].cellIndex] = "b";
					this.table.rows[beforeY[k].parentNode.rowIndex].cells[beforeY[k].cellIndex].className = "black_pane";
				}else{
					this.map[beforeY[k].parentNode.rowIndex][beforeY[k].cellIndex] = "w";
					this.table.rows[beforeY[k].parentNode.rowIndex].cells[beforeY[k].cellIndex].className = "white_pane";
				}
			}
			console.log(k);
		}
	}
	this.levelClear = function(){
		count--;
		if(count == 1){
			var clear = document.createElement("span");
			clear.innerHTML = "Clear!";
			clear.setAttribute("id",  "clear");
			this.position.appendChild(clear);
		}
	}
}
