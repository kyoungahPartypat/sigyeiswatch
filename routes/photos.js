var express = require('express');
var router = express.Router();

var Photo = require('../models/Photo');
var path = require('path');
var fs = require('fs');
var multer = require('multer');
var upload = multer({dest: 'uploads/'});
var join = path.join;


var list = function(req, res, next, find, fn){
  var perpage = 25;
  var page = parseInt(req.param('page')) || 1;
  var list = 10;
  var block = Math.ceil(page/list);
  var start = ((block-1) * list) +1;
  var end = start + list - 1;

  Photo.count(function(err, total){
    req.page = res.locals.page = {
      number:page,
      perpage: perpage,
      from: (page-1)*perpage,
      to: (page-1) * perpage + perpage -1,
      total: total,
      list: list,
      block: block,
      count: Math.ceil(total/perpage),
      start: start,
      end: end
    }; 

    if(req.page.end > req.page.count){
      req.page.end = req.page.count;
    }

    Photo.find(find).sort({_id:'desc'}).exec(function(err, rows){
      if(err) throw err;

      fn(null, rows);
    }); 
  });
};

function ensureAuthenticated(req, res, next) {
    // 로그인이 되어 있으면, 다음 파이프라인으로 진행
    if (req.isAuthenticated()) { return next(); }
    // 로그인이 안되어 있으면, login 페이지로 진행
    res.redirect('/users/login');
}

//

router.get('/', function(req, res, next) {
  list(req, res, next, {}, function(err, rows){
    if(err) return err;
    res.render('photos', {title:"갤러리", photos:rows});
  });  
});

router.post('/', function(req, res, next){
  var tag = encodeURIComponent(req.body.tag);
  res.redirect('/photos/search/?tag=' + tag);
});


router.post('/search', function(req, res, next){
  var tag = encodeURIComponent(req.body.tag);
  res.redirect('/photos/search/?tag=' + tag);
});

router.get('/search', function(req, res, next){
  var tag = req.query.tag;
  console.log(tag);
  list(req, res, next, {'tag': new RegExp(tag, 'i')}, function(err, rows){
    if(err) return err;
    res.render('photos', {title:"갤러리", photos:rows});
  });
});

router.get('/upload', ensureAuthenticated, function(req, res, next){
  res.render('photos/upload', {title:"갤러리 - 업로드"});
});

router.post('/upload', upload.single('image'), function(req, res, next){
  var date = new Date();
  var img = req.file;
  var name = req.body.name;
  var tag = req.body.tag;
  var newName = date.getTime() + "_" +  img.originalname;
  var path = join("public/photos/", newName);
  var user = req.user.name;
  var non = req.body.non || "n";
  var second = req.body.ndsa || "n";
 
  fs.rename(img.path, path, function(err){
    if(err) throw err;

    Photo.create({ name:name, path:newName, user:user,  noncommercial:non, secondCreation:second, tag:tag }, function(err){
      if(err) throw next(err);
     
      res.redirect('/photos');
    });
  });
});

router.get('/detail', function(req, res, next){
  var id = req.query.id;
  var page = req.query.page;

  Photo.findById(id, function(err, photo){
    if(err) return err;

    res.render("photos/detail", {title:"갤러리 - 이미지 보기", id:id, photo:photo, page:page});
  });
});

router.get('/detail/:id/download', function(req, res, next){;
  var id = req.params.id;
 
  Photo.findById(id, function(err, photo){
    if(err) return err;

    var path = "public/photos/" + photo.path;
    res.download(path, photo.path);
  });
});

module.exports = router;

//



/*
exports.list = function(req, res){
  Photo.find({}, function(err, photos){
      if(err) return next(err);

      res.render('photos', {
        photos: photos
      });
  });
}

exports.form = function(req, res){
  res.render('photos/upload');
}

exports.submit = function(dir){
  return function(req, res, next){
    var img = req.files.image;
    var date = new Date();
    var newPath = date.getTime() + img.name;
    var name = req.body.name || img.name;
    var path = join('public' + dir[0].path, newPath);

    fs.rename(img.path, path, function(err){
      if(err) return next(err);
      Photo.create({
        name: name,
        path: newPath
        }, function(err){
            if(err) return next(err);
            res.redirect('/photos');
      });
    });
  }
}

exports.download = function(dir){
  return function(req, res, next){
    var id = req.params.id;

    Photo.findById(id, function(err, photo){
      if(err) return err;
      var path = join("public/" + dir[0].path, photo.path); 

      fs.exists(path, function(exists){console.log(exists? "00": "ㄴㄴ");})
     res.sendfile(path);
    });
  }
}
*/
