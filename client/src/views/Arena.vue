<template>
  <div class="arena">
    <h1>This is the arena</h1>
    <player-list />
    <room-list />
    <chat-widget :messages="arenaChat" />
    The arena page will have:
    <ul>
      <li>General chat for all users</li>
      <li>List of rooms with # of players in each room</li>
      <li>Ability Join a room</li>
      <li>Ability to Create a new room</li>
    </ul>
  </div>
</template>

<script>
// @ is an alias to /src
// import NewPlayerInpu from '@/components/HelloWorld.vue'
import { mapState, mapMutations } from 'vuex';
import PlayerList from '@/components/PlayerList';
import RoomList from '@/components/RoomList';
import ChatWidget from '@/components/ChatWidget';

export default {
  name: 'home',
  components: {
    PlayerList,
    RoomList,
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
    ...mapMutations(['updateRoomList', 'addArenaChat']),
    submitPlayerName() {
      this.socket.emit('new-player', this.name);
    },
  },
  mounted() {
    if (!this.playerId)
      this.$router.push({ path: '/' });

    if(this.currentRoom)
      this.$router.push({ path: `/arena/room/${this.currentRoom}` });

    this.socket.emit('request-rooms');

    this.socket.on('rooms-update', (roomList) => {
      console.log(roomList);
      this.updateRoomList(roomList);
    });

    this.socket.on('update-arena-chat', message => {
      debugger
      this.addArenaChat(message);
    });
  
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
#arena {
}
</style>
