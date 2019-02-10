<template>
  <div id="room-list">
    <h2>Rooms</h2>
    <ul>
      <li v-for="room in rooms" :key="room">
        <span>{{room}}</span>
      </li>
    </ul>
    <input v-model="newRoom" type="text" placeholder="Enter Room Name" />
    <button @click="createRoom">Create New Room</button>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
export default {
  name: 'room-list',
  props: {},
  data() {
    return {
      newRoom: ''
    };
  },
  computed: {
    ...mapState(['socket', 'rooms']),
  },
  watch: {},
  methods: {
    ...mapMutations(['setRoom']),
    createRoom() {
      this.socket.emit('enter-room', this.newRoom);
      this.setRoom(this.newRoom);
    }
  },
  mounted() {},
}
</script>

<style lang="scss">
#room-list {
  border: 1px solid lightgray;
}
</style>
