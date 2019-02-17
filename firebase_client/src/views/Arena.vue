<template>
  <div id="arena">
    <header>
      <a class="link" @click="leaveArena">&lt; Leave Arena</a>
      <h1>This is the arena</h1>
    </header>
    <player-list
      :players="players"
      :playerId="currentUser ? currentUser.id : null" />
    <room-list />
    <chat-widget
      :messages="arenaChat"
      :playerId="currentUser.id"
      mode="Arena"/>
  </div>
</template>

<script>
// @ is an alias to /src
// import NewPlayerInpu from '@/components/HelloWorld.vue'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
import PlayerList from '@/components/PlayerList';
import RoomList from '@/components/RoomList';
import ChatWidget from '@/components/ChatWidget';

export default {
  name: 'arena',
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
    ...mapState(['players', 'currentUser', 'currentRoom', 'players']),
    ...mapGetters(['arenaChat']),
  },
  methods: {
    ...mapMutations(['updateRoomList', 'setArenaChat']),
    ...mapActions(['signOut']),
    leaveArena() {
      this.signOut();
    }
  },
  mounted() {
    let vm = this;

    if (!this.currentUser)
      this.$router.replace({ path: '/' });
    if (this.currentRoom)
      this.$router.replace({ path: `/arena/${this.currentRoom}`});
    
    // this.socket.emit('request-rooms');

    this.$fb.rooms//.where("state", "==", "CA")
    .onSnapshot( collection => {
      let rooms = [];
      collection.forEach(doc => {
        rooms.push(doc.data())
      });
      vm.updateRoomList(rooms);
    });

    this.$fb.chat.doc('arenaChat')
    .onSnapshot( doc => {
      vm.setArenaChat(doc.data().chat);
    });
  
  },
  watch: {},
}
</script>

<style lang="scss">
#arena {
  padding: 1rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-areas: 
    "header header"
    "chat-widget room-list"
    "chat-widget player-list";
  grid-gap: 1rem;

  header {
    grid-area: header;
  }
}
</style>
