var Rank = React.createClass({
  render: function(){
    return (
      <li className = "ranker">
        <span className = "ranker-num">{this.props.num + "등"}</span>
        <span className = "ranker-name">{this.props.ranker}</span>
      </li>
    );   
  }
});

var RankList = React.createClass({
  render: function(){
    var arrs = [];
    var rankArr = this.props.data;

    for(var i = 0; i < rankArr.length; i++){
      arrs.push(
        <Rank key = {i + 1} num = {i + 1} ranker = {rankArr[i]} />
      );
    }

    return (
      <div>
        <span>{this.props.name}</span>
        <ul className = "rank-list">
          {arrs}
        </ul>
      </div>
    );
  }
});

var RankBox = React.createClass({
  loadRichFromServer: function(){
    $.ajax({
      url: "/game/girlfriend/richRank",
      dataType: 'json',
      cache: false,
      success: function(data){
        this.setState({rich: data.result});
      }.bind(this),
      error: function(xhr, status, err){
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  loadLevelFromServer: function(){
    $.ajax({
      url: "/game/girlfriend/levelRank",
      dataType: 'json',
      cache: false,
      success: function(data){
        this.setState({level: data.result});
      }.bind(this),
      error: function(xhr, status, err){
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  getInitialState: function(){
    return {rich: [], level: []}; 
  },
  componentDidMount: function(){
    this.loadRichFromServer();
    this.loadLevelFromServer();
  },
  render: function(){
    return(
      <div className = "rank-box">
        <RankList name = "부자 랭킹" data = {this.state.rich}/>
        <RankList name = "랭킹 이름 멀로해" data = {this.state.level}/>
      </div>
    );
  }
});

ReactDOM.render(
  <RankBox />,
  document.getElementById('rank')
);

