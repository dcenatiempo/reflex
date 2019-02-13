<template>
  <div id="app">
    <!-- <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/arena">About</router-link>
    </div> -->
    <router-view/>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex';

export default {
  name: 'app',
  computed: {
    ...mapState(['socket', 'playerId', 'currentRoom']),
    path() {
      let playerId = this.playerId;
      let room = this.currentRoom;

      if (!playerId)
        return '/';

      if (!room)
        return '/arena';

      return `/arena/${this.currentRoom}`;
    }
  },
  methods: {
      ...mapMutations(['authenticatePlayer', 'updatePlayerList']),
      ...mapActions(['deletePlayer', 'addPlayer', 'leaveRoom']),
  },
  mounted() {
    let vm = this;
    this.socket.open();

    this.socket.on('disconnect', (reason) => {
      console.log(reason);
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, you need to reconnect manually
        vm.socket.connect();
      }
      // else the socket will automatically try to reconnect
    });

    this.socket.on('reconnect_attempt', () => {
      debugger
      vm.socket.io.opts.query = {
        playerId: window.sessionStorage.getItem('playerId'),
        currentRoom: window.sessionStorage.getItem('currentRoom')
      }
    });

    this.socket.on('delete-player', () => {
      vm.deletePlayer();
    });

    this.socket.on('players-update', (playerList) => {
      vm.updatePlayerList(playerList);
    });

    this.socket.on('add-player', (id) => {
      if (!id) return;
      vm.addPlayer(id);
    });
  },
  watch: {
    path(path) {
      this.$router.push(path);
    },
    '$route'(to, from) {
      if ('room' === from.name && this.currentRoom != null) {
        debugger
        this.leaveRoom(this.currentRoom);
        return
      } 
      if ('home' === to.name) {
        // this.deletePlayer();
      }
      
    }

  },
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
