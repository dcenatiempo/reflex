<template>
  <div id="game-board" class="widget">
    <h2>Game Board</h2><button @click="startGame">Start Game</button>
    <canvas id="myCanvas"
      :width="game.board ? game.board.w : board.w"
      :height="game.board ? game.board.h : board.h" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { isEmpty } from '@/helpers';

export default {
  name: 'game-board',
  components: {},
  props: {
  },
  data() {
    return {
      canvas: null,
      ctx: null,
      board: {
        h: 600,
        w: 1200,
      },
      game: {},
      players: {}
    };
  },
  computed: {
    ...mapState(['currentRoom', 'currentUser']),
    ...mapGetters(['socket', 'roomPlayers']),
  },
  watch: {},
  methods: {
    startGame() {
      this.socket.emit('start-game');
    },
    drawBoard(game) {
      if (isEmpty(game)) return;
      
      let vm = this;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      Object.keys(game.players).forEach( player => {
        vm.drawPath(game.players[player]);
        vm.drawPlayer(game.players[player]);
      })
    },
    drawPath(p) {
      debugger
      if (p.location.x === p.path[0].x && p.location.y === p.path[0].y)
        return;
      this.ctx.beginPath();
      this.ctx.strokeStyle = p.color;
      this.ctx.moveTo(p.location.x, p.location.y);
      for (let i=p.path.length-1; i>=0; i--) {
        if (p.path[i] === null) {
          i--;
          this.ctx.moveTo(p.path[i].x, p.path[i].y)
        }
        else {
          this.ctx.lineTo(p.path[i].x, p.path[i].y);
        }
      }
      this.ctx.stroke(); 
    },
    drawPlayer(p) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = p.color;
      this.ctx.arc(p.location.x, p.location.y, 3, 0, 2*Math.PI); //arc(x,y,r,startangle,endangle)
      this.ctx.stroke();
    },
    frame() {
      this.drawBoard(this.game);
      if (this.game.on === true) {
        window.requestAnimationFrame(frame);
      }
    },
    requestMove(e) {
      let map = {
        38: 'u',
        40: 'd',
        37: 'l',
        39: 'r'
      };
      let kp = e.keyCode || e.which;
      if (kp in map)
        this.socket.emit('request-move', map[kp]);
    },
    handleGameObj(game) {
      console.log('game object received')
      this.game = game;
      this.drawBoard(game);
    }
  },
  created() {
    window.addEventListener('keydown', this.requestMove);
  },
  mounted() {
    console.log('gameroom mounted')
    let vm = this;
    this.canvas = document.getElementById("myCanvas");
    this.ctx = this.canvas.getContext("2d");

    // Request info
    this.socket.emit('request-game-object');

    // Listeners
    this.socket.on('game-object', this.handleGameObj);
  },
  destroyed() {
    console.log('gameroom destroyed')
    window.removeEventListener('keydown', this.requestMove);
    this.socket.removeListener('game-object', this.handleGameObj);
  }
}
</script>

<style lang="scss">
#game-board {
  grid-area: game-board;

  #myCanvas {
  border:2px solid #000000;
}
}

</style>
