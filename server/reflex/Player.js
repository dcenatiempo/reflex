
const { randomInt } = require('../bin/helpers');

const getRandomColor = function(colors) {
  let availableColors = Object.keys(colors).filter(color => null === colors[color]);
  return availableColors[randomInt(0, availableColors.length)];
};

const Player = function(id, board) {
  console.log(`A player for ${id} was created`);
  let x = randomInt(10, board.w - 10);
  let y = randomInt(10, board.h - 10);
  this.id = id;
  this.location = { x, y };
  this.direction = 'l'; //(l)eft, (r)ight, (u)p, (d)own
  this.path = [{ x, y }];
  this.isAlive = true;
  this.wins = 0;
  this.gamesPlayed = 0;
  this.color = getRandomColor(board.colors);
  this.lastFrame = 0;

  this.requestDirectionChange = function(direction, frame) {
    if (!this.isAlive) return false; // player must be alive
    if (direction === this.direction) return false; // ignore same direction

    this.direction = direction;
    if (frame > this.lastFrame) {
      this.lastFrame = frame;
      this.path.push({ x: this.location.x, y: this.location.y });
    }
    return true;
  };

  this.movePlayer = function(board, speed, callback) {
    if (!this.isAlive) return;

    if ('l' === this.direction) {
      this.location.x -= speed;
    } else if ('r' === this.direction) {
      this.location.x += speed;
    } else if ('u' === this.direction) {
      this.location.y -= speed;
    } else { // if ('d' === this.direction)
      this.location.y += speed;
    }

    if (this.location.x > board.w) {
      this.path.push({ x: board.w, y: this.location.y });
      this.path.push(null);
      this.location.x -= board.w;
      this.path.push({ x: 0, y: this.location.y });
    }
    else if (this.location.x < 0) {
      this.path.push({ x: 0, y: this.location.y });
      this.path.push(null);
      this.location.x += board.w;
      this.path.push({ x: board.w, y: this.location.y });
    }
    else if (this.location.y > board.h) {
      this.path.push({ x: this.location.x, y: board.h });
      this.path.push(null);
      this.location.y -= board.h;
      this.path.push({ x: this.location.x, y: 0 });
    }
    else if (this.location.y < 0) {
      this.path.push({ x: this.location.x, y: 0 });
      this.path.push(null);
      this.location.y += board.h;
      this.path.push({ x: this.location.x, y: board.h });
    } else {
      return
    }
    callback(this.id)
  }

  this.resetPlayer = function( outcome ) {
    this.isAlive = true;
    if ('won' === outcome) this.wins++;
    this.gamesPlayed++;
    this.lastFrame = 0;
  }

  this.resetPaths = function() {
    this.path = [{ x: this.location.x, y: this.location.y }];
  };

}

module.exports = Player;
