<template>
  <div id="room">
    <header>
      <a class="link" @click="leaveRoom(currentRoom)">Leave Room</a>
      <h1>Welcom to {{currentRoom}}</h1>
    </header>
    <game-board />
    <player-list
      :players="roomPlayers"
      :playerId="currentUser.id"/>
    <chat-widget
      :messages="roomChat"
      :playerId="currentUser.id"
      mode="room"/>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
import PlayerList from '@/components/PlayerList';
import ChatWidget from '@/components/ChatWidget';
import GameBoard from '@/components/GameBoard';

export default {
  name: 'room',
  components: {
    PlayerList,
    ChatWidget,
    GameBoard,
  },
  data() {
    return {
      name: '',
    }
  },
  computed: {
    ...mapState(['socket', 'players', 'currentRoom']),
    ...mapGetters(['roomPlayers', 'roomChat', 'currentUser']),
  },
  methods: {
    ...mapMutations(['updateRoomList', 'setRoomChat', 'updateRoomPlayers']),
    ...mapActions(['leaveRoom']),
  },
  mounted() {
    let vm = this;
    if (!this.currentUser)
      this.$router.replace({ path: '/' });
    if (!this.currentRoom)
      this.$router.replace({ path: '/arena' });

    // request initial population of data
    this.socket.emit('request-rooms');
    this.socket.emit('request-room-chat', this.currentRoom);

    // listen for data updates
    this.socket.on('update-room-list', rooms => {
      vm.updateRoomList(rooms);
    });
    this.socket.on(`update-room-chat`, chat => {
      vm.setRoomChat(chat);
    });
  
  },
  watch: {},
}
</script>

<style lang="scss">
#room {
  padding: 1rem;
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-areas: 
    "header header"
    "game-board player-list"
    "game-board chat-widget";
  grid-gap: 1rem;

  header {
    grid-area: header;
  }
}
</style>
