function plusLike(board, id, name){

  var like = {};
  like.id = id;
  like.name = name;
  $.ajax({
    url: "/" + board + "/like/" + id,
    dataType: 'json',
    type: 'POST',
    data: JSON.stringify(like),
    contentType: 'application/json',
    success: function(data){
      if(data.ok === "true"){
        readLike(board, like);
      }else{
        alert("이미 추천한 글입니다!");
      }
    },
    error: function(request, status, error){
      console.log("code." + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    }     
  });
}

function readLike(board, like){
  $.ajax({
    url: "/" + board + "/like/" + like.id,
    dataType: 'json',
    type: "GET",
    data: JSON.stringify(like),
    contentType: 'application/json',
    success: function(data){
      var goods = data.goods;
      $("#like > span").text(goods);
    },
    error: function(request, status, error){
      console.log("code." + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    }      
  });
};
