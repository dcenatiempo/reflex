<template>
  <div class="room">
    <h1>Welcom to {{currentRoom}}</h1>
    <button @click="leaveRoom">Leave Room</button>
    The room page will have:
    <ul>
      <li>Chat for all users in the room</li>
      <li>List of players in the room</li>
      <li>Ability leave the room</li>
      <li>Ability to Create a new room</li>
      <li>Game board</li>
    </ul>
  </div>
</template>

<script>
// @ is an alias to /src
// import NewPlayerInpu from '@/components/HelloWorld.vue'
import { mapState, mapMutations } from 'vuex';
import PlayerList from '@/components/PlayerList';
// import RoomList from '@/components/RoomList';
import ChatWidget from '@/components/ChatWidget';

export default {
  name: 'home',
  components: {
    PlayerList,
    // RoomList,
    ChatWidget
  },
  data() {
    return {
      name: '',
    }
  },
  computed: {
    ...mapState(['socket', 'players', 'playerId', 'currentRoom', 'arenaChat']),
  },
  methods: {
    ...mapMutations(['updateRoomList', 'addArenaChat', 'setRoom']),
    leaveRoom() {
      this.socket.emit('leave-room', this.currentRoom);
      this.setRoom(null);
      this.$router.push({ path: `/arena` });
    },
  },
  mounted() {
    if (!this.playerId)
      this.$router.push({ path: '/' });

    if(this.currentRoom)
      this.$router.push({ path: `/arena/room/${this.currentRoom}` });

    // this.socket.emit('request-rooms');

    // this.socket.on('rooms-update', (roomList) => {
    //   console.log(roomList);
    //   this.updateRoomList(roomList);
    // });

    // this.socket.on('update-room-chat', message => {
    //   this.addArenaChat(message);
    // });
  
  },
  watch: {
    playerId(id) {
      if (!id) this.$router.push('home');
    },
    currentRoom(room) {
      if (!room) return;
      this.$router.push({ path: `/arena/room/${this.currentRoom}` });
    }
  },
}
</script>

<style lang="scss">
#room {
}
</style>
