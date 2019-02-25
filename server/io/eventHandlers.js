// const db = require('../db').get();
// const ObjectID = require('mongodb').ObjectID;
const { emit } = require('./events');
const fb = require('../firebase');
const reflex = require('../reflex');

let io;

const register = function (ioServer) {
    io = ioServer;
}

const connection = function(socket) {
    socket.playerId = socket.handshake.query.playerId;
    socket.currentRoom = socket.handshake.query.currentRoom;
    socket.playerId = 'null' == socket.playerId ? null : socket.playerId;
    socket.currentRoom = 'null' == socket.currentRoom ? null : socket.currentRoom;
    console.log('A user connected: '+ socket.playerId + ', ' + socket.id);

    if (socket.playerId) {
        // update timestamp
        fb.get().db
            .collection('players')
            .doc(socket.playerId)
            .update({
                updatedAt: new Date(),
                socketId: socket.id
            }).then( () => {
                if (!socket.currentRoom) {
                    requestRooms(socket);
                    return;
                }
                roomChange(socket, 'join', socket.currentRoom);
            }).catch( err => {
                notifyClientsPlayerDeleted(socket);
                console.log(err)
            });
    }
}
  
const heartbeat = function(socket) {
    console.log('heartbeat: ' + socket.playerId);
    if (!socket.playerId) return;

    fb.get().db.collection('players').doc(socket.playerId).update({ updatedAt: new Date }).catch( err => {
        notifyClientsPlayerDeleted(socket)
        console.log(err);
    });
}

const deletePlayer = function(socket, playerId) {
    
    // remove player from players collection
    db.players.deleteOne({_id: playerId}, (err, res) => {
        if(err) console.log(err);

        socket.playerId = null;
        console.log('player deleted');
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

const requestRooms = function(socket) {
    // console.log('request rooms')
    socket.emit(emit.UPDATE_ROOM_LIST, fb.get().rooms);
    // console.log(fb.get().rooms)
}

const requestArenaChat = function(socket) {
    // console.log('request arena chat')
    fb.get().db.collection('chat').doc('arenaChat').get()
        .then(doc => {
            if (!doc.exists) {
                console.log('arenaChat does not exist');
              } else {
                socket.emit(emit.UPDATE_ARENA_CHAT, doc.data().chat);
              }
        }).catch( e => {
            console.log(e);
        });
    
}

const requestRoomChat = function(socket, room) {
    console.log('request room chat')
    fb.get().db.collection('chat').doc(`${room}Chat`).get()
        .then(doc => {
            if (!doc.exists) {
                console.log(`${room}Chat does not exist`);
              } else {
                io.to(room).emit(emit.UPDATE_ROOM_CHAT, doc.data().chat);
              }
        }).catch( e => {
            console.log(e);
        });
    
}

const startGame = function(socket) {
    const roomName = getPlayerRoom(socket);
    if (!roomName) return;

    reflex.startCountdown(roomName);
}

const requestMove = function(socket, data) {
    const roomName = getPlayerRoom(socket);
    if (!roomName) return;

    console.log(data, roomName, socket.playerId);
    // reflex[room]
    reflex.getGameRoom(roomName).requestPlayerMove(socket.playerId, data);
}

const requestGameObject = function(socket) {
    const roomName = getPlayerRoom(socket);
    if (!roomName) return;
    io.to(roomName).emit(emit.GAME_OBJECT, reflex.getGameRoom(roomName));
}

const disconnect = function(socket, reason) {
    // 'client namespace disconnect'
    // ‘ping timeout'
    // 'transport close'
    // 'transport error'
    console.log(`${socket.playerId} disconnected because ${reason}`);
    if ('client namespace disconnect' === reason) {
        deletePlayer();
    }
}

module.exports = {
    connection,
    register,
    heartbeat,
    deletePlayer,
    enterRoom,
    leaveRoom,
    requestRooms,
    requestArenaChat,
    requestRoomChat,
    startGame,
    requestMove,
    requestGameObject,
    disconnect
};

// function emitPlayersUpdate() {
//     io.sockets.emit(emit.UPDATE_PLAYER_LIST, fb.get().players);
// }


function notifyClientsPlayerDeleted(socket) {
    // notify client that playerId is no longer valid
    socket.emit(emit.DELETE_PLAYER);
            
    // send all players the new player list
    // emitPlayersUpdate(socket);
}

function roomChange(socket, action, room) {
    console.log(`${action}ing room: ${room}`);

    socket.currentRoom = 'join' === action ? room : null;

    socket[action](room, (err) => {
        if (err) console.log(err);
        console.log(`successfully ${action}ed room: ${room}`);
    });
}

function getPlayerRoom(socket) {
    let rooms = Object.keys(socket.rooms).filter(room => room !== socket.id);
    let room = rooms.length > 0 ? rooms[0] : null;
    if (room === null) console.log('error: player not in a game room!');
    return room;
}
