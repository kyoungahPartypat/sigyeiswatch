var Board = React.createClass({
  rawMarkup: function(){
    var rawMarkup = marked(this.props.children.toString(), {sanitize:true});
    return {__html:rawMarkup};
  },

  render: function(){
    return (
      <td><a href={this.props.link}><span dangerouslySetInnerHTML={this.rawMarkup()} /></a></td>
    );
  }
});

var NoBoard = React.createClass({
  render: function(){
    return ( 
      <td>등록된 글이 없습니다.</td>
    );
  }
});

var BoardList = React.createClass({
  render: function(){
     var boardT = this.props.boardT;

    if(this.props.data.length > 0){
      var boardNodes = this.props.data.map(function(board){
        var link = "/free/detail?id=" + board._id;
        return (
          <tr key = {board._id}>
            <Board link = {link}>
              {board.title}
            </Board>
          </tr>
        );
      });
    }else{
      var boardNodes = [];

      boardNodes.push(
        <tr key = "no-empty">
          <NoBoard key={this.props.data} />
        </tr>
      );
      
    }

    return (
      <div key = "board-box">
          <table className = "table table-hover">
            <thead>
              <tr>
                <th width = "100%">{this.props.boardT}</th>
              </tr>
            </thead>
            <tbody>
              {boardNodes}
            </tbody>
          </table>
      </div>
    );
  }
});

var BoardBox = React.createClass({
  loadBoardFromServer: function(){
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data){     
       if(data.rows.length > 0){
         this.setState({data: data.rows});
       }else{
         this.setState({data: []});
       }
      }.bind(this),
      error: function(xhr, status, err){
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function(){;
    return {data:[]};
  },
  componentDidMount: function(){
    this.loadBoardFromServer();
  },
  render: function(){
    console.log(this.props.boardT);
    return (
      <div className="board">
        <div>
          <BoardList boardT = {this.props.boardT} data = {this.state.data} />
        </div>
      </div>
    );
  }
});

ReactDOM.render(
  <div>
    <BoardBox boardT = "인기글" url = "/main_best"/>
    <BoardBox boardT = "최신글" url = "/main_recent"/>
  </div>,
  document.getElementById('mainBoard')
);
