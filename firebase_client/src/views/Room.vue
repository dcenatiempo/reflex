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
    ...mapState(['players', 'currentUser', 'currentRoom']),
    ...mapGetters(['roomPlayers', 'roomChat']),
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

    this.$fb.rooms//.where("state", "==", "CA")
    .onSnapshot(function(collection) {
      let rooms = [];
      collection.forEach(doc => {
        rooms.push(doc.data())
      });
      vm.updateRoomList(rooms);
    });

    this.$fb.chat.doc(`${this.currentRoom}Chat`)
    .onSnapshot( doc => {
      if (doc.exists)
        vm.setRoomChat(doc.data().chat);
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
