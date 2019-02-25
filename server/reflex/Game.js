const gameloop = require('node-gameloop');

const Player = require('./Player');
const { arrayDif } = require('../bin/helpers');
const { emit } = require('../io/events');

let io;

const init = function(ioServer) {
  io = ioServer;
}

const Game = function(roomName, playerIds) {
  this.room = roomName;
  this.id; // gameloop id
  this.countdown = 5;
  
  this.players = {};
  this.toRemovePlayers = [];
  this.toAddPlayers = [];

  this.on = false;
  this.frame = 0;
  this.currentPlaying = 0;
  this.currentDead = 0;
  // this.pause = false;
  this.speed = 1;
  // this.numDead = 0;
  this.board = {
    w: 600,
    h: 300,
  }

  playerIds.forEach(id => this.players[id] = new Player(id, this.board));

  this.setPlayers = (newPlayersIds) => {
    const currentPlayersIds = Object.keys(this.players);
    const toAdd = arrayDif(newPlayersIds, currentPlayersIds);
    const toRemove = arrayDif(currentPlayersIds, newPlayersIds);

    if (true === this.on) {
      // if a game is in progress, add/remove from queues
      // these queues will be emptied between games.
      toAdd.forEach(id => this.toAddPlayers.push(new Player(id, this.dimensios)));
      toRemove.forEach(id =>this.toRemovePlayers.push(new Player(id, this.board)));
    }
    else {
      // if a game hasn't started yet, add/remove directly
      toAdd.forEach(id => this.players[id] = new Player(id, this.board));
      toRemove.forEach(id => delete this.players[id]);
    }
  };

  this.emptyPlayerQueues = () => {
    this.toRemovePlayers.forEach(player => delete this.players[player.id]);
    this.toAddPlayers.forEach(player => this.players[player.id] = player);

    this.toRemovePlayers = [];
    this.toAddPlayers = [];
  };

  this.doCountdown = () => {
    console.log(this.countdown)
    
    let that = this;
    setTimeout(() => {
      that.countdown--;

      if (0 === that.countdown) {
        that.start();
      }
      else {
        that.doCountdown();
      }
    }, 1000);
  };

  this.start = () => {
    const game = this;
    
    this.on = true;
    this.currentPlaying = Object.keys(this.players).length;

    this.id = gameloop.setGameLoop(function(delta) {
        // `delta` is the delta time from the last frame
        game.updateGame(game.frame, delta);
        game.frame++;
        console.log(game.frame)
    }, 1000 / 60);
  };

  this.stop = () => {
    gameloop.clearGameLoop(this.id);
  };
  

  this.resetGame = () => {
    this.stop();
    this.on = false;
    this.frame = 0;
    this.currentPlaying = 0;
    this.currentDead = 0;
    this.countdown = 5;
    this.doCountdown();
  };

  this.updateGame = (frame, delta) => {
    this.movePlayers();
    this.checkCollisions();
    this.maybeEndGame();
    io.to(roomName).emit(emit.GAME_OBJECT, this);
  };

  this.maybeEndGame = () => {
    let game = this;
    // Is there a winner?
    if (this.currentDead < this.currentPlaying -1)
      return; // No, keep playing... 

    // Yes, Game Over!
    Object.keys(this.players).forEach(player => {
      if (!game.players[player].isAlive) {
        game.players[player].resetLoser();
        return;
      }
      game.players[player].resetWinner();;
    });
    this.resetGame();
  };

  this.checkCollisions = () => {

  };

  this.movePlayers = () => {
    let game = this;
    Object.keys(this.players).forEach(player => {
      game.players[player].movePlayer(game.board, game.speed);
    });
  };

  this.requestPlayerMove = (playerId, direction) => {
    this.players[playerId].requestDirectionChange(direction, this.frame);
  }
}

module.exports = { Game, init };