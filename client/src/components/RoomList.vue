<template>
  <div id="room-list">
    <h2>Rooms</h2>
    <ul>
      <li v-for="room in rooms" :key="room">
        <span>{{room}}</span>
      </li>
    </ul>
    <input v-model="newRoom" type="text" placeholder="Enter Room Name" />
    <button @click="joinRoom(newRoom)">Create New Room</button>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex';
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
    ...mapActions(['joinRoom']),
  },
  mounted() {},
}
</script>

<style lang="scss">
#room-list {
  border: 1px solid lightgray;
}
</style>
