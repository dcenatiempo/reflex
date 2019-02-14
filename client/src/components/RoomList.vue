<template>
  <div id="room-list" class="widget">
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
import { mapState, mapActions } from 'vuex';
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

}
</style>
