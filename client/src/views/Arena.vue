<template>
  <div id="arena">
    <header>
      <a class="link" @click="leaveArena">&lt; Leave Arena</a>
      <h1>Reflex Arena</h1>
    </header>
    <div class="left-side">
      <chat-widget
        :messages="arenaChat"
        :playerId="currentUser.id"
        mode="arena"/>
    </div>
    <div class="right-side">
      <room-list />
      <player-list
        :players="players"
        :playerId="currentUser ? currentUser.id : null" />
    </div>
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
    ...mapState(['socket', 'players', 'currentRoom', 'players']),
    ...mapGetters(['arenaChat', 'currentUser']),
  },
  methods: {
    ...mapMutations(['setArenaChat']),
    ...mapActions(['requestSignOut', 'confirmJoinRoom']),
    leaveArena() {
      this.requestSignOut();
    }
  },
  mounted() {
    let vm = this;

    if (!this.currentUser)
      this.$router.replace({ path: '/' });
    if (this.currentRoom)
      this.$router.replace({ path: `/arena/${this.currentRoom}`});
    
    // request initial population of data
    this.socket.emit('request-rooms');
    this.socket.emit('request-arena-chat');

    // listen for data updates
    this.socket.on('update-arena-chat', chat => {
      vm.setArenaChat(chat);
    });
    this.socket.on('join-room', roomName => {
      vm.confirmJoinRoom(roomName);
    });
  
  },
  watch: {},
}
</script>

<style lang="scss">
#arena {
  padding: .5rem;
  display: flex;
  flex-flow: row wrap;

  header {
    flex-grow: 999;
    flex-basis: 5000px;
    margin: .5em;
  }
  .left-side {
    flex-basis: 300px;
    flex-grow: 2;
    display: flex;
    #chat-widget {
      flex-grow: 1;
      margin: .5em;
    }
  }
  .right-side {
    flex-basis: 150px;
    flex-grow: 1;
    #player-list {
      margin: .5em;
      margin-top: 1em;
    }
    #room-list {
      margin: .5em;
    }
  }
}
</style>
