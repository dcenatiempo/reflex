<template>
  <div id="player-list" class="widget">
    <h2>Players</h2>
    <li class="ul-header">
      <span class="name">Name</span>
      <span class="record">Record</span>
      <span class="time">Alive since</span>
    </li>
    <scrollable-ul :watch-data="players" :max-height="100">
      <li v-for="player in players" :key="player.id" :class="{ me: playerId === player.id }">
        <span class="name" :title="player.name">{{player.name}}</span>
        <span class="record">{{playerRecord(player)}}</span>
        <span class="time">{{$moment(player.createdAt._seconds*1000).fromNow()}}</span>
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
  methods: {
    playerRecord(player) {
      return player.wins + '/' + player.gamesPlayed;
    }
  },
  mounted() {},
}
</script>

<style lang="scss">
#player-list {
  display: flex;
  flex-flow: column nowrap;

  li {
    display: grid;
    grid-template-columns: minmax(90px, 150px) 65px minmax(90px, 200px);
    grid-gap: 10px;
    align-items: start;

    &.me {
      color: red;
    }
    &.ul-header {
      font-weight: bold;
      font-size: 1.1rem;
      align-items: end;
    }
    span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .name {
      text-align: left;
    }
    .record {

    }
    .time {
      text-align: left;
    }
  }
}
</style>
