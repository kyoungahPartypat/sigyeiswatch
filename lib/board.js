var path = require('path');
var fs = require('fs');
var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://localhost/sigye');
var Schema = mongoose.Schema;
var join = path.join;
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

  var page = parseInt(req.param('page')) || 1;
  var list = 10;
  var block = Math.ceil(page/list);
  var start =  ((block-1) * list) + 1;
  var end = start + list - 1;

  table.count(function(err, total){
      
    req.page = res.locals.page = {
      number: page, //현재 페이지
      perpage: perpage, //글 개수
      from: (page - 1) * perpage,
      to: (page -1) * perpage + perpage -1,
      total: total,
      list: list, //블럭에 나타낼 페이지 번호 갯수
      block: block, //현재 리스트의 블럭을 구함
      count: Math.ceil(total/perpage), //총 게시글의 페이지 수
      start: start, //현재 블럭에서 시작페이지 번호
      end: end //현재 블럭에서 마지막 페이지 번호
    };
    
    if(req.page.end > req.page.count){
      req.page.end = req.page.count;
    }
  
    table.find({}).sort({_id: 'desc'}).exec(function(err, rows){
      if(err) throw err;
   
      fn(null, rows);
    });
  });
};

exports.imgUpload = function(file, folder, fn){
  var date = new Date();
  var newFolder = today();
  var img = file;
  var newName = date.getTime() + "_" + img.originalname;

  function upload(img, newFolder){
    var path = join(folder + newFolder, newName);
 
    fs.rename(img.path, path, function(err){
      if(err) return err;

      fn(path);
    });
  }

 
  fs.readdir(folder, function(err, files){
    if(files.length === 0){
      var tgFolder = join(folder, newFolder);

      fs.mkdir(tgFolder, 0777, function(err){
        if(err) return err;

        upload(img, newFolder);    
      });
    }else{  
      files.forEach(function(file){
        if(file === newFolder){     
          upload(img, newFolder); 

        }else{
          var tgFolder = join(folder, newFolder);

          fs.mkdir(tgFolder, 0777, function(err){
            if(err) return err;

            upload(img, newFolder);
          });
        }
      });

    }
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
 
  var cPage = parseInt(req.param('cPage')) || 1;
  var id = req.param('id');
  var perpage = 20;
  var list = 10;
  var block = Math.ceil(cPage/list);
  var start =  ((block-1) * list) + 1;
  var end = start + list - 1;
  
  table.findById(id, function(err, row){ 
    if(err) throw err;
   
    if(row !== null){ 
      req.cPage = res.locals.cPage = {
        number: cPage,
        perpage: perpage,
        from: (cPage -1) * perpage,
        to: (cPage -1) * perpage + perpage -1,
        total: row.comments.length,
        list: list,
        block: block,
        count: Math.ceil(row.comments.length/perpage),
        start: start,
        end: end
      };
     
      if(req.cPage.end > req.cPage.count){
        req.cPage.end = req.cPage.count;
      }

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
