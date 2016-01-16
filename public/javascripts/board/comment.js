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
  console.log(param);
  return vars;
};

var Comment = React.createClass({
  rawMarkup: function(){
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return {__html: rawMarkup};
  },

  render: function(){
    return (
      <li className = "comment">
        <span className = "comment-name">{this.props.name}</span>
        <span className = "comment-date">{this.props.date}</span>
        <div dangerouslySetInnerHTML = {this.rawMarkup()} />
      </li>
    );
  }
});

//render 안의 div 태그들은 실제 Dom노드가 아닌 div 컴포넌트의 인스턴스
//직접 만든(또는 다른사람들이 만든) 컴포넌트의 트리들도 리턴 가능
var CommentList = React.createClass({
  render: function(){
    var commentNodes = this.props.data.map(function (comment){
      return (
        <Comment name = {comment.name} date = {comment.date} key = {comment._id}>
          {comment.comment}
        </Comment>
      );
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
  loadCommentsFromServer: function(){
    $.ajax({
      url: this.props.url + "/" + returnId("id"),
      dataType: 'json',
      cache: false,
      success: function(data){
        this.setState({data: data.comment});
      }.bind(this),
      error: function(xhr, status, err){
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment){
    var comments = this.state.data;
    //var newComments = comments.concat([comment]);
    //this.setState({data: newComments});
    console.log(comment);
    $.ajax({
      url: this.props.url + "/" + returnId("id"),
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data){
        this.setState({data: data});
      }.bind(this),
      error:function(xhr, status, err){
        this.setState({data: comments});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function(){
    return {data: []}; 
  },
  componentDidMount: function(){
    this.loadCommentsFromServer();
  },
  render: function(){
 
    return(
      <div className = "commentBox">
        <CommentList data = {this.state.data} />
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
