module.exports = function (server) {

    var io = require('socket.io').listen(server);

    
    var games = {};

    var suits = ['CLUBS', 'DIAMONDS', 'HEARTS', 'SPADES'];
    var value = ['2', '3', '4', '5', '6', '7', '9', '10', 'JACK', 'QUEEN', 'KING', 'ACE'];

    /*
     * Socket IO event handlers
     */
    io.sockets.on('connection', function (socket) {
        var username = '';

        socket.on('new-game', function (data){
            console.log("new-game");
            console.log(data);
            username = data.username;
            var room = data.token;
            if (!(room in games)) {
                var players = [{
                    socket: socket.id,
                    name: username,
                    creator: true,
                }];
                games[room] = {
                    room: room,
                    creator: socket.id,
                    status: 'waiting',
                    creationDate: Date.now(),
                    players: players,
                    nop: data.nop,
                    team: [0, 0],
                };
                socket.join(room);
                socket.emit('wait', {
                    players: getPlayerList(room),
                    nop: data.nop,
                });
                return;
            }

        });


        /*
         * A player joins a game
         */
        socket.on('join-game', function (data) {
            console.log("join-game");
            console.log(data);
            var room = data.token;
            username = data.username;
            // If the player is the first to join, initialize the game and players array
            if (!(room in games)) {
                console.log("No game found.");
                socket.emit('error-join');
                return;
            }

            var game = games[room];

            if(socket.rooms.indexOf(room) >= 0){
                console.log("Game already joined.");
                return;
            }

            /* TODO: handle full case, a third player attempts to join the game after already 2 players has joined the game*/
            if (game.status === "ready") {
                console.log("Game already going on.");
                socket.emit('error-join');
                return;
            }
            socket.join(room);
            while(true){
                var check = false;
                for (var p in game.players) {
                    var player = game.players[p];
                    if(player.name==username){
                        username = "_" + username;
                        check = true;
                        break;
                    }
                }
                if(!check){
                    break;
                }

            }
            game.players.push({
                socket: socket.id,
                name: username,
                creator: false,
            });

            if(game.players.length < game.nop){
                game.status = "waiting";
                io.sockets.to(room).emit('wait', {
                    players: getPlayerList(room),
                    nop: game.nop,
                });
            }
            else if(game.players.length == game.nop){
                game.status = "ready";
                io.sockets.to(room).emit('wait', {
                    players: getPlayerList(room),
                    nop: game.nop,
                });

                var deck = getNewDeck();
                var turn = Math.floor(Math.random() * game.nop);
                var N = game.nop; 
                var team = Array.apply(null, {length: N}).map(Number.call, Number);
                team = shuffle(team);

                for(var i=0; i<team.length;i++){
                    if(i < game.nop/2){
                        game.players[team[i]].team = 0;
                    }
                    else{
                        game.players[team[i]].team = 1;
                    }
                }

                for (var p in game.players) {
                    var player = game.players[p];
                    player.deck = [];
                    player.turn = false;
                }
                game.players[turn].turn = true;
                for(var i=0; i<deck.length;){
                    for (var p in game.players) {
                        var player = game.players[p];
                        player.deck.push(deck[i]);
                        i++;
                    }
                }
                for (var p in game.players) {
                    var player = game.players[p];
                    io.sockets.to(player.socket).emit("start-game", {
                        players: getPlayerList(game.room),
                        player: player,
                        score: game.team,
                    });
                }
            }

        });

        /*
         * A player makes a new move => broadcast that move to the opponent
         */
        socket.on('new-move', function(data) {
            console.log(data);
            var room = data.token;
            var toPlayer = data.player;
            var card = data.card;
            if (!(room in games)) {
                console.log("No game found.");
                socket.emit('error-join');
                return;
            }
            var game = games[room];
            var fromPlayer = null;

            for(var p in game.players){
                var player = game.players[p];
                if(socket.id == player.socket){
                    fromPlayer = player;
                }
                if(toPlayer == player.name){
                    toPlayer = player;
                }
            }

            if(!fromPlayer){
                console.log("No player!.");
                socket.emit('error-join');
                return;
            }
            var lastMove = null;
            for(var c = 0; c < toPlayer.deck.length; c++){
                var toCard = toPlayer.deck[c];
                if(toCard.suit == card.suit && toCard.value == card.value){
                    toPlayer.deck.splice(c,1);
                    fromPlayer.deck.push(toCard);
                    lastMove = {
                        type: 0,
                        to: toPlayer.name,
                        from: fromPlayer.name,
                        card: card,
                        success: true,
                    }
                    break;
                }
            }

            if(!lastMove){
                toPlayer.turn = true;
                fromPlayer.turn = false;
                lastMove = {
                    type: 0,
                    to: toPlayer.name,
                    from: fromPlayer.name,
                    card: card,
                    success: false,
                }
            }
            for (var p in game.players) {
                var player = game.players[p];
                io.sockets.to(player.socket).emit("start-game", {
                    players: getPlayerList(game.room),
                    player: player,
                    lastMove: lastMove,
                    score: game.team,
                });
            }
        });

        socket.on('new-announce', function(data){
            console.log(data);
            var room = data.token;
            if (!(room in games)) {
                console.log("No game found.");
                socket.emit('error-join');
                return;
            }
            var game = games[room];
            var half_suit = data.half_suit;
            var suit = suits[half_suit%4];
            var cards = data.cards;
            var team = data.team;
            var cardHolder = [];

            for(var i=0; i<6; i++){
                var val = value[((half_suit>=4)? 6+i:i)];

                for(var p in game.players){
                    var player = game.players[p];
                    var card_found = false;
                    for(var c = 0; c < player.deck.length; c++){
                        var card = player.deck[c];
                        if(suit == card.suit && val == card.value){
                            card_found = true;
                            console.log(i + " " +suit + " " + val);
                            cardHolder.push({
                                player: player.name,
                                team: player.team,
                            });
                            player.deck.splice(c,1);
                            break;
                        }
                    }
                    if(card_found) break;
                }
            }
            var status = 0;
            for(var i=0; i<6; i++){
                console.log(cardHolder[i]);
                console.log(cards[i]);
                if(cardHolder[i].team != team){
                    status = -1;
                    break;
                }
                else {
                    if(cardHolder[i].player!=cards[i]){
                        status = 1;
                    }
                }
            }
            var lastMove = {
                type: 1,
                success: 0,
                team: team,
                half_suit: half_suit, 
            }
            if(status == -1){
                game.team[team] -= 1;
                lastMove.success = -1;
            }
            else if(status==0){
                game.team[team] += 1;
                lastMove.success = 1;
            }


            for (var p in game.players) {
                var player = game.players[p];
                io.sockets.to(player.socket).emit("start-game", {
                    players: getPlayerList(game.room),
                    player: player,
                    lastMove: lastMove,
                    score: game.team,
                });
            }


        });


        /*
         * A player disconnects dependent on status of game
         */
        socket.on('disconnect', function(data){
            console.log('user disconnected');
            for (var token in games) {
                var game = games[token];
                for (var p=0;p<game.players.length; p++) {
                    var player = game.players[p];
                    if(player.socket == socket.id){
                        if(game.status == "waiting"){
                            game.players.splice(p, 1);
                            io.sockets.to(game.room).emit('wait', {
                                players: getPlayerList(game.room),
                                nop: game.nop,
                            });
                            return;
                        }
                        else if(game.status=="ready"){
                            io.sockets.to(game.room).emit('error-join');
                            delete(games[token]);
                            return;
                        }
                    }
                }
            }
        });

        socket.on('error', function (err) { 
            console.error("ERROR!!");
            console.error(err.stack);
            socket.emit('error-join');
        })

    });

    var getPlayerList = function(room) {
        var game = games[room];
        var players = [];
        for (var p in game.players) {
            var player = game.players[p];
            players.push({
                name: player.name, 
                creator: player.creator,
                turn: player.turn,
                team: player.team,
                cards: (player.deck?player.deck.length:0),
            });
        }
        return players;
    }
    var shuffle = function(array) {
        var currentIndex = array.length, temporaryValue, randomIndex ;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }

    var getNewDeck = function(){
        var deck = [];
        for (var i = 0; i < suits.length; i++) {
            for (var j = 0; j < value.length; j++) {
                deck.push({
                    suit: suits[i],
                    value: value[j],
                    half_suit: (j<6 ? i:i+4),
                });
            }   
        }
        deck = shuffle(deck);
        return deck;
    }

};