<template>
  <div class="room">
    <h1>Welcom to {{currentRoom}}</h1>
    <button @click="leaveRoom(currentRoom)">Leave Room</button>
    <player-list
      :players="roomPlayers"
      :playerId="playerId"/>
    <chat-widget
      :messages="roomChat"
      :playerId="playerId"
      mode="room"/>
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
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
import PlayerList from '@/components/PlayerList';
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
    ...mapState(['socket', 'players', 'playerId', 'currentRoom', 'roomChat']),
    ...mapGetters(['roomPlayers']),
  },
  methods: {
    ...mapMutations(['updateRoomList', 'addRoomChat', 'updateRoomPlayers']),
    ...mapActions(['leaveRoom']),
  },
  mounted() {
    let vm = this;
    if (!this.playerId)
      this.$router.replace({ path: '/' });
    if (!this.currentRoom)
      this.$router.replace({ path: '/arena' });
    this.socket.on('update-room-chat', message => {
      debugger
      vm.addRoomChat(message);
    });
    this.socket.on('room-players-update', players => {
      debugger
      vm.updateRoomPlayers(players);
    })
  
  },
  watch: {},
}
</script>

<style lang="scss">
#room {
}
</style>
