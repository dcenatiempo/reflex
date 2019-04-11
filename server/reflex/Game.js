const gameloop = require('node-gameloop');

const Player = require('./Player');
const { arrayDif } = require('../bin/helpers');
const { emit } = require('../io/events');

let io;

const injectIo = function(ioServer) {
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
    w: 1200,
    h: 600,
    colors: {
      red: null,
      blue: null,
      yellow: null,
      orange: null,
      green: null,
      purple: null,
    }
  };

  // this is the object to be sent each frame. It will represent only the changes from last frame
  this.frameChanges = {};

  playerIds.forEach(id => {
    this.players[id] = new Player(id, this.board);
    this.board.colors[this.players[id].color] = id;
  });

  this.setPlayers = (newPlayersIds, mode = 'set') => {
    newPlayersIds = 'string' === typeof newPlayersIds ? [newPlayersIds] : newPlayersIds;
    let toAdd = [];
    let toRemove = [];

    if ('set' === mode) {
      let currentPlayersIds = Object.keys(this.players);
      toAdd = arrayDif(newPlayersIds, currentPlayersIds);
      toRemove = arrayDif(currentPlayersIds, newPlayersIds);
    } else if ('add' === mode) {
      toAdd = newPlayersIds;
    } else if ('remove' === mode) {
      toRemove = newPlayersIds;
    }

    if (true === this.on) {
      // if a game is in progress, add/remove from queues
      // these queues will be emptied between games.
      toAdd.forEach(id => {
        if (this.toRemovePlayers.includes(id)) {
          this.toRemovePlayers = this.toRemovePlayers.filter(item => item != id);
        } else {
          this.toAddPlayers.push(id)
        }
      });
      toRemove.forEach(id => {
        if (this.toAddPlayers.includes(id)) {
          this.toAddPlayers = this.toAddPlayers.filter(item => item != id);
        } else {
          this.toRemovePlayers.push(id);
        }          
      });
    }
    else {
      // if a game hasn't started yet, add/remove directly
      toAdd.forEach(id => {
        this.players[id] = new Player(id, this.board);
        this.board.colors[this.players[id].color] = id;
      });
      toRemove.forEach(id => {
        this.board.colors[this.players[id].color] = null;
        delete this.players[id];
      });
    }
    return Promise.resolve(this.players);
  };

  this.addPlayers = (playersIds) => {
    return this.setPlayers(playersIds, 'add');
  };

  this.removePlayers = (playersIds) => {
    return this.setPlayers(playersIds, 'remove');
  };

  this.emptyPlayerQueues = () => {
    if (!this.shouldEmptyQueue()) return;
    console.log('emptying player queue');
    this.toRemovePlayers.forEach(id => {
      this.board.colors[this.players[id].color] = null;
      delete this.players[id];
    });
    this.toAddPlayers.forEach(id => {
      this.players[id] = new Player(id, this.board);
      this.board.colors[this.players[id].color] = id;
    });

    this.toRemovePlayers = [];
    this.toAddPlayers = [];
    io.sockets.emit(emit.UPDATE_ROOM_LIST, this.reflex.getRoomList());
  };

  this.shouldEmptyQueue = () => {
    return (this.toRemovePlayers.length > 0) || (this.toAddPlayers.length > 0);
  }

  this.doCountdown = () => {
    // console.log(this.countdown)
    
    let that = this;
    setTimeout(() => {
      that.countdown--;
      this.emptyPlayerQueues();
      if (Object.keys(this.players).length == 0) {
        // console.log('room empty')
        this.reflex.destroyGameRoom(this.room);
        return;
      }
      if (Object.keys(this.players).length <= 1) {
        // console.log('not enough players')
        that.countdown = 5;
        io.to(roomName).emit(emit.GAME_OBJECT, { countdown: that.countdown});
        that.doCountdown();
        return;
      } else if (0 === that.countdown) {
        that.start();
      } else if (2 === that.countdown) {
        Object.keys(this.players).forEach(player => {
          this.players[player].resetPaths();
        });
        io.to(roomName).emit(emit.GAME_OBJECT, this.getGameObjectForClient());
        that.doCountdown();
      } else {
        io.to(roomName).emit(emit.GAME_OBJECT, { countdown: that.countdown});
        that.doCountdown();
      }
    }, 1000);
  };

  this.start = () => {
    const game = this;
    
    this.on = true;
    this.currentPlaying = Object.keys(this.players).length;
    io.to(roomName).emit(emit.GAME_OBJECT, this.getGameObjectForClient());
    this.id = gameloop.setGameLoop(function(delta) {
        // `delta` is the delta time from the last frame
        game.updateGame(game.frame, delta);
        game.frame++;
        // console.log(game.frame)
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
    io.to(roomName).emit(emit.GAME_OBJECT, this.getGameObjectForClient());
    this.doCountdown();
  };

  this.updateGame = (frame, delta) => {
    this.movePlayers();
    Object.keys(this.players).forEach(pid => {
      if (!this.players[pid].isAlive) return;
      if (this.checkCollision(this.players, pid)) {
        console.log('player ' + pid + ' died on frame: ' + frame)
        this.killPlayer(pid, frame);
      }
    });
    this.maybeEndGame();
    
    if (Object.keys(this.frameChanges).length > 0) {
      this.frameChanges.frame = frame;
      io.to(roomName).emit(emit.GAME_OBJECT, this.frameChanges);
      this.frameChanges = {};
    }
  };

  this.maybeEndGame = () => {
    let game = this;
    // Is there a winner?
    if (this.currentDead < this.currentPlaying -1)
      return; // No, keep playing... 
    console.log('Game Over')
    // Yes, Game Over!
    Object.keys(this.players).forEach(playerId => {
      if (!game.players[playerId].isAlive) {
        game.players[playerId].resetPlayer('lost');
        return;
      }
      game.players[playerId].resetPlayer('won');
    });
    this.resetGame();
  };

  this.checkCollision = (players, pid) => {
    const me = players[pid].location;
    return Object.keys(players).some(player => {
      return players[player].path.some((p0, i, array) => {
        // dont check on null paths where player wrapped screen
        if ((p0 === null) || ((i <= (array.length - 1)) && (array[i+1] === null))) return false;
        // dont compare players current path (last item in path array && current location)
        if (player === pid && (i === array.length-1)) return;

        let p1 = {};
        if (i === (array.length - 1)) {
          p1.x = players[player].location.x
          p1.y = players[player].location.y
        } else {
          p1.x = array[i+1].x;
          p1.y = array[i+1].y
        }

        let a = 'y';
        let b = 'x';
        if (p0.x === p1.x) { // vertical
          a = 'x';
          b = 'y';
        } // else horizontal

        // is the point on the same axis as the path?  
        if (me[a] == p0[a]) {
            // is the point between the two endpoints of path?            
            if (((p0[b] >= me[b]) || (p1[b] >= me[b])) && !((p0[b] >= me[b]) && (p1[b] >= me[b]))) { //  XOR: ( foo || bar ) && !( foo && bar )
              return true;
            }
          }
        return false;
      });
    });
  };

  this.addPathToFrameChanges = (pid) => {
    this.frameChanges[`players.${pid}.path`] = this.players[pid].path;
  };

  this.movePlayers = () => {
    let game = this;
    Object.keys(this.players).forEach(pid => {
      game.players[pid].movePlayer(game.board, game.speed, game.addPathToFrameChanges);
      this.frameChanges[`players.${pid}.location`] = this.players[pid].location;
    });
  };

  this.requestPlayerMove = (pid, direction) => {
    if (this.players[pid].requestDirectionChange(direction, this.frame)) {
      this.frameChanges[`players.${pid}.direction`] = this.players[pid].direction;
      this.frameChanges[`players.${pid}.path`] = this.players[pid].path;
    }
  };

  this.killPlayer = function(pid, frame) {
    this.players[pid].isAlive = false;
    this.frameChanges[`players.${pid}.isAlive`] = false;
    this.currentDead++;
  };

  this.getGameObjectForClient = () => {
    return {
      replace: true,
      on: this.on,
      frame: this.frame,
      board: this.board,
      countdown: this.countdown,
      players: this.players,
      speed: this.speed,
      // room: this.room,
      // toRemovePlayers = this.toRemovePlayers,
      // toAddPlayers = this.toAddPlayers,
      // currentPlaying: this.currentPlaying,
      // currentDead: this.currentDead,
      // pause: this.pause,
      // this.numDead = 0;
    }
  };
}

module.exports = { Game, injectIo };