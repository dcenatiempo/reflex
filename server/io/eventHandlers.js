// const db = require('../db').get();
// const ObjectID = require('mongodb').ObjectID;
const { emit } = require('./events');
const reflex = require('../reflex');
const { randomStr } = require('../bin/helpers');

const MS_TO_RECONNECT = 1 * 1000

let io;

const registerIo = function (ioServer) {
    io = ioServer;
}

const connection = function(socket) {
    let user = socket.handshake.query.currentUser;
    let room = socket.handshake.query.currentRoom;
    user = 'null' == user ? null : JSON.parse(user);
    room = 'null' == room ? null : room;

    if (!user) {
        socket.emit(emit.UPDATE_PLAYER_LIST, reflex.users);
        return;
    }

    socket.playerId = user.id;
    socket.currentRoom = room;    
    console.log(`${user.name} connected (${user.id})`);

    // maybe create user object & emit player list
    if (reflex.users[user.id]) {
        socket.emit(emit.UPDATE_PLAYER_LIST, reflex.users);
    } else {
        reflex.users[user.id] = user.name;
        io.sockets.emit(emit.UPDATE_PLAYER_LIST, reflex.users);
    }
    
    // maybe create game object & emit room list
    if (room) {
        enterRoom(socket, room);
    } else {
        requestRooms(socket); 
    }
}
  
const heartbeat = function(socket) {
    // console.log('heartbeat: ' + socket.playerId);
    if (!socket.playerId) return;    
}

const signIn = function(socket, name) {
    const id = randomStr(32);
    reflex.users[id] = name;
    socket.playerId = id;
    socket.emit('sign-in', { name, id });
    io.sockets.emit(emit.UPDATE_PLAYER_LIST, reflex.users);
}

const signOut = function(socket) {
    delete reflex.users[socket.playerId];
    socket.playerId = null;
    socket.emit('sign-out');
    io.sockets.emit(emit.UPDATE_PLAYER_LIST, reflex.users);
}

const deletePlayer = function(socket) {
    // log player out
    signOut(socket);
}

const enterRoom = function(socket, room) {
    reflex.addPlayers(room, [socket.playerId]).then(() => {
        return roomChange(socket, 'join', room);
    }).then(room => {
        socket.emit(emit.JOIN_ROOM, room);
        io.sockets.emit(emit.UPDATE_ROOM_LIST, reflex.getRoomList());
    }).catch( (err) => {
        console.log(err);
    });
}

const leaveRoom = function(socket) {
    if (!socket.currentRoom) return;
    let room = getPlayerRoom(socket);
    reflex.removePlayers(room, [socket.playerId]).then( () => {
        return roomChange(socket, 'leave', socket.currentRoom);
    }).then(room => {
        socket.emit(emit.LEAVE_ROOM);
        io.sockets.emit(emit.UPDATE_ROOM_LIST, reflex.getRoomList());
    }).catch( err => console.log(err));
}

const requestRooms = function(socket) {
    socket.emit(emit.UPDATE_ROOM_LIST, reflex.getRoomList());
}

const requestArenaChat = function(socket) {
    socket.emit(emit.UPDATE_ARENA_CHAT, reflex.getChat('arena'));
}

const requestRoomChat = function(socket, room) {
    console.log('request room chat')
    socket.emit(emit.UPDATE_ROOM_CHAT, reflex.getChat(room));
}

const postChat = function(socket, { room, message, userId }) {
    reflex.postChat({ room, message, userId }).then( (chat) => {
        if ('arena' === room)
            io.sockets.emit(emit[`UPDATE_ARENA_CHAT`], chat);
        else
            io.to(room).emit(emit[`UPDATE_ROOM_CHAT`], chat); 
    }).catch(err => console.log(err));
}

const startGame = function(socket) {
    const roomName = getPlayerRoom(socket);
    if (!roomName) return;

    reflex.startCountdown(roomName);
}

const requestMove = function(socket, data) {
    const roomName = getPlayerRoom(socket);
    if (!roomName) return;

    // reflex[room]
    reflex.getGameRoom(roomName).requestPlayerMove(socket.playerId, data);
}

const requestGameObject = function(socket) {
    console.log('requesting game object')
    const roomName = getPlayerRoom(socket);
    if (!roomName) return;
    let room = io.to(roomName);
    if (!room) return;
    room.emit(emit.GAME_OBJECT, reflex.getGameRoom(roomName).getGameObjectForClient());
}

const killPlayer = function(socket, frame) {
    const roomName = getPlayerRoom(socket);
    if (!roomName) return;

    reflex.getGameRoom(roomName).killPlayer(socket.playerId, frame);
}

const disconnect = function(socket, reason) {
    // 'client namespace disconnect'
    // ‘ping timeout'
    // 'transport close'
    // 'transport error'
    console.log(`${socket.playerId} disconnected because ${reason}`);
    if (reason === 'client namespace disconnect') {
        // explicit client disconnect
        deletePlayer(socket);
    }
    if (reason === 'transport close') {
        // browser closed
        let oldPlayerId = socket.playerId;
        setTimeout(() => {
            if (!playerIsConnected(oldPlayerId))
                deletePlayer(socket);
        }, MS_TO_RECONNECT);
    }
}

module.exports = {
    connection,
    registerIo,
    signIn,
    signOut,
    heartbeat,
    deletePlayer,
    enterRoom,
    leaveRoom,
    requestRooms,
    postChat,
    requestArenaChat,
    requestRoomChat,
    startGame,
    requestMove,
    requestGameObject,
    killPlayer,
    disconnect
};

function roomChange(socket, action, room) {
    console.log(`${action}ing room: ${room}`);

    socket.currentRoom = 'join' === action ? room : null;

    return new Promise((resolve, reject) => {
        socket[action](room, (err) => {
            if (err) reject(err);
            console.log(`successfully ${action}ed room: ${room}`);
            requestGameObject(socket);
            resolve(room);
        });
    });   
}

function getPlayerRoom(socket) {
    let rooms = Object.keys(socket.rooms).filter(room => room !== socket.id);
    let room = rooms.length > 0 ? rooms[0] : null;
    if (room === null) console.log('error: player not in a game room!');
    return room;
}

function playerIsConnected(playerId) {
    let allConnectedClients = Object.keys(io.sockets.connected);

    let exists = false;
    allConnectedClients.forEach(id => {
        if (io.sockets.connected[id].playerId === playerId) {
            exists = true;
        }
    });
    return exists;
}
