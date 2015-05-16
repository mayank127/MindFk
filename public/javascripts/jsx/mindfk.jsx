/** @jsx React.DOM */


var cx = React.addons.classSet;

var NewGameBox = React.createClass({
    mixins: [React.addons.LinkedStateMixin],

    nops: [4,6,8,12],

    getInitialState: function() {
        return {
            username: '',
            nop: 6,
        };
    },

    handleSubmit: function(e) {
        e.preventDefault();
        socket.emit('new-game', {
            username: this.state.username,
            nop: this.state.nop,
            token: this.props.token,
        });
    },

    handleClick: function(nop) {
        var oldstate = this.state;
        oldstate.nop = nop;
        this.setState(oldstate);
    },

    render: function(){
        var that = this;
        var classes = cx({
            'btn btn-default center-block': true,
            'disabled': (this.state.username == ''),
        });
        return (
            <div className="row">
                <div className="col-md-6 col-md-offset-3">
                    <div className="panel panel-info ">
                        <div className="panel-heading">
                            <h3 className="panel-title"><i className="fa fa-edit"></i> Create a new game
                            <a title="Help" className="pull-right" data-toggle="modal" data-target="#myModal" href='#'> <i className="fa fa-question-circle"></i> </a> </h3>
                        </div>
                        <form id="newGameForm" onSubmit={this.handleSubmit}>
                            <div className="panel-body">
                                    <div className="form-group">
                                        <label >Choose your name</label>
                                        <input className="form-control" type="text" valueLink={this.linkState('username')} />
                                    </div>
                                    <div className="form-group">
                                        <label >Number of players</label>
                                        <div>
                                            {this.nops.map(function(nop){
                                                if(nop==that.state.nop){
                                                    return <div className="btn btn-default col-md-3 active" key={nop} onClick={that.handleClick.bind(that, nop)}>{nop}</div>
                                                }
                                                else{
                                                    return <div className="btn btn-default col-md-3" key={nop} onClick={that.handleClick.bind(that, nop)}>{nop}</div>
                                                }
                                            })}
                                        </div>
                                    </div>
                            </div>
                            <div className="panel-footer">
                                <button type="submit" className={classes}>Play</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
});

var JoinGameBox = React.createClass({
    mixins: [React.addons.LinkedStateMixin],

    getInitialState: function() {
        return {
            username: '',
        };
    },

    handleSubmit: function(e) {
        e.preventDefault();
        socket.emit('join-game', {
            username: this.state.username,
            token: this.props.token,
        });
    },

    componentDidMount: function(){
        React.findDOMNode(this.refs.username).focus();
    },

    render: function(){
        var that = this;
        var classes = cx({
            'btn btn-default center-block': true,
            'disabled': (this.state.username == ''),
        });
        return (
            <div className="row">
                <div className="col-md-6 col-md-offset-3">
                    <div className="panel panel-info ">
                        <div className="panel-heading">
                            <h3 className="panel-title"><i className="fa fa-edit"></i> Join the game
                            <a title="Help" className="pull-right" data-toggle="modal" data-target="#myModal" href='#'> <i className="fa fa-question-circle"></i> </a> </h3>
                        </div>
                        <form id="newGameForm" onSubmit={this.handleSubmit}>
                            <div className="panel-body">
                                <div className="form-group">
                                    <label >Choose your name</label>
                                    <input ref='username' className="form-control" type="text" valueLink={this.linkState('username')} />
                                </div>
                            </div>
                            <div className="panel-footer">
                                <button type="submit" className={classes}>Play</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
});

var TeamList = React.createClass({

    render: function(){
        var that = this;
        var players = this.props.data.map(function(player){
            if(player.team==that.props.team){
                if(that.props.ask.user && that.props.ask.team == player.team && player.cards > 0 && that.props.me.turn){
                    return <TeamPlayer data={player} me={that.props.me} asking={true} card={that.props.ask.card} token={that.props.token} waitCallback={that.props.waitCallback}/>;
                }
                return <TeamPlayer data={player} me={that.props.me}  asking={false} />;
            }
        });
        return (<div className="row"> {players} </div>);
    }
});

var TeamPlayer = React.createClass({

    handleClick: function(){
        if(this.props.asking){
            socket.emit('new-move', {
                card: this.props.card,
                player: this.props.data.name,
                token: this.props.token
            });
            this.props.waitCallback();
        }
    },

    render: function(){

        var me = null;
        if((this.props.me.name == this.props.data.name)){
            me = <span> - (me) </span>;
        }
        if(this.props.data.turn){
            me = <span> - (turn) </span>;
        }

        var classes = cx({
            'img-circle': true,
            'user-self': (this.props.me.name == this.props.data.name),
        });
        var classes2 = cx({
            'btn card front btn-default': true,
            'user-self': (this.props.me.name == this.props.data.name),
            'disabled': (!this.props.asking),
            'user-turn': (this.props.data.turn),
        });

        var name = this.props.data.name;
        if(this.props.asking){
            name = "Ask " + this.props.data.name;
        }

        return (
            <div className={classes2} key={this.props.data.name} onClick={this.handleClick}>
                <div className="user col-md-6">
                    <img className={classes} src="/images/user_default.png"/>
                </div>
                <div className="content col-md-6">
                    <h3 className="name">{name}</h3>
                    <p className="profession">{this.props.data.cards} cards {me} </p>
                </div>
            </div>
        );
    }
});

var PlayerList = React.createClass({

    render: function(){
        var players = this.props.data.map(function(player){
            return <Player data={player} />
        });
        return (<div className="row"> {players} </div>);
    }
});

var Player = React.createClass({

    render: function(){
        var classes = cx({
            'user-item': true,
            'col-md-6': true,
            'user-creator': this.props.data.creator,
        });
        return (
            <div className={classes} key={this.props.data.name}>
                <div className="col-md-offset-4 col-md-4">
                    <img src="/images/user_default.png" className="img-circle"/>
                </div>
                <div className="col-md-4" />
                <div className="col-md-12 center name">
                    <h4>{this.props.data.name}</h4>
                </div>
            </div>
        );
    }
});

var CardDeck = React.createClass({
    count: 0,
    handleClick: function(e){
        e.preventDefault();
        this.props.askCardsCallback(this.props.half_suit);
    },

    componentDidMount: function(){
        if(this.refs.stack){
            var dom = this.refs.stack.getDOMNode();
            var baraja = $(dom).baraja();
            baraja.fan( {
                speed : 500,
                easing : 'ease-out',
                range : this.count*10,
                direction : 'right',
                origin : { x : 25, y : 100 },
                center : true
            } );
        }
    },

    render: function(){
        var that = this;
        var val = this.props.half_suit;
        var cards = this.props.deck.map(function(card){
            if(card.half_suit==val){
                that.count += 1;
                var cardname = card.value + card.suit;
                return (<li className="card-img" key={cardname}><img src={'/images/deck/' + cardname + '.png'} alt={cardname}/></li>);
            }

        });
        if(that.count>0){
            return (
                <ul className="baraja-container" ref="stack" onClick={that.handleClick}>
                    {cards}
                </ul>
            );
        }
        else{
            return <span/>
        }
    }
});

var GameCards = React.createClass({

    halfSuits: [0,1,2,3,4,5,6,7],
    halfSuitsName: ['LOW CLUBS', 'LOW DIAMONDS', 'LOW HEARTS', 'LOW SPADES', 'HIGH CLUBS', 'HIGH DIAMONDS', 'HIGH HEARTS', 'HIGH SPADES'],
    getInitialState: function(){
        return {
            ask: false,
            current: 0,
            selected: {},
            announce: false,
        }
    },

    askCards: function(val){
        if(this.props.data.turn && !this.props.wait){
            var oldstate = this.state;
            oldstate.ask = true;
            oldstate.current = val;
            this.setState(oldstate);
        }
    }, 

    showCards: function(){
        var oldstate = this.state;
        oldstate.ask = false;
        oldstate.announce = false;
        oldstate.current = 0;
        oldstate.selected = {};
        this.setState(oldstate);
        this.props.askUserCallback(false, null, null);
    },

    announceSet: function(){
        this.setState({announce: true});
    },

    doneAnnounceSet: function(){
        var cardHolder = [];
        for(var i=0;i<6;i++){
            cardHolder.push(React.findDOMNode(this.refs['card'+i]).value);
        }
        var data = {
            half_suit: this.state.current,
            cards: cardHolder,
            token: this.props.token,
            team: this.props.data.team,
        };

        socket.emit('new-announce', data);
        this.props.waitCallback();
    },

    handleClick: function(card){
        var oldstate = this.state;
        oldstate.selected = card;
        this.setState(oldstate);
        this.props.askUserCallback(true, card, (this.props.data.team+1)%2);
    },

    componentWillReceiveProps: function(nextProps){
        if(nextProps.wait){
            this.setState({
                ask: false,
                announce: false,
            });
        }
    },


    render: function(){
        var that = this;
        if(!this.state.ask || this.props.wait){
            var deck = this.props.data.deck;
            var halfSuitsDiv = this.halfSuits.map(function(val){
                return (
                    <CardDeck key={val + '-' + deck.length} half_suit={val} deck={deck} askCardsCallback={that.askCards} />
                );
            });

            return (
                <div>
                    {halfSuitsDiv}
                </div>
            );
        }
        else{
            if(!this.state.announce){
                var deck = this.props.data.deck;
                var showDeck = complete_deck.map(function(card){
                    if(card.half_suit==that.state.current){
                        var cardname = card.value + card.suit;
                        var disabled = deck.filter(function(card_d){
                            return (card_d.suit==card.suit && card_d.value==card.value);
                        });
                        var classes = cx({
                            'card-img': true,
                            'col-md-3': true,
                            'btn': true,
                            'disabled': (disabled.length>0),
                            'active': (that.state.selected.suit==card.suit && that.state.selected.value==card.value),
                        });
                        return (<li className={classes} key={cardname} onClick={that.handleClick.bind(that, card)}><img src={'/images/deck/' + cardname + '.png'} alt={cardname}/></li>);
                    }
                });

                var selectedCard = null;
                if(that.state.selected.suit && that.state.selected.value){
                    selectedCard = <h5> {that.state.selected.value} of {that.state.selected.suit} </h5> 
                }
                return(
                    <div>
                        <div className="row">
                            <div className="btn btn-default col-md-3 transparent" onClick={that.showCards}> 
                                <i className="fa fa-arrow-left"> Back </i>
                            </div>
                            <div className="col-md-6 center">
                                {selectedCard}
                            </div>
                            <div className="btn btn-default col-md-3 transparent" onClick={that.announceSet}> 
                                Announce <i className="fa fa-arrow-right"></i>
                            </div>
                        </div>
                        <ul className="card-show row">
                            {showDeck}
                        </ul>
                    </div>
                );
            }

            else{
                var deck = this.props.data.deck;
                var selectOptions = that.props.players.map(function(player){
                    if(player.name != that.props.data.name && player.team == that.props.data.team){
                        return (<option value={player.name} key={player.name}> {player.name} </option>);
                    }
                });
                var count = 0;
                var showDeck = complete_deck.map(function(card){
                    if(card.half_suit==that.state.current){
                        var cardname = card.value + card.suit;
                        var disabled = deck.filter(function(card_d){
                            return (card_d.suit==card.suit && card_d.value==card.value);
                        });
                        var classes = cx({
                            'card-img': true,
                            'col-md-3': true,
                            'btn': true,
                            'disabled': (disabled.length>0),
                            'active': (that.state.selected.suit==card.suit && that.state.selected.value==card.value),
                        });

                        var showSelect = null;
                        if(disabled.length<=0){
                            showSelect = <div className="form-group"> <select className="form-control" ref={"card" + count} > {selectOptions} </select> </div>;
                        }
                        else{
                            showSelect = <div className="form-group"> <select className="form-control" ref={"card" + count}> <option value={that.props.data.name} key={that.props.data.name}> {that.props.data.name} </option> </select> </div>;
                        }
                        count += 1;
                        return (
                            <li className={classes} key={cardname}>
                                <img src={'/images/deck/' + cardname + '.png'} alt={cardname}/>
                                {showSelect}
                            </li>
                        );
                    }
                });

                var selectedSet = <h5> {that.halfSuitsName[that.state.current]} </h5>;
                
                return(
                    <div>
                        <div className="row">
                            <div className="btn btn-default col-md-3 transparent" onClick={that.showCards}> 
                                <i className="fa fa-arrow-left"> Back </i>
                            </div>
                            <div className="col-md-6 center">
                                {selectedCard}
                            </div>
                            <div className="btn btn-default col-md-3 transparent" onClick={that.doneAnnounceSet}> 
                                Done <i className="fa fa-arrow-right"></i>
                            </div>
                        </div>
                        <ul className="card-show row">
                            {showDeck}
                        </ul>
                    </div>
                );
            }
        }
    }
});

var LastMove = React.createClass({
    halfSuitsName: ['LOW CLUBS', 'LOW DIAMONDS', 'LOW HEARTS', 'LOW SPADES', 'HIGH CLUBS', 'HIGH DIAMONDS', 'HIGH HEARTS', 'HIGH SPADES'],

    render: function(){
        if(this.props.data && this.props.data.type==0){
            var classes =  cx({
                'highlight': true,
                'bg-success': this.props.data.success,
                'bg-danger': !(this.props.data.success), 
            });
            return (
                <div className={classes}>
                    <h4 className="center"> Last: <strong className="name"> {this.props.data.from} </strong> asked {this.props.data.card.value} of {this.props.data.card.suit} from <strong className="name"> {this.props.data.to} </strong>. </h4>
                </div>
            );
        }
        else if(this.props.data && this.props.data.type==1){
            var classes =  cx({
                'highlight': true,
                'bg-success': (this.props.data.success==1),
                'bg-danger': (this.props.data.success==-1),
                'bg-warning': (this.props.data.success==0), 
            });

            return (
                <div className={classes}>
                    <h4 className="center"> Last: <strong className="name"> Team {this.props.data.team + 1} </strong> announced {this.halfSuitsName[this.props.data.half_suit]} </h4>
                </div>
            );
        }
        else{
            return <div/>;
        }
    }
});

var GamePlay = React.createClass({

    getInitialState: function(){
        return {
            askUser: false,
            card: {},
            team: null,
        }
    },

    askUser: function(set, card, team){
        var oldstate = this.state;
        oldstate.askUser = set;
        oldstate.team = team;
        oldstate.card = card;
        this.setState(oldstate);
    },

    wait: function(){
        var oldstate = this.state;
        oldstate.askUser = false;
        oldstate.team = {};
        oldstate.card = null;
        this.setState(oldstate);
        this.props.waitCallback(true);
    },



    render: function(){
        var askData = {
            user: this.state.askUser, 
            card: this.state.card, 
            team: this.state.team
        }
        return (
            <div className="row bg-green">
                <div className="col-md-3 bg-blue">
                    <div className="row">
                        <h2 className="text-center"> Team 1 - <span className="label label-default">{this.props.score[0]}</span> </h2>
                    </div>
                    <TeamList team={0} data={this.props.players} me={this.props.me} ask={askData} token={this.props.token}  waitCallback={this.wait}/>
                </div>
                <div className="col-md-6">
                    <LastMove data={this.props.lastMove} />
                    <GameCards data={this.props.me} players={this.props.players} askUserCallback={this.askUser} wait={this.props.wait} token={this.props.token} waitCallback={this.wait}/>
                </div>
                <div className="col-md-3 bg-red">
                    <div className="row">
                        <h2 className="text-center"> Team 2 - <span className="label label-default">{this.props.score[1]}</span></h2>
                    </div>
                    <TeamList team={1} data={this.props.players} me={this.props.me} ask={askData} token={this.props.token} waitCallback={this.wait}/>
                </div>
            </div>
        );
    }
});

var GameBody = React.createClass({
    
    getInitialState: function() {
        return {
            newGame: this.props.newGame,
            joinGame: this.props.joinGame,
            waitGame: false,
            startGame: false,
            token: this.props.token,
            nop: 0,
            players: [],
            turnWaiting: false,
            lastMove: {},
            score: [0,0],
        };
    },

    componentDidMount: function () {
        var that = this;
        socket.on('wait', function(data){
            var oldstate = that.state;
            oldstate.players = data.players;
            oldstate.newGame = false;
            oldstate.joinGame = false;
            oldstate.waitGame = true;
            oldstate.nop = data.nop;
            that.setState(oldstate);
        });
        socket.on('error-join', function(){
            window.location.assign("/");
        });
        socket.on('start-game', function(data){
            var oldstate = that.state;
            oldstate.players = data.players;
            oldstate.me = data.player;
            oldstate.newGame = false;
            oldstate.joinGame = false;
            oldstate.waitGame = false;
            oldstate.startGame = true;
            oldstate.turnWaiting = false;
            oldstate.lastMove = data.lastMove;
            oldstate.score = data.score;
            that.setState(oldstate);
        });
    },

    turnWaitingSet: function(val){
        var oldstate = this.state;
        oldstate.turnWaiting = val;
        this.setState(oldstate);
    },

    render: function(){
        if(this.state.newGame){
            return <NewGameBox token={this.state.token} />
        }
        else if(this.state.joinGame){
            return <JoinGameBox token={this.state.token} />
        }
        else if(this.state.waitGame){
            var players = <PlayerList data={this.state.players} />
            var ready = null;
            if(this.state.players.length == this.state.nop){
                ready = <span>Almost ready</span>;
            }
            else{
                ready = <span>{this.state.players.length} / {this.state.nop} Players joined...</span>;
            }
            return (
                <div>
                    <h4> 
                        To invite a friend, give the following URL: <br/> <div className="center"><em className="text-info"> {window.location.origin}/game/{this.state.token} </em></div>
                        <hr/>
                        <i className="fa fa-spinner fa-spin"/> {ready}
                        <br/> 
                    </h4>
                    {players}
                </div>
            );
        }
        else if(this.state.startGame){
            return (<GamePlay token={this.state.token} me={this.state.me} players={this.state.players} score={this.state.score} wait={this.state.turnWaiting} waitCallback={this.turnWaitingSet} lastMove={this.state.lastMove} />);
        }
        return (<div>Hello World!!</div>);
    }
});