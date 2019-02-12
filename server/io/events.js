const db = require('../db').get();
const ObjectID = require('mongodb').ObjectID;
  
const heartbeat = function() {
    console.log('heartbeat');
    if (!playerId) return;
    // update timestamp
    db.players.updateOne({ _id: playerId }, { $set: { updatedAt: new Date()} })
    .then (res => {
        if (0 == res.matchedCount) {
        socket.emit('delete-user');
        // get all players
        db.players.find().toArray().then(allPlayers => {
            socket.emit('players-update', allPlayers);
        });
        }
    }).catch( err => {console.log(err)});
}

const newPlayer = function(name) {
    console.log('New player: ' + name);

    let player = {
        name,
        wins: 0,
        gamesPlayed: 0,
        updateAt: new Date()
    }

    // add player to database
    db.players.insertOne(player).then( (res) => {
        playerId = res.insertedId;
        
        // send player their player id
        socket.emit('player-id', res.insertedId);
        
        // get updated player list
        db.players.find().toArray().then(allPlayers => {
        // send player list to all players
        io.sockets.emit('players-update', allPlayers);
        }); 
    });
}

const enterRoom = function(room) {
    console.log('New Room: ' + room);

    socket.join([room], (err) => {
        let sockets = Object.keys(io.sockets.clients().sockets);
        let rooms = Object.keys(io.sockets.adapter.rooms);
        
        // an array or room names
        rooms = rooms.filter(room => !sockets.includes(room));

        io.sockets.emit('rooms-update', rooms);

    });
}

const requestRooms = function() {
    let sockets = Object.keys(io.sockets.clients().sockets);
    let rooms = Object.keys(io.sockets.adapter.rooms);

    // an array or room names
    rooms = rooms.filter(room => !sockets.includes(room));

    socket.emit('rooms-update', rooms);
}

const sendArenaChat = function(message) {
    console.log('sending message!!!')
    // let sockets = Object.keys(io.sockets.clients().sockets);
    // console.log(sockets);
    io.sockets.emit('update-arena-chat', {message: message, playerId});
}

const sendRoomChat = function(payload) {
    io.to(payload.room).emit('update-room-chat', {message: payload.message, from: playerId});
}

const disconnect = function() {
    console.log('user disconnected: ' + playerId);

    // remove player from players & rooms collection
    // db.players.deleteOne({_id: playerId}, (err, res) => {
    //   if(err) console.log(err);
    //   console.log('player deleted');
    //   // get updated player list
    //   db.players.find().toArray().then(allPlayers => {
    //     // send playerlist to all players
    //     io.sockets.emit('players-update', allPlayers);
    //   }); 
    // });
}

module.exports = io;

