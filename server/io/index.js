const io = require('socket.io')();
const db = require('../db').get();
const ObjectID = require('mongodb').ObjectID;
const events = require('./events');

events.register(io);

io.on('connection', function (socket) {
  events.connection(socket);
  
  socket.conn.on('heartbeat', () => { events.heartbeat(socket) });

  socket.on('new-player', (name) => { events.newPlayer(socket, name) });

  socket.on('delete-player', (playerId) => { events.deletePlayer(socket, playerId)});

  socket.on('enter-room', (room) => { events.enterRoom(socket, room) });

  socket.on('leave-room', (room) => { events.leaveRoom(socket, room) });

  socket.on('request-rooms', () => { events.requestRooms(socket) });

  socket.on('send-arena-chat', (message) => { events.sendArenaChat(socket, message) });

  socket.on('send-room-chat', (payload) => { events.sendRoomChat(socket, payload) });

  socket.on('disconnect', (reason) => { events.disconnect(socket, reason) });

});

module.exports = io;
