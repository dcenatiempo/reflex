<template>
  <div id="game-board" class="widget">
    <h2>Game Board</h2><button @click="requestMove">requestMove</button>
    <canvas id="myCanvas" width="1200" height="600" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
// import SocketMixin from '@/mixins/SocketMixin.js';

export default {
  name: 'game-board',
  // mixins: [SocketMixin],
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
    requestMove() {
      this.socket.emit('request-move', {foo: 'bar'});
    },
    drawScreen() {
      let vm = this;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      Object.keys(this.players).forEach( player => {
        vm.drawPath(player);
        vm.drawPlayer(player);
      })
    },
    drawPath(p) {
      if (p.location.x === p.path[0,0] && p.location.y === p.path[0,1])
        return;
      this.ctx.beginPath();
      this.ctx.strokeStyle = p.color;
      this.ctx.moveTo(p.location[0], p.location[1]);
      for (let i=p.path.length-1; i>=0; i--) {
        if (p.path[i][0] === null) {
          i--;
          this.ctx.moveTo(p.path[i][0], p.path[i][1])
        }
        else {
          this.ctx.lineTo(p.path[i][0], p.path[i][1]);
        }
      }
      this.ctx.stroke(); 
    },
    drawPlayer(player) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = p.color;
      this.ctx.arc(p.location.x, p.location.y, 3, 0, 2*Math.PI); //arc(x,y,r,startangle,endangle)
      this.ctx.stroke();
    },
    frame() {
      this.drawScreen();
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
    }
  },
  created() {
    window.addEventListener('keydown', this.requestMove);
  },
  mounted() {
    let vm = this;
    this.canvas = document.getElementById("myCanvas");
    this.ctx = this.canvas.getContext("2d");
    requestAnimationFrame(this.frame);
    
    this.socket.on('game-object', game => {
      debugger
      vm.game = game;
    })
  },
  destroyed() {
    window.removeEventListener('keydown', this.requestMove);
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
