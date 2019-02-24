const { randomInt } = require('../bin/helpers');

const Player = function(id, dimensions) {
  console.log(`A player for ${id} was created`);
  let x = randomInt(10, dimensions.x - 10);
  let y = randomInt(10, dimensions.y - 10);
  this.id = id; // firebase id
  this.location = { x, y };
  this.direction = 'l'; //(l)eft, (r)ight, (u)p, (d)own
  this.path = [{ x, y }];
  this.inCurrentGame = false;
  this.alive = true;
  this.points = 0;
  this.color = 'blue'
}

module.exports = Player;
