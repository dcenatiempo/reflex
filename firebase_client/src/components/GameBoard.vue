<template>
  <div id="game-board" class="widget">
    <h2>Game Board</h2>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import SocketMixin from '@/mixins/SocketMixin.js';

export default {
  name: 'game-board',
  mixins: [SocketMixin],
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
  },
}
</script>

<style lang="scss">
#game-board {
  grid-area: game-board;
}

</style>
