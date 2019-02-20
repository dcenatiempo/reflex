<template>
  <div id="game-board" class="widget">
    <h2>Game Board</h2>
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
    return {};
  },
  computed: {
    ...mapState(['currentRoom', 'currentUser']),
    ...mapGetters(['roomPlayers']),
  },
  watch: {},
  methods: {},
  mounted() {
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    var board = {
      w: 1200,
      h: 600
    };
  },
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
