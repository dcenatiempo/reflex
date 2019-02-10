<template>
  <div id="player-list">
    <h2>Players</h2>
    <ul>
      <li v-for="player in players" :key="player._id">
        <span :class="{ me: playerId === player._id }">{{player.name}}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'player-list',
  props: {},
  data() {
    return {};
  },
  computed: {
    ...mapState(['players', 'playerId']),
  },
  watch: {},
  methods: {},
  mounted() {},
}
</script>

<style lang="scss">
#player-list {
  border: 1px solid lightgray;
  .me {
    color: red;
  }
}
</style>
