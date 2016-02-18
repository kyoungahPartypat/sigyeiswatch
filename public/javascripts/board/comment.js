/*react.js 튜토리얼 :Q*/

var returnId = function(param){
  var vars = {};
  window.location.href.replace(
    /[?&]+([^=&]+)=?([^&]*)?/gi,
    function(m, key, value){
      vars[key] = value !== undefined ? value : '';
    }
  );

  if(param){
    return vars[param] ? vars[param] : null;
  }
  
  return vars;
};

var Comment = React.createClass({
  rawMarkup: function(){
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return {__html: rawMarkup};
  },

  render: function(){
    if(this.props.seq === 0){
      return (
        <li className = "comment">
          <div className = "cmt">
            <div className = "cmtBtn">
              <button className = "comment-cRecommend" onClick = {this.onCRecommend}>추천</button>
              <button className = "comment-report" onClick = {this.onCReport}>신고</button>
            </div>
            <span className = "comment-name">{this.props.name}</span>
            <span className = "comment-date">{this.props.date}</span>
            <div dangerouslySetInnerHTML = {this.rawMarkup()} />
            <button className = "comment-submit" onClick = {this.onSubmitComment}>
              <i className = "glyphicon glyphicon-share-alt"></i>답글
            </button>
          </div>
        </li>
      );
    }else{
       return (
        <li className = "comment">
          <i className = "glyphicon glyphicon-share-alt"></i>
          <div className = "re-cmt">
            <div className = "cmtBtn">
              <button className = "comment-cRecommend" onClick = {this.onCRecommend}>추천</button>
              <button className = "comment-report" onClick = {this.onCReport}>신고</button>
            </div>
            <span className = "comment-name">{this.props.name}</span>
            <span className = "comment-date">{this.props.date}</span>
            <div dangerouslySetInnerHTML = {this.rawMarkup()} />
          </div>
        </li>
      );   
    };
  },
  onCRecommend: function(e){
    console.log('hi');
  },
  onCReport: function(e){
    console.log('bye');
  },
  onSubmitComment: function(e){
    var findCmt = document.getElementsByClassName('re-comment');
    var dom = ReactDOM.findDOMNode(this);
    var clickEvent = this.props.loadComments;
    var grp = this.props.grp;
    var cPage = this.props.cPage;
    var newCmt = document.createElement('form');
    var newTxt = document.createElement('textarea');
    var newBtn = document.createElement('button');
   
    for(var i = 0; i < findCmt.length; i++){
      findCmt[i].remove();     
    }

    
    newCmt.className = 're-comment';
    newTxt.className = 'form-control re-form';
    newBtn.className = 'btn btn-primary';
    newBtn.type = 'button';
    newBtn.onclick = function(){
      var postCmt = {};
      postCmt.comment = document.getElementsByClassName('re-form')[0].value;
      postCmt.grp = grp;
      var xhr = new XMLHttpRequest();
      
      xhr.open('POST', encodeURI('/free/reComment/' + returnId('id')), true);
      xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
      xhr.onload = function(){
        if(xhr.status === 200){
          clickEvent(cPage);
          newCmt.remove();
        }else{
           console.log(xhr.responseText);
          alert('죄송합니다. 댓글 작성 중 오류가 발생했습니다.');
        }
      };
      xhr.send(JSON.stringify(postCmt));
    };

    
    newBtn.appendChild(document.createTextNode('등록'));
    newCmt.appendChild(newTxt);
    newCmt.appendChild(newBtn);

    dom.appendChild(newCmt);
  }
});

//render 안의 div 태그들은 실제 Dom노드가 아닌 div 컴포넌트의 인스턴스
//직접 만든(또는 다른사람들이 만든) 컴포넌트의 트리들도 리턴 가능
var CommentList = React.createClass({
  render: function(){
    var rows = [];
    var comment = this.props.data;
    var cPage = this.props.page.number + 1;
    var clickEvent = this.props.loadComments;

    for(var i = this.props.page.from; i <= this.props.page.to; i++){
      rows.push(i);
    }

    var commentNodes = rows.map(function(num){
      if(comment[num]){
        return (
          <Comment name = {comment[num].name} date = {comment[num].date} grp = {comment[num].grp} seq = {comment[num].seq} key = {comment[num]._id} cPage = {cPage} loadComments = {clickEvent}>
            {comment[num].comment}
          </Comment>
        );
      }
    });
    return (
      <ul className = "commentList">
        {commentNodes}
      </ul>
    );
  }
});

var CommentForm = React.createClass({
  handleSubmit: function(e){
    e.preventDefault();
    var text = this.refs.text.value.trim();

    if (!text){
      return;
    }
    this.props.onCommentSubmit({text: text});
    this.refs.text.value = '';
    return;
  },
  render: function(){
    var user = document.getElementById("user");
    if (!user){
      return (
        <div className = "please-login form-control">댓글을 작성하려면 로그인 해주세요.</div>
      );
    }else{
      return (
        <form className = "commentForm" onSubmit={this.handleSubmit}>
          <span className = "user">{user.value}</span>
          <textarea className = "form-control" placeholder = "매너필수 :)" ref = "text"></textarea>
          <button type = "submit" className = "btn btn-primary">등록</button>  
        </form>
      );
    }
  }
});

//JSX컴파일러가 자동으로 HTML 태그들을 React.createElement(tagName) 표현식으로 재작성 하고 나머지는 그대로 둠 -> 전역 네임스페이스가 오염되는것을 막아줌
var CommentBox = React.createClass({
  loadCommentsFromServer: function(lastPage){
    $.ajax({
      url: this.props.url + "/?id=" + returnId("id") + "&cPage=" + lastPage,
      dataType: 'json',
      cache: false,
      success: function(data){
        this.setState({data: data.comment, page:data.page});
      }.bind(this),
      error: function(xhr, status, err){
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  handleCommentSubmit: function(comment){
    var comments = this.state.data;
    $.ajax({
      url: this.props.url + "/" + returnId("id"),
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data){
        this.loadCommentsFromServer(data.lastPage);
      }.bind(this),
      error:function(xhr, status, err){
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function(){
    return {data: [], page:{}}; 
  },
  componentDidMount: function(){
    this.loadCommentsFromServer(1);
  },
  pageMove: function(num){
    var cPage = num + 1;

    this.serverRequest = $.get('/free/comment/?id=' + returnId('id') + '&cPage=' + cPage, function(result){
      var data = result;
     
      this.setState({
        data:data.comment,
        page:data.page
      });
    }.bind(this));
  },
  render: function(){

    var arrs = []; 
   for(var i = 0; i < this.state.page.count; i++){
      arrs.push(
        <li key = {i + 1}><a className = "page" href = "javascript:;"  onClick = {this.pageMove.bind(this, i)}>{i + 1}</a></li>
      );
    }

    return(
      <div className = "commentBox">
        <CommentList data = {this.state.data} page = {this.state.page} loadComments = {this.loadCommentsFromServer}/>
        <ul className = "commentPage pagination">
          {arrs}
        </ul>
        <CommentForm onCommentSubmit = {this.handleCommentSubmit}/>
      </div>
    );
  }
});

//ReactDom.render()는 최상위 컴포넌트의 인스턴스를 만들고
//두번째 인수로 전달받은 DOM엘리먼트에 마크업을 삽입해 프레임워크를 시작한다

//ReactDom 모듈은 DOM 특정 메소드를 노출해, React가 코어 툴을 다른 플렛폼에 공유할 수 있게 해준다
ReactDOM.render(
  <CommentBox url = "/free/comment" />,
  document.getElementById('comment')
);
