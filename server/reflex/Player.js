const Player = function(id) {
  console.log(`A player for ${id} was created`);
  this.id = id; // firebase id
  this.location = { x: 0, y: 0 };
  this.direction = 'l'; //(l)eft, (r)ight, (u)p, (d)own
  this.path = [];
  this.inCurrentGame = false;
  this.alive = true;
  this.points = 0;
  this.color = 'blue'
}

module.exports = Player;
