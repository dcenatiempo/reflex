<template>
  <div id="room">
    <header>
      <h1>{{currentRoom}}</h1>
    </header>
    <game-board mode="b"/>
    <div class="right-side">
      <a class="link" @click="leaveRoom(currentRoom)">Leave Room</a>
      <player-list
        :players="roomPlayers"
        :playerId="currentUser.id"
        :colors="playerColors"
        color-mode="dark"/>
      <chat-widget
        :messages="roomChat"
        :playerId="currentUser.id"
        mode="room"
        :colors="playerColors"
        color-mode="dark"/>
    </div>
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
    ...mapGetters(['roomPlayers', 'roomChat', 'currentUser', 'playerColors']),
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
body {
  background: #24283c;
}
#room {
  padding: 1rem;
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-areas: 
    "game-board player-list"
    "game-board chat-widget";
  grid-gap: 1rem;

  header {
    position: fixed;
    top: 0;
    z-index: 10;
  }
  #game-board {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;

    #myCanvas {
      border: 2px solid #000000;
      background: black;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
  .right-side {
    position: fixed;
    right: 0;
    display: none;
  }
}
</style>
