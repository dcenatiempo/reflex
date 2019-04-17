<template>
  <div id="player-list" class="widget"  :class="colorMode">
    <h2 v-show="'' === colorMode">Players</h2>
    <li class="ul-header">
      <span class="name">Name</span>
      <template v-if="Object.keys(records).length > 0">
        <span class="record">Record</span>
        <!-- <span class="time">Alive since</span> -->
      </template>
    </li>
    <scrollable-ul :watch-data="players" :max-height="100">
      <li v-for="player in orderedPlayers" :key="player.id" :class="{ me: playerId === player.id }" :style="colors ? `color: ${colorMap[colors[player.id]]}` : ''">
        <span class="name" :title="player.name">{{player.name}}</span>
        <template v-if="Object.keys(records).length > 0">
          <span class="record">{{playerRecord(player)}}</span>
          <!-- <span class="time">{{$moment(player.createdAt._seconds*1000).fromNow()}}</span> -->
        </template>
      </li>
    </scrollable-ul>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { isEmpty } from '@/helpers';
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
    playerId: {
      type: String,
      default: '',
    },
    players: {
      type: Object,
      default: () => ({}),
    },
    records: {
      type: Object,
      default: () => ({}),
    },
    colors: {
      type: Object,
    },
    colorMode: {
      type: String,
      default: '',
    }
  },
  computed: {
    ...mapGetters(['colorMap']),
    orderedPlayers() {
      let players = Object.keys(this.players).map(id => {
        return {
          name: this.players[id],
          gamesPlayed: this.records[id] && this.records[id].gamesPlayed,
          wins: this.records[id] && this.records[id].wins,
          id: id,
        }
      });
      if (isEmpty(this.records))
        return players;
      return players.sort(((a,b) => b.wins - a.wins));
    }
  },
  watch: {},
  methods: {
    playerRecord(player) {
      if (undefined === player.wins) return '';
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
    grid-template-columns: minmax(80px, 140px) 60px;// minmax(80px, 190px);
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

  &.dark {
    flex-basis: 140px;
  }
}
</style>
