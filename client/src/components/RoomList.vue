<template>
  <div id="room-list" class="widget">
    <h2>Rooms</h2>
    <li class="ul-header">
      <span class="name">Name</span>
      <span class="count">Players</span>
    </li>
    <scrollable-ul :watch-data="rooms" :max-height="400">
      <li v-for="room in rooms" :key="room.name">
        <span class="name">{{room.name}}</span>
        <span class="count">{{room.players.length}}/{{MAX_PLAYERS}}</span>
        <button class="btn" @click="requestJoinRoom(room.name)" :disabled="room.players.length >= MAX_PLAYERS">{{room.players.length >= MAX_PLAYERS ? 'Room Full' : 'Join Room'}}</button>
      </li>
    </scrollable-ul>
    <button-input
      @submit="handleSubmit"
      @input="handleInput"
      placeholder="Enter room name..."
      :buttonText="buttonText"
      :max-length="24"
      :disabled="disabled"/>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import ScrollableUl from './ScrollableUL';
import ButtonInput from './ButtonInput';

export default {
  name: 'room-list',
  components: {
    ScrollableUl,
    ButtonInput,
  },
  props: {},
  data() {
    return {
      buttonText: 'Create Room',
      MAX_PLAYERS: 8,
      disabled: false,
    };
  },
  computed: {
    ...mapState(['rooms']),
  },
  watch: {},
  methods: {
    ...mapActions(['requestJoinRoom']),
    roomExistsAlready(newRoom, rooms) {
      return rooms.find(room => newRoom.toLowerCase() === room.name.toLowerCase());
    },
    handleSubmit(newRoom) {
      let room = this.roomExistsAlready(newRoom, this.rooms)
      room = room ? room.name : newRoom;
      this.requestJoinRoom(room);
    },
    handleInput(newRoom) {
      this.disabled = newRoom.toLowerCase() === 'arena';
      this.buttonText = this.roomExistsAlready(newRoom, this.rooms) ? 'Join Room' : 'Create Room';
    },
  },
  mounted() {},
}
</script>

<style lang="scss">
#room-list {
  grid-area: room-list;
  display: flex;
  flex-flow: column nowrap;

  li {
    display: grid;
    grid-template-columns: minmax(80px, 140px) 60px minmax(80px, 190px);
    grid-gap: .5px;
    padding-bottom: .5rem;
    align-items: center;

    &.ul-header {
      font-weight: bold;
      font-size: 1.1rem;
      align-items: end;
    }
    button {
      border: none;
      color: white;
      background: #ffb412;
      &[disabled] {
        background: #dadada;
      }
    }
    span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: left;

      &.count {
        text-align: center;
      }
    }
  }
}
</style>
