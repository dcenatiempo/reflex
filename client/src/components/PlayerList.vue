<template>
  <div id="player-list" class="widget">
    <h2>Players</h2>
    <scrollable-ul :watch-data="players" :max-height="100">
      <li v-for="player in players" :key="player._id" :class="{ me: playerId === player._id }">
        <span>{{player.name}}</span>
        <span>{{player.wins}}</span>
        <span>{{player.gamesPlayed}}</span>
        <span>{{player.createdAt}}</span>
      </li>
    </scrollable-ul>
  </div>
</template>

<script>
// import { mapState } from 'vuex';
import ScrollableUl from './ScrollableUL';

export default {
  name: 'player-list',
  components: {
    ScrollableUl,
  },
  data() {
    return {};
  },
  props: {
    players: {
      type: Array,
      default: () => []
    },
    playerId: {
      type: String,
      default: ''
    },
  },
  computed: {},
  watch: {},
  methods: {},
  mounted() {},
}
</script>

<style lang="scss">
#player-list {
  .me {
    color: red;
  }
}
</style>
