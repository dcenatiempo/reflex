const gameloop = require('node-gameloop');

const Player = require('./Player');
const { arrayDif } = require('../bin/helpers');

const Game = function(roomName, playerIds) {
  this.room = roomName;
  this.id; // gameloop id
  
  this.players = {};
  this.toRemovePlayers = [];
  this.toAddPlayers = [];
  
  playerIds.forEach(id => this.players[id] = new Player(id));

  this.on = false;
  // this.pause = false;
  this.speed = 1;
  // this.numDead = 0;

  this.setPlayers = (newPlayersIds) => {
    const currentPlayersIds = Object.keys(this.players);
    const toAdd = arrayDif(newPlayersIds, currentPlayersIds);
    const toRemove = arrayDif(currentPlayersIds, newPlayersIds);

    if (true === this.on) {
      // if a game is in progress, add/remove from queues
      // these queues will be emptied between games.
      toAdd.forEach(id => this.toAddPlayers.push(new Player(id)));
      toRemove.forEach(id =>this.toRemovePlayers.push(new Player(id)));
    }
    else {
      // if a game hasn't started yet, add/remove directly
      toAdd.forEach(id => this.players[id] = new Player(id));
      toRemove.forEach(id => delete this.players[id]);
    }
  };

  this.emptyPlayerQueues = () => {
    this.toRemovePlayers.forEach(player => delete this.players[player.id]);

    this.toAddPlayers.forEach(player => this.players[player.id] = player);

    this.toRemovePlayers = [];
    this.toAddPlayers = [];
  };

  this.start = () => {
    this.on = true;
    let frame = 0;
    this.id = gameloop.setGameLoop(function(delta) {
        // `delta` is the delta time from the last frame
        this.updateGame(frame, delta);
        frame++;
    }, 1000 / 60);
  };

  this.stop = () => {
    this.on = false;
    gameloop.clearGameLoop(this.id);
  };
  

  this.resetGame = () => {
    this.on = false;
    // this.pause = false;

  };

  this.updateGame = (frame, delta) => {
    // check collisions for each player
    // is game over?
    // no:
    //   lock players that are dead
    //   move players that are alive
    // yes:
    //   credit winner
    //   reset game
  };

  this.checkCollisions = () => {

  };

  this.movePlayer = () => {

  };
}

module.exports = Game;