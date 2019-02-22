const Game = require('./Game');

const games = {};

const createGameRoom = function(roomName, playerIds) {
  console.log(`A game for ${roomName} was created`);
  games[roomName] = new Game(roomName, playerIds);
  return Promise.resolve(games[roomName]);
};

const setPlayers = function(roomName, playerIds) {
  console.log('game.setPlayers()')
  games[roomName].setPlayers(playerIds);
  return Promise.resolve(games[roomName]);
};

const destroyGameRoom = function(roomName) {
    console.log('game.destroyGameRoom');
    delete games[roomName];
    return Promise.resolve();
}

module.exports = {
  createGameRoom,
  setPlayers,
  destroyGameRoom,
}; 