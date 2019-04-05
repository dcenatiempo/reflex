const { emit } = require('../io/events');
const Game = require('./Game');
const Chat = require('./Chat');

const games = {}; // TODO change to rooms
const chats = {
  arena: new Chat.Chat('arena'),
};
const users = {};

let io;

const injectIo = function(ioServer) {
  io = ioServer;
  Game.injectIo(io);
}

const createGameRoom = function(roomName, playerIds) {
  console.log(`A game for ${roomName} was created`);
  games[roomName] = new Game.Game(roomName, playerIds);
  games[roomName].reflex = reflex;
  return Promise.resolve(games[roomName]);
};

const roomExists = function(roomName) {
  return games[roomName] ? true : false;
}

const getGameRoom = function(roomName) {
  return games[roomName];
}

const getRoomList = function() {
  return Object.keys(games).map(room => ({
    name: room,
    players: Object.keys(games[room].players),
  }));

}

const getChat = function(room) {
  let chat = chats[room];
  return chat ? chat.chat : [];
}

const postChat = function({ room, message, userId }) {
    // if chat doesn't exist, create it
    if (!chats[room]) {
        chats[room] = new Chat.Chat(room);
    }
    console.log(message);
    return chats[room].postChat({ message, userId }); // promise
}

const startCountdown = function(roomName) {
  games[roomName].doCountdown();
}

const addPlayers = function(roomName, playerIds) {
  playerIds = 'string' === typeof playerIds ? [playerIds] : playerIds;
  console.log('game.setPlayers()')
  if (!roomExists(roomName))
    createGameRoom(roomName, playerIds);
  else
    games[roomName].addPlayers(playerIds);
  return Promise.resolve(games[roomName]);
};

const removePlayers = function(roomName, playerIds) {
  playerIds = 'string' === typeof playerIds ? [playerIds] : playerIds;
  console.log('game.removePlayers()')
  if (!roomExists(roomName))
    return Promise.reject()
  else
    return games[roomName].removePlayers(playerIds)
    .then( (players) => {
      if (Object.keys(players).length === 0)
        return destroyGameRoom(roomName);
      return Promise.resolve();
    }).catch( err => console.log(err));
};

const destroyGameRoom = function(roomName) {
    console.log('game.destroyGameRoom');
    delete games[roomName];
    delete chat[roomName];
    io.sockets.emit(emit.UPDATE_ROOM_LIST, getRoomList());
    return Promise.resolve();
}

const reflex = {  
  injectIo,
  users,
  
  roomExists,
  getRoomList,
  createGameRoom,
  getGameRoom,
  startCountdown,
  addPlayers,
  removePlayers,
  destroyGameRoom,
  getChat,
  postChat,
}

module.exports = reflex; 