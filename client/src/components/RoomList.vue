<template>
  <div id="room-list" class="widget">
    <h2>Rooms</h2>
    <li class="ul-header">
      <span class="name">Name</span>
      <span class="count">Players</span>
    </li>
    <scrollable-ul :watch-data="rooms" :max-height="400">
      <li v-for="room in rooms" :key="room">
        <span class="name">{{room.name}}</span>
        <span class="count">{{room.playerCount}}/8</span>
        <button>Join Room</button>
      </li>
    </scrollable-ul>
    <button-input
      @submit="handleSubmit"
      @input="handleInput"
      placeholder="Enter room name..."
      :buttonText="buttonText"
      :max-length="24"/>
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
    };
  },
  computed: {
    ...mapState(['socket', 'rooms']),
  },
  watch: {},
  methods: {
    ...mapActions(['joinRoom']),
    roomExistsAlready(newRoom, rooms) {
      return rooms.find(room => newRoom.toLowerCase() === room.name.toLowerCase());
    },
    handleSubmit(newRoom) {
      debugger
      let room = this.roomExistsAlready(newRoom, this.rooms)
      room = room ? room.name : newRoom;
      this.joinRoom(room);
    },
    handleInput(newRoom) {
      this.buttonText = this.roomExistsAlready(newRoom, this.rooms) ? 'Join Room' : 'Create Room';
    },
  },
  mounted() {},
}
</script>

<style lang="scss">
#room-list {
  li {
    display: grid;
    grid-template-columns: minmax(90px, 150px) 65px minmax(70px, 120px);
    grid-gap: 10px;
    align-items: start;

    &.ul-header {
      font-weight: bold;
      font-size: 1.1rem;
      align-items: end;
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
