const db = require('../db').get();
// const ObjectID = require('mongodb').ObjectID;
const { emit } = require('./events');

let io;

const register = function (ioServer) {
    io = ioServer;
}

const connection = function(socket) {
    socket.playerId = socket.handshake.query.playerId;
    socket.currentRoom = socket.handshake.query.currentRoom;
    console.log(socket.playerId)
    socket.playerId = 'null' == socket.playerId ? null : socket.playerId;
    socket.currentRoom = 'null' == socket.currentRoom ? null : socket.currentRoom;

    if (socket.playerId) {
        // update timestamp
        let query = { _id: socket.playerId };
        let update = { $set: { updatedAt: new Date(), socketId: socket.id} }
        db.players.findOneAndUpdate(query, update).then (res => {
            if (0 == res.lastErrorObject.updatedExisting) {
                notifyClientsPlayerDeleted(socket);
                return;
            }
            
            if (!socket.currentRoom) return;
        
            roomChange(socket, 'join', socket.currentRoom);
        }).catch( err => {console.log(err)});
    }

    console.log('A user connected: '+ socket.playerId + ', ' + socket.id);
    
    // send all players the new player list
    emitPlayersUpdate();
}
  
const heartbeat = function(socket) {
    console.log('heartbeat: ' + socket.playerId);
    if (!socket.playerId) return;
    
    // update mongo to prevent player expiration
    let query = { _id: socket.playerId };
    let update = { $set: { updatedAt: new Date()} }
    db.players.updateOne(query, update).then (res => {
        if (1 == res.matchedCount) return;
        notifyClientsPlayerDeleted(socket)
    }).catch( err => { console.log(err); });
}

const newPlayer = function(socket, name) {
    console.log('New player: ' + name);

    let player = {
        name,
        wins: 0,
        gamesPlayed: 0,
        updatedAt: new Date(),
        createdAt: new Date(),
        socketId: socket.id
    }

    // add player to database
    db.players.insertOne(player).then( res => {
        socket.playerId = res.insertedId;
        
        // send player their player id
        socket.emit(emit.ADD_PLAYER, res.insertedId);
        
        // send all players the new player list
        emitPlayersUpdate(); 
    }).catch(e => { console.log(e); });
}

const deletePlayer = function(socket, playerId) {
    
    // remove player from players collection
    db.players.deleteOne({_id: playerId}, (err, res) => {
        if(err) console.log(err);

        socket.playerId = null;
        console.log('player deleted');
        
        // send all players the new player list
        emitPlayersUpdate(); 
    });

    // remove player from rooms collection
    if (socket.currentRoom) {
        roomChange(socket, 'leave', socket.currentRoom);
    }
}

const enterRoom = function(socket, room) {
    roomChange(socket, 'join', room);
}

const leaveRoom = function(socket, room) {
    roomChange(socket, 'leave', room);
}

const requestRooms = async function(socket) {
    let rooms = await getRooms();
    socket.emit(emit.ROOMS_UPDATE, rooms);
}

const sendArenaChat = function(socket, message) {
    const payload = {
        message: message.substring(0,255),
        playerId: socket.playerId
    };
    io.sockets.emit(emit.UPDATE_ARENA_CHAT, payload);
}

const sendRoomChat = function(socket, message) {
    const payload = {
        message: message.substring(0,255),
        playerId: socket.playerId
    };
    console.log(payload)
    io.to(socket.currentRoom).emit(emit.UPDATE_ROOM_CHAT, payload);
}

const disconnect = function(socket, reason) {
    // 'io server disconnect’
    // ‘io client disconnect’
    // ‘ping timeout'
    // 'transport close'
    // 'transport error'
    console.log(`${socket.playerId} disconnected because ${reason}`);
}

module.exports = {
    connection,
    register,
    heartbeat,
    newPlayer,
    deletePlayer,
    enterRoom,
    leaveRoom,
    requestRooms,
    sendArenaChat,
    sendRoomChat,
    disconnect
};

function roomDif(before, after) {
    let dif = after.filter(item => !before.find(room => room.name === item.name));
    console.log(dif)

    if (dif.length === 0)
        return null;

    return dif;
}

function emitPlayersUpdate() {
    db.players.find().toArray().then(allPlayers => {
        io.sockets.emit(emit.PLAYERS_UPDATE, allPlayers);
    }).catch(e=>console.log(e)); 
}

async function getRooms() {
    let sockets = Object.keys(io.sockets.clients().sockets);
    let roomsAndSockets = Object.keys(io.sockets.adapter.rooms);
    let rooms = roomsAndSockets.filter(roomOrSocket => !sockets.includes(roomOrSocket));

    let roomPromises = rooms.map(async room => {
        let count = 0;
        await io.in(room).clients( async (err, clients) => {
                count = clients.length;
        });
        return {
            name: room,
            playerCount: count
        };
    });
    return Promise.all(roomPromises);
}

function notifyClientsPlayerDeleted(socket) {
    // notify client that playerId is no longer valid
    socket.emit(emit.DELETE_PLAYER);
            
    // send all players the new player list
    emitPlayersUpdate(socket);
}

async function roomChange(socket, action, room) {
    console.log(`${action}ing room: ${room}`);
    
    socket.currentRoom = 'join' === action ? room : null;

    let beforeRooms = await getRooms();

    // join or leave room
    socket[action]([room], async (err) => {
        io.in(room).clients((err, clients) => {
            db.players.find({ socketId: {$in: clients } })
                .toArray()
                .then (players => {
                    io.to(room).emit(emit.ROOM_PLAYERS_UPDATE, players);
            });
        });
  
        let afterRooms = await getRooms();

        let dif = 'join' === action
            ? roomDif(beforeRooms, afterRooms)
            : roomDif(afterRooms, beforeRooms);
        
        if (dif) {
            'join' === action
                ? console.log('Create Room: ' + dif[0].name)
                : console.log('Destroy Room: ' + dif[0].name);
        }

        io.sockets.emit(emit.ROOMS_UPDATE, afterRooms);
  
      });
}
