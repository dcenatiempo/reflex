<template>
  <div id="room">
    <header>
      <h1>{{currentRoom}}</h1>
      <a class="link" @click="requestLeaveRoom">&lt; Leave Room</a>
    </header>
    <game-board
      :mode="mode"
      @records-updated="updatePlayerRecords"
      @is-playing="updateIsPlaying"/>
    <div v-if="!isPlaying" class="right-side">
      <player-list
        :players="roomPlayers"
        :playerId="currentUser.id"
        :colors="playerColors"
        :records="playerRecords"
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
      playerRecords: {},
      isPlaying: false,
    }
  },
  computed: {
    ...mapState(['socket', 'players', 'currentRoom']),
    ...mapGetters(['roomPlayers', 'roomChat', 'currentUser', 'playerColors']),
    mode() {
      if (this.roomPlayers[this.currentUser.id]) {
        return 'b';
      }
      return 'a';
    }
  },
  methods: {
    ...mapMutations(['updateRoomList', 'setRoomChat', 'updateRoomPlayers']),
    ...mapActions(['requestLeaveRoom', 'confirmLeaveRoom']),
    updatePlayerRecords(records) {
      this.playerRecords = records;
    },
    updateIsPlaying(val) {
      this.isPlaying = val;
    }
  },
  mounted() {
    let vm = this;
    if (!this.currentUser)
      this.$router.replace({ path: '/' });
    if (!this.currentRoom)
      this.$router.replace({ path: '/arena' });

    document.querySelector('body').classList.add('dark');

    // request initial population of data
    this.socket.emit('request-rooms');
    this.socket.emit('request-room-chat', this.currentRoom);

    // listen for data updates
    this.socket.on('leave-room', () => {
      this.confirmLeaveRoom();
    });
    this.socket.on('update-room-list', rooms => {
      vm.updateRoomList(rooms);
    });
    this.socket.on(`update-room-chat`, chat => {
      vm.setRoomChat(chat);
    });
  },
  beforeDestroy() {
    document.querySelector('body').classList.remove('dark');
  },
  watch: {},
}
</script>

<style lang="scss">
#room {

  header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
    display: flex;
    justify-content: space-between;

    a {
      color: #7d73c1;
    }
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
    bottom: 0;
    top: 0;
    display: flex;
    flex-flow: column nowrap;
    // display: none;
  }
}
</style>
