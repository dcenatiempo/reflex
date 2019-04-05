const io = require('socket.io')();
const events = require('./eventHandlers');
const { on } = require('./events');
const { injectIo } = require('../reflex');

// inject socket.io into eventHandlers
events.registerIo(io);
// inject socket.io into reflex
injectIo(io);

io.on('connection', function (socket) {
  events.connection(socket);
  
  socket.conn.on(on.HEARTBEAT, () => { events.heartbeat(socket) });

  socket.on('sign-in', (name) => { events.signIn(socket, name)});
  socket.on('sign-out', () => { events.signOut(socket)});

  socket.on('delete-player', () => { events.deletePlayer(socket)});

  socket.on('post-chat', (data) => { events.postChat(socket, data)});

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
  socket.on('kill-player', (frame) => { events.killPlayer(socket, frame) });

  socket.on('disconnect', (reason) => { events.disconnect(socket, reason) });
});

module.exports = io;
