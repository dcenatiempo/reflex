const io = require('socket.io')();
const events = require('./eventHandlers');
const { on } = require('./events');
const { init } = require('../reflex/Game');


events.register(io);
init(io);

io.on('connection', function (socket) {
  events.connection(socket);
  
  socket.conn.on(on.HEARTBEAT, () => { events.heartbeat(socket) });

  socket.on('delete-player', (playerId) => { events.deletePlayer(socket, playerId)});

  socket.on('enter-room', (room) => { events.enterRoom(socket, room) });
  socket.on('request-room-chat', (room) => { events.requestRoomChat(socket, room) });
  socket.on('leave-room', (room) => { events.leaveRoom(socket, room) });

  socket.on('enter-arena', () => { events.enterArena(socket) });
  socket.on('request-rooms', () => { events.requestRooms(socket) });
  socket.on('request-arena-chat', () => { events.requestArenaChat(socket) });
  socket.on('leave-arena', () => { events.leaveArena(socket) });

  socket.on('start-game', () => { events.startGame(socket) });
  socket.on('request-game-object', () => { events.requestGameObject(socket) });
  socket.on('request-move', (data) => { events.requestMove(socket, data) });

  socket.on('disconnect', (reason) => { events.disconnect(socket, reason) });
});

module.exports = io;
