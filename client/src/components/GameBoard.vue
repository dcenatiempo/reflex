<template>
  <div id="game-board" class="relative">
    <button v-if="!startButtonClicked && Object.keys(players).length > 1" class="start-game" @click="startGame">Start Game</button>
    <canvas id="myCanvas"
      :width="board.w"
      :height="board.h"
      v-touch:swipe.left="onSwipeLeft"
      v-touch:swipe.right="onSwipeRight"
      v-touch:swipe.top="onSwipeUp"
      v-touch:swipe.bottom="onSwipeDown"/>
    <div id="timer" v-show="!on && startButtonClicked">
      <div>
      {{countdown}}
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';
import { isEmpty, setVal } from '@/helpers';

const colorMap = {
  red: '#ff5e69',
  blue: '#6bb5ff',
  yellow: '#fcff6a',
  orange: '#ffad69',
  green: '#6bff69',
  purple: '#d29bff',
}

export default {
  name: 'game-board',
  components: {},
  props: {
    mode: {
      type: String,
      default: 'a',
    },
  },
  data() {
    return {
      canvas: null,
      ctx: null,
      board: {
        h: 600,
        w: 1200,
      },
      on: false,
      countdown: 5,
      frame: 0,
      players: {},
      lastOnState: false,
      speed: 1,
      startButtonClicked: false,
    };
  },
  computed: {
    ...mapState(['currentRoom']),
    ...mapGetters(['socket', 'roomPlayers', 'currentUser']),
    xOffset() {
      if (isEmpty(this.players)) return 0;
      return (this.board.w / 2) - this.players[this.currentUser.id].location.x;
    },
    yOffset() {
      if (isEmpty(this.players)) return 0;
      return (this.board.h / 2) - this.players[this.currentUser.id].location.y;
    },
    playerRecords() {
      let vm = this;
      let records = {};
      Object.keys(this.players).forEach( id => {
        records[id] = {
          wins: vm.players[id].wins,
          gamesPlayed: vm.players[id].gamesPlayed,
        };
      });
      return records;
    },
    isPlaying() {
      let currentPlayer = this.players[this.currentUser.id];
      let isAlive = currentPlayer ? currentPlayer.isAlive : false;
      return this.on && isAlive;
    }
  },
  methods: {
    ...mapMutations(['setColors']),
    startGame() {
      this.startButtonClicked = true;
      this.socket.emit('start-game');
    },
    getX(x) {
      return x + this.xOffset;
    },
    getY(y) {
      return y + this.yOffset;
    },
    getPointOffset(prev, next) {
      let p = {
        x: this.getX(next.x),
        y: this.getY(next.y)
      };

      if (null === prev) {
        if (p.x > this.board.w) {
          p.x = p.x - this.board.w;
        } else if (p.x < 0) {
          p.x = p.x + this.board.w;
        }

        if (p.y > this.board.h) {
          p.y = p.y - this.board.h;
        } else if (p.y < 0) {
          p.y = p.y + this.board.h;
        }
        return p;
      }
      
      let p2 = {};
      let p3 = {};

      let a = 'x';
      let b = 'y';
      let m = 'w';
      let n = 'h';

      if (prev.x === p.x) {
        a = 'y';
        b = 'x';
        m = 'h';
        n = 'w';
      }
      
      if (p[a] > this.board[m]) {
        p[a] = p[a] - this.board[m];
        if (prev[a] < this.board[m]) {
          p2[a] = this.board[m];
          p2[b] = p[b];
          p3[a] = 0;
          p3[b] = p[b];
        }
      } else if (p[a] < 0) {
        p[a] = p[a] + this.board[m];
        if (prev[a] > 0) {
          p2[a] = 0;
          p2[b] = p[b];
          p3[a] = this.board[m];
          p3[b] = p[b];
        }         
      } else if (prev[a] > this.board[m]) {
        p2[a] = 0;
        p2[b] = p[b];
        p3[a] = this.board[m];
        p3[b] = p[b];
      } else if (prev[a] < 0) {
        p2[a] = this.board[m];
        p2[b] = p[b];
        p3[a] = 0;
        p3[b] = p[b];
      } 

      if (p[b] > this.board[n]) {
        p[b] = p[b] - this.board[n];
        if (p2[b]) {
          p2[b] = p[b];
          p3[b] = p[b];
        }
      } else if (p[b] < 0) {
        p[b] = p[b] + this.board[n];
        if (p2[b]) {
          p2[b] =p[b];
          p3[b] =p[b];
        }
      }

      if (isEmpty(p2))
        return p;
      else
        return [p2, p3, p];

    },
    drawPathA(p) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = colorMap[p.color];
      let prevPoint = p.location;
      this.ctx.moveTo(prevPoint.x, prevPoint.y);
      for (let i=p.path.length-1; i>=0; i--) {
        if (p.path[i] === null) {
          i--;
          this.ctx.moveTo(p.path[i].x, p.path[i].y);
        }
        let point = p.path[i];
        this.ctx.lineTo(point.x, point.y);
      }
      this.ctx.stroke(); 
    },
    drawPath(p) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = colorMap[p.color];
      let prevPoint = {
        x: this.getX(p.location.x),
        y: this.getY(p.location.y)
      };
      let firstPoint = (this.getPointOffset(null, p.location));

      this.ctx.moveTo(firstPoint.x, firstPoint.y);
      for (let i=p.path.length-1; i>=0; i--) {
        if (p.path[i] === null) {
          prevPoint = null;
          continue;
        }
        let point = this.getPointOffset(prevPoint, p.path[i]);
        if (Array.isArray(point)) {
          this.ctx.lineTo(point[0].x, point[0].y);
          this.ctx.moveTo(point[1].x, point[1].y);
          this.ctx.lineTo(point[2].x, point[2].y);
        } else {
          this.ctx.lineTo(point.x, point.y);
        }
        prevPoint = {
          x: this.getX(p.path[i].x),
          y: this.getY(p.path[i].y)
        };
      }
      this.ctx.stroke(); 
    },
    drawPlayer(p) {
      this.ctx.beginPath();
      let point = 'a' === this.mode ? p.location : this.getPointOffset(null, p.location);
      this.ctx.arc(point.x, point.y, 3, 0, 2*Math.PI, true); //arc(x,y,r,startangle,endangle)
      this.ctx.fillStyle = colorMap[p.color];
      this.ctx.closePath();
      this.ctx.fill();
    },
    drawBoard() {
      if (isEmpty(this.players)) return;
      let vm = this;
      this.ctx.lineWidth = 2;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      let players = Object.keys(this.players);
      
      if ('a' === this.mode) {
        players.forEach( player => {
          vm.drawPathA(vm.players[player]);
          vm.drawPlayer(vm.players[player]);
        });
      } else {
        players.forEach( player => {
          vm.drawPath(vm.players[player]);
          vm.drawPlayer(vm.players[player]);
        });
      }
    },
    nextFrame() {
      this.drawBoard();

      if (this.on === true) {
        window.requestAnimationFrame(this.nextFrame);
      }
    },
    requestMove(e) {
      let map = {
        38: 'u',
        40: 'd',
        37: 'l',
        39: 'r'
      };
      let key = e.keyCode || e.which;
      if (!(key in map)) return;
      let d = this.players[this.currentUser.id].direction;
      // only allow proper change in directions
      if ((map[key] === 'u' || map[key] === 'd') && (d === 'u' || d === 'd')) return;
      if ((map[key] === 'l' || map[key] === 'r') && (d === 'l' || d === 'r')) return;
      this.socket.emit('request-move', map[key]);
    },
    onSwipeLeft() {
      console.log('left')
      this.socket.emit('request-move', 'l');
    },
    onSwipeRight() {
      console.log('right')
      this.socket.emit('request-move', 'r');
    },
    onSwipeUp() {
      console.log('up')
      this.socket.emit('request-move', 'u');
    },
    onSwipeDown() {
      console.log('down')
      this.socket.emit('request-move', 'd');
    },
    handleGameObj(gameObj) {
      if (isEmpty(gameObj)) {
        console.error('Game object is empty!');
        return;
      }
      this.mergeGameObj(gameObj);
      
      if (this.on) {
        if (this.lastOnState) return;

        // if the game just got turned on, start game loop
        this.lastOnState = true;
        window.requestAnimationFrame(this.nextFrame);
        return;
      }
      
      // if the game just got turned off...
      else if (this.lastOnState && !this.on) {
        this.lastOnState = false;
      }

      // only draw the board if we are not currently in a game
      // otherwise, we draw in the game loop
      if (!this.on) {
        this.drawBoard();
      }
    },
    mergeGameObj(gameUpdate) {
      let vm = this;
      // if whole game, replace
      if ('replace' in gameUpdate) {
        this.countdown = gameUpdate.countdown;
        this.on = gameUpdate.on;
        this.frame = gameUpdate.frame;
        this.board = gameUpdate.board;
        this.players = gameUpdate.players;
        this.speed = gameUpdate.speed;
        this.setColors(gameUpdate.board.colors);
      }
      // if partial game, merge
      else {
        for (let key in gameUpdate) {
          setVal(vm, key, gameUpdate[key]);
        }
      }
    },
  },
  watch: {
    isPlaying(val) {
      this.$emit('is-playing', val);
    },
    playerRecords(records) {
      if (Object.keys(records).length <= 1 && this.startButtonClicked === true)
        this.startButtonClicked = false;
      this.$emit('records-updated', records);
    },
    countdown(val) {
      if (val !== 5)
        this.startButtonClicked = true;
    },
  },
  created() {
    window.addEventListener('keydown', this.requestMove);
  },
  mounted() {
    this.canvas = document.getElementById('myCanvas');
    this.ctx = this.canvas.getContext("2d");

    // Request info
    this.socket.emit('request-game-object');

    // Listeners
    this.socket.on('game-object', this.handleGameObj);
  },
  destroyed() {
    window.removeEventListener('keydown', this.requestMove);
    this.socket.removeListener('game-object', this.handleGameObj);
  }
}
</script>

<style lang="scss">
#game-board{
  .start-game {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: black;
    border: 2px solid rgba(255, 166, 0, 0.5);
    border-radius: 5px;
    color: rgba(255, 166, 0, 0.5);
    font-size: 2rem;
    padding: 1rem;
    z-index: 99;
  }
  #myCanvas {
    border:2px solid #000000;
    background: black;
  }
  #timer {
    font-family: 'ZCOOL QingKe HuangYou', monospace;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    
    // background: rgba(35, 45, 101, 0.38);
     div {
      font-size: 5em;
      color: lightyellow;
     }
  }
}
</style>
