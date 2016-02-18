var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://localhost/sigye');
var Schema = mongoose.Schema;

var table;
var perpage;

//댓글
var Comments = new Schema({
  name: 'String',
  comment: 'String',
  date: 'String',
  good: 'Number',
  bad: 'Number',
  grp: 'Number',
  seq: 'Number'
});

//추천
var Likes = new Schema({
  b_id: 'String',
  name: 'String'
});

var Task = new Schema({
  name: 'String',
  title: 'String',
  content: 'String',
  date: "String",
  hits: "Number",
  good: 'Number',
  bad: 'Number',
  comments: [Comments]
});

function today(){

  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();

  if(dd < 10){
    dd = '0' + dd;
  }

  if(mm < 10){
    mm = '0' + mm;
  }

  return yyyy + "-" + mm + "-" + dd;
};

exports.perpage = function(input){
  perpage = input;
};

exports.select = function(input){
  table = mongoose.model(input, Task);  
  like = mongoose.model("likes", Likes);
};

/* GET home page. */
exports.list = function(req, res, next, fn){
  perpage = perpage || 10; //페이지당 10이 기본값

  var page = Math.max(parseInt(req.param('page') || '1', 10), 1)-1;

  table.count(function(err, total){
      
    req.page = res.locals.page = {
      number: page,
      perpage: perpage,
      from: page * perpage,
      to: page * perpage + perpage -1,
      total: total,
      count: Math.ceil(total/perpage)
    };
   
  
    table.find({}).sort({_id: 'desc'}).exec(function(err, rows){
      if(err) throw err;
   
      fn(null, rows);
    });
  });
};

exports.write = function(name, title, content){
  var task = new table();

  task.name = name;
  task.title = title;
  task.content = content;
  task.date = today();
  task.hits = 0;
  task.good = 0;
  task.bad = 0;
  
  task.save(function(err){
    if(err) throw err;
  });
};

exports.count = function(fn){
  table.count();
}

exports.detail = function(id, page, fn){

  table.findById(id, function(err, row){
  
    if(err) return err;
    
    if(row !== null){
      table.update({_id:id}, {$set:{hits:row.hits + 1}}, function(err, r){
        fn(null, row);
      });
    }else{
      fn(null, "noResult");
    }
  });
};

exports.commentList = function(req, res, next ,fn){
  var perpage = 20;
  var cPage = Math.max(parseInt(req.param('cPage') || '1', 10), 1)-1;
  var id = req.param('id');
  
  table.findById(id, function(err, row){ 
    if(err) throw err;
   
    if(row !== null){ 
      req.cPage = res.locals.cPage = {
        number: cPage,
        perpage: perpage,
        from: cPage * perpage,
        to: cPage * perpage + perpage -1,
        total: row.comments.length,
        count: Math.ceil(row.comments.length/perpage) 
      };
      fn(null, row.comments.sort(function(a, b){
        var aGrp = a.grp;
        var bGrp = b.grp;
        var aSeq = a.seq;
        var bSeq = b.seq;

        if(aGrp == bGrp){
          return (aSeq < bSeq) ? -1 : (aSeq > bSeq) ? 1 : 0;
        }else{
          return (aGrp < bGrp) ? -1 : 1;
        }
      }));
    }else{
      fn(null, "noResult");
    }
  });
};

exports.readLike = function(id, fn){

   table.findById(id, function(err, row){
    if(err) throw err;

    fn(null, row.good);
  }); 
}

exports.like = function(id, name, fn){
  var data = "false";

  like.find().and([{b_id: id}, {name: name}]).exec(function(err, row){
    if(row.length == 0){
    
      table.findByIdAndUpdate({_id:id}, {$inc: {good: 1}}, function(err, r){
        data = "true";

        var good = new like;
        good.b_id = id;
        good.name = name;

        good.save(function(err){
          if(err) throw err;
      
          fn(null, data);
        });
      });
    }else{
      fn(null, data);
    }
  });
}

exports.comment = function(id, name, comment, fn){
  var id = id;
  var name = name;
  var comment = comment;
  var date = today();
  var good = 0;
  var bad = 0;
  var seq = 0;
 
  function isGrpZero(value){
    return value.seq === 0;
  }

  table.findById(id, function(err, row){
    if(err) throw err;
    
    var grp = row.comments.filter(isGrpZero).length;
    var data = {name:name, comment:comment, date:date, good:good, bad:bad, grp:grp, seq:seq}; 
    row.comments.push(data);
    var lastPage = Math.ceil(row.comments.length/20); //위에 페이징 perpage 바뀌면 여기 20도 고쳐야댐..
    row.save(function(err){ 
      if(err) throw err;

      fn(null, {data:data, lastPage:lastPage});
    });
  });
};


//cid 는 클라이언트에서 던져줌니다 
exports.childComment = function(id, cId, name, comment){
  var id = id;
  var name = name;
  var comment = comment;
  var date = today();
  var good  = 0;
  var bad = 0;
  var grp = cId;
  
  function isEqualGrp(value){
    return value.grp === grp;
  };

 
  table.findById(id, function(err, row){
    if(err) throw err;

    var num = row.comments.filter(isEqualGrp).length;
    row.comments.push({name:name, comment:comment, date:date, good:good, bad:bad, grp:grp, seq:num});
    row.save(function(err){
      if(err) throw err;
    });
  });
}
