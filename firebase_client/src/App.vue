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
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';

export default {
  name: 'app',
  data() {
    return {
    }
  },
  computed: {
    ...mapState(['currentRoom']),
    ...mapGetters(['currentUser']),
    path() {
      let currentUser = this.currentUser;
      let room = this.currentRoom;

      if (!currentUser)
        return '/';

      if (!room)
        return '/arena';

      return `/arena/${this.currentRoom}`;
    }
  },
  methods: {
      ...mapMutations(['setCurrentUser', 'updatePlayerList']),
      ...mapActions(['signOut', 'addPlayer', 'leaveRoom']),
  },
  mounted() {
    let vm = this;
    
    this.$router.push(this.path);

    this.$fb.auth.onAuthStateChanged( (user) => {
      vm.setCurrentUser(user);
    });

    this.$fb.players//.where("state", "==", "CA")
    .onSnapshot(function(collection) {
      let players = [];
      collection.forEach(doc => {
        players.push(doc.data())
      });
      vm.updatePlayerList(players);
    });
  },
  watch: {
    path(path) {
      this.$router.push(path);
    },
    '$route'(to, from) {
      if ('room' === from.name && this.currentRoom != null) {
        this.leaveRoom(this.currentRoom);
        return
      } 
      if ('home' === to.name) {
        // this.signOut();
      }
      
    }

  },
}
</script>

<style lang="scss">
@import "@/scss/_variables.scss";
@import "@/scss/_global.scss";
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
