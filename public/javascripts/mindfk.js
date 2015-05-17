/** @jsx React.DOM */


var cx = React.addons.classSet;

var NewGameBox = React.createClass({displayName: "NewGameBox",
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
            React.createElement("div", {className: "row"}, 
                React.createElement("div", {className: "col-md-6 col-md-offset-3"}, 
                    React.createElement("div", {className: "panel panel-info "}, 
                        React.createElement("div", {className: "panel-heading"}, 
                            React.createElement("h3", {className: "panel-title"}, React.createElement("i", {className: "fa fa-edit"}), " Create a new game", 
                            React.createElement("a", {title: "Help", className: "pull-right", "data-toggle": "modal", "data-target": "#myModal", href: "#"}, " ", React.createElement("i", {className: "fa fa-question-circle"}), " "), " ")
                        ), 
                        React.createElement("form", {id: "newGameForm", onSubmit: this.handleSubmit}, 
                            React.createElement("div", {className: "panel-body"}, 
                                    React.createElement("div", {className: "form-group"}, 
                                        React.createElement("label", null, "Choose your name"), 
                                        React.createElement("input", {className: "form-control", type: "text", valueLink: this.linkState('username')})
                                    ), 
                                    React.createElement("div", {className: "form-group"}, 
                                        React.createElement("label", null, "Number of players"), 
                                        React.createElement("div", null, 
                                            this.nops.map(function(nop){
                                                if(nop==that.state.nop){
                                                    return React.createElement("div", {className: "btn btn-default col-md-3 col-xs-3 active", key: nop, onClick: that.handleClick.bind(that, nop)}, nop)
                                                }
                                                else{
                                                    return React.createElement("div", {className: "btn btn-default col-md-3 col-xs-3", key: nop, onClick: that.handleClick.bind(that, nop)}, nop)
                                                }
                                            })
                                        )
                                    )
                            ), 
                            React.createElement("div", {className: "panel-footer"}, 
                                React.createElement("button", {type: "submit", className: classes}, "Play")
                            )
                        )
                    )
                )
            )
        );
    }
});

var JoinGameBox = React.createClass({displayName: "JoinGameBox",
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
            React.createElement("div", {className: "row"}, 
                React.createElement("div", {className: "col-md-6 col-md-offset-3"}, 
                    React.createElement("div", {className: "panel panel-info "}, 
                        React.createElement("div", {className: "panel-heading"}, 
                            React.createElement("h3", {className: "panel-title"}, React.createElement("i", {className: "fa fa-edit"}), " Join the game", 
                            React.createElement("a", {title: "Help", className: "pull-right", "data-toggle": "modal", "data-target": "#myModal", href: "#"}, " ", React.createElement("i", {className: "fa fa-question-circle"}), " "), " ")
                        ), 
                        React.createElement("form", {id: "newGameForm", onSubmit: this.handleSubmit}, 
                            React.createElement("div", {className: "panel-body"}, 
                                React.createElement("div", {className: "form-group"}, 
                                    React.createElement("label", null, "Choose your name"), 
                                    React.createElement("input", {ref: "username", className: "form-control", type: "text", valueLink: this.linkState('username')})
                                )
                            ), 
                            React.createElement("div", {className: "panel-footer"}, 
                                React.createElement("button", {type: "submit", className: classes}, "Play")
                            )
                        )
                    )
                )
            )
        );
    }
});

var TeamList = React.createClass({displayName: "TeamList",

    render: function(){
        var that = this;
        var players = this.props.data.map(function(player){
            if(player.team==that.props.team){
                if(that.props.ask.user && that.props.ask.team == player.team && player.cards > 0 && that.props.me.turn){
                    return React.createElement(TeamPlayer, {data: player, me: that.props.me, asking: true, card: that.props.ask.card, token: that.props.token, waitCallback: that.props.waitCallback});
                }
                return React.createElement(TeamPlayer, {data: player, me: that.props.me, asking: false});
            }
        });
        return (React.createElement("div", {className: "row"}, " ", players, " "));
    }
});

var TeamPlayer = React.createClass({displayName: "TeamPlayer",

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
            me = React.createElement("span", null, " - (me) ");
        }
        if(this.props.data.turn){
            me = React.createElement("span", null, " - (turn) ");
        }

        var classes = cx({
            'img-circle': true,
            'user-self': (this.props.me.name == this.props.data.name),
        });
        var classes2 = cx({
            'btn card front btn-default col-md-12 col-xs-6': true,
            'user-self': (this.props.me.name == this.props.data.name),
            'disabled': (!this.props.asking),
            'user-turn': (this.props.data.turn),
        });

        var name = this.props.data.name;
        if(this.props.asking){
            name = "Ask " + this.props.data.name;
        }

        return (
            React.createElement("div", {className: classes2, key: this.props.data.name, onClick: this.handleClick}, 
                React.createElement("div", {className: "user col-md-6 col-xs-6"}, 
                    React.createElement("img", {className: classes, src: "/images/user_default.png"})
                ), 
                React.createElement("div", {className: "content col-md-6 col-xs-6"}, 
                    React.createElement("h3", {className: "name"}, name), 
                    React.createElement("p", {className: "profession"}, this.props.data.cards, " cards ", me, " ")
                )
            )
        );
    }
});

var PlayerList = React.createClass({displayName: "PlayerList",

    render: function(){
        var players = this.props.data.map(function(player){
            return React.createElement(Player, {data: player})
        });
        return (React.createElement("div", {className: "row"}, " ", players, " "));
    }
});

var Player = React.createClass({displayName: "Player",

    render: function(){
        var classes = cx({
            'user-item': true,
            'col-md-6 col-xs-6': true,
            'user-creator': this.props.data.creator,
        });
        return (
            React.createElement("div", {className: classes, key: this.props.data.name}, 
                React.createElement("div", {className: "col-md-offset-4 col-md-4 col-xs-offset-3 col-xs-6"}, 
                    React.createElement("img", {src: "/images/user_default.png", className: "img-circle"})
                ), 
                React.createElement("div", {className: "col-md-4 col-xs-3"}), 
                React.createElement("div", {className: "col-md-12 col-xs-12 center name"}, 
                    React.createElement("h4", null, this.props.data.name)
                )
            )
        );
    }
});

var CardDeck = React.createClass({displayName: "CardDeck",
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
                return (React.createElement("li", {className: "card-img", key: cardname}, React.createElement("img", {src: '/images/deck/' + cardname + '.png', alt: cardname})));
            }

        });
        if(that.count>0){
            return (
                React.createElement("ul", {className: "baraja-container", ref: "stack", onClick: that.handleClick}, 
                    cards
                )
            );
        }
        else{
            return React.createElement("span", null)
        }
    }
});

var GameCards = React.createClass({displayName: "GameCards",

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
                    React.createElement(CardDeck, {key: val + '-' + deck.length, half_suit: val, deck: deck, askCardsCallback: that.askCards})
                );
            });

            return (
                React.createElement("div", null, 
                    halfSuitsDiv
                )
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
                            'col-md-3 col-xs-3': true,
                            'btn': true,
                            'disabled': (disabled.length>0),
                            'active': (that.state.selected.suit==card.suit && that.state.selected.value==card.value),
                        });
                        return (React.createElement("li", {className: classes, key: cardname, onClick: that.handleClick.bind(that, card)}, React.createElement("img", {src: '/images/deck/' + cardname + '.png', alt: cardname})));
                    }
                });

                var selectedCard = null;
                if(that.state.selected.suit && that.state.selected.value){
                    selectedCard = React.createElement("h5", null, " ", that.state.selected.value, " of ", that.state.selected.suit, " ") 
                }
                return(
                    React.createElement("div", null, 
                        React.createElement("div", {className: "row"}, 
                            React.createElement("div", {className: "btn btn-default col-md-3 col-xs-3 transparent", onClick: that.showCards}, 
                                React.createElement("i", {className: "fa fa-arrow-left"}, " Back ")
                            ), 
                            React.createElement("div", {className: "col-md-6 col-xs-6 center"}, 
                                selectedCard
                            ), 
                            React.createElement("div", {className: "btn btn-default col-md-3 col-xs-3 transparent", onClick: that.announceSet}, 
                                "Announce ", React.createElement("i", {className: "fa fa-arrow-right"})
                            )
                        ), 
                        React.createElement("ul", {className: "card-show row"}, 
                            showDeck
                        )
                    )
                );
            }

            else{
                var deck = this.props.data.deck;
                var selectOptions = that.props.players.map(function(player){
                    if(player.name != that.props.data.name && player.team == that.props.data.team){
                        return (React.createElement("option", {value: player.name, key: player.name}, " ", player.name, " "));
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
                            'col-md-3 col-xs-3': true,
                            'btn': true,
                            'disabled': (disabled.length>0),
                            'active': (that.state.selected.suit==card.suit && that.state.selected.value==card.value),
                        });

                        var showSelect = null;
                        if(disabled.length<=0){
                            showSelect = React.createElement("div", {className: "form-group"}, " ", React.createElement("select", {className: "form-control", ref: "card" + count}, " ", selectOptions, " "), " ");
                        }
                        else{
                            showSelect = React.createElement("div", {className: "form-group"}, " ", React.createElement("select", {className: "form-control", ref: "card" + count}, " ", React.createElement("option", {value: that.props.data.name, key: that.props.data.name}, " ", that.props.data.name, " "), " "), " ");
                        }
                        count += 1;
                        return (
                            React.createElement("li", {className: classes, key: cardname}, 
                                React.createElement("img", {src: '/images/deck/' + cardname + '.png', alt: cardname}), 
                                showSelect
                            )
                        );
                    }
                });

                var selectedSet = React.createElement("h5", null, " ", that.halfSuitsName[that.state.current], " ");
                
                return(
                    React.createElement("div", null, 
                        React.createElement("div", {className: "row"}, 
                            React.createElement("div", {className: "btn btn-default col-md-3 col-xs-3 transparent", onClick: that.showCards}, 
                                React.createElement("i", {className: "fa fa-arrow-left"}, " Back ")
                            ), 
                            React.createElement("div", {className: "col-md-6 col-xs-6 center"}, 
                                selectedCard
                            ), 
                            React.createElement("div", {className: "btn btn-default col-md-3 col-xs-3 transparent", onClick: that.doneAnnounceSet}, 
                                "Done ", React.createElement("i", {className: "fa fa-arrow-right"})
                            )
                        ), 
                        React.createElement("ul", {className: "card-show row"}, 
                            showDeck
                        )
                    )
                );
            }
        }
    }
});

var LastMove = React.createClass({displayName: "LastMove",
    halfSuitsName: ['LOW CLUBS', 'LOW DIAMONDS', 'LOW HEARTS', 'LOW SPADES', 'HIGH CLUBS', 'HIGH DIAMONDS', 'HIGH HEARTS', 'HIGH SPADES'],

    render: function(){
        if(this.props.data && this.props.data.type==0){
            var classes =  cx({
                'highlight': true,
                'bg-success': this.props.data.success,
                'bg-danger': !(this.props.data.success), 
            });
            return (
                React.createElement("div", {className: classes}, 
                    React.createElement("h4", {className: "center"}, " Last: ", React.createElement("strong", {className: "name"}, " ", this.props.data.from, " "), " asked ", this.props.data.card.value, " of ", this.props.data.card.suit, " from ", React.createElement("strong", {className: "name"}, " ", this.props.data.to, " "), ". ")
                )
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
                React.createElement("div", {className: classes}, 
                    React.createElement("h4", {className: "center"}, " Last: ", React.createElement("strong", {className: "name"}, " Team ", this.props.data.team + 1, " "), " announced ", this.halfSuitsName[this.props.data.half_suit], " ")
                )
            );
        }
        else{
            return React.createElement("div", null);
        }
    }
});

var GamePlay = React.createClass({displayName: "GamePlay",

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
            React.createElement("div", {className: "row bg-green"}, 
                React.createElement("div", {className: "col-md-3 bg-blue col-xs-12"}, 
                    React.createElement("div", {className: "row"}, 
                        React.createElement("h2", {className: "text-center"}, " Team 1 - ", React.createElement("span", {className: "label label-default"}, this.props.score[0]), " ")
                    ), 
                    React.createElement(TeamList, {team: 0, data: this.props.players, me: this.props.me, ask: askData, token: this.props.token, waitCallback: this.wait})
                ), 
                React.createElement("div", {className: "col-md-6 col-xs-12"}, 
                    React.createElement(LastMove, {data: this.props.lastMove}), 
                    React.createElement(GameCards, {data: this.props.me, players: this.props.players, askUserCallback: this.askUser, wait: this.props.wait, token: this.props.token, waitCallback: this.wait})
                ), 
                React.createElement("div", {className: "col-md-3 bg-red col-xs-12"}, 
                    React.createElement("div", {className: "row"}, 
                        React.createElement("h2", {className: "text-center"}, " Team 2 - ", React.createElement("span", {className: "label label-default"}, this.props.score[1]))
                    ), 
                    React.createElement(TeamList, {team: 1, data: this.props.players, me: this.props.me, ask: askData, token: this.props.token, waitCallback: this.wait})
                )
            )
        );
    }
});

var GameBody = React.createClass({displayName: "GameBody",
    
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

    handleSelect: function(){
        var text = React.findDOMNode(this.refs.url);
        if(text){
            var doc = document;
            var range, selection;
            if (doc.body.createTextRange) {
                range = document.body.createTextRange();
                range.moveToElementText(text);
                range.select();
            } else if (window.getSelection) {
                selection = window.getSelection();        
                range = document.createRange();
                range.selectNodeContents(text);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    },

    turnWaitingSet: function(val){
        var oldstate = this.state;
        oldstate.turnWaiting = val;
        this.setState(oldstate);
    },

    render: function(){
        if(this.state.newGame){
            return React.createElement(NewGameBox, {token: this.state.token})
        }
        else if(this.state.joinGame){
            return React.createElement(JoinGameBox, {token: this.state.token})
        }
        else if(this.state.waitGame){
            var players = React.createElement(PlayerList, {data: this.state.players})
            var ready = null;
            if(this.state.players.length == this.state.nop){
                ready = React.createElement("span", null, "Almost ready");
            }
            else{
                ready = React.createElement("span", null, this.state.players.length, " / ", this.state.nop, " Players joined...");
            }
            return (
                React.createElement("div", null, 
                    React.createElement("h4", null, 
                        "To invite a friend, give the following URL: ", React.createElement("br", null), " ", React.createElement("div", {className: "center row", onClick: this.handleSelect, ref: "url"}, React.createElement("em", {className: "label label-info"}, " ", window.location.origin, "/game/", this.state.token, " ")), 
                        React.createElement("hr", null), 
                        React.createElement("i", {className: "fa fa-spinner fa-spin"}), " ", ready, 
                        React.createElement("br", null)
                    ), 
                    players
                )
            );
        }
        else if(this.state.startGame){
            return (React.createElement(GamePlay, {token: this.state.token, me: this.state.me, players: this.state.players, score: this.state.score, wait: this.state.turnWaiting, waitCallback: this.turnWaitingSet, lastMove: this.state.lastMove}));
        }
        return (React.createElement("div", null, "Hello World!!"));
    }
});