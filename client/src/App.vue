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
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'app',
  computed: {
    ...mapState(['socket', 'playerId']),
  },
  methods: {
      ...mapMutations(['authenticatePlayer', 'updatePlayerList']),
  },
  mounted() {
    this.socket.open();

    this.socket.on('disconnect', (reason) => {
      console.log(reason);
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, you need to reconnect manually
        this.socket.connect();
      }
      // else the socket will automatically try to reconnect
    });

    this.socket.on('reconnect_attempt', () => {
      this.socket.io.opts.query = {
        playerId: window.sessionStorage.getItem('playerId'),
      }
    });

    this.socket.on('delete-user', () => {
      debugger
      this.authenticatePlayer(null);
      window.sessionStorage.removeItem('playerId');
    });

    this.socket.on('players-update', (playerList) => {
      console.log(playerList);
      this.updatePlayerList(playerList);
    });

    this.socket.on('player-id', (id) => {
      if (!id) return;
      this.authenticatePlayer(id);
      window.sessionStorage.setItem('playerId', id);
    });

    if (this.playerId)
      this.$router.push({ path: '/arena' });
  }
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
