<template>
  <div id="home">
    <h1>Reflex</h1>
    <div class="name-form">
      <span>What is your name:</span>
      <div class="relative name-input">
        <input
          type="text"
          placeholder="Enter Your Name"
          v-model="name"/>
        <span v-show="alreadyExists" class="warning">Name is already taken, choose another</span>
      </div>
      <button class="arena-btn" :disabled="alreadyExists || name.length < 3" @click="submitPlayerName(name)">Enter Arena</button>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
// import NewPlayerInpu from '@/components/HelloWorld.vue'
import { mapState, mapActions } from 'vuex';

export default {
  name: 'home',
  components: {},
  data() {
    return {
      name: '',
      enterArena: false,
    }
  },
  computed: {
    ...mapState(['players', 'currentUser']),
    alreadyExists() {
      return false;
      // return this.players.find(player => this.name.toLowerCase() === player.name.toLowerCase()) ? true : false;
    }
  },
  methods: {
    ...mapActions(['signIn']),
    submitPlayerName(name) {
      this.signIn(name);
    },
  },
  mounted() {
    if (this.currentUser)
      this.$router.replace({ path: '/arena' });
  },
  watch: {},
}
</script>

<style lang="scss">
#home {
  h1 {
    font-size: 3rem;
  }
  .warning {
    color: red;
    position: absolute;
    right: 10px;
    bottom: 0;
  }
  .arena-btn {
    font-size: 2rem;
    background: orange;
    color: white;
    border: none;
    border-radius: 5px;
    padding: .5rem;
    width: 100%;

    &[disabled] {
      background: lightgray;
    }
  }
  .name-input {
    width: 100%;

    input {
      font-size: 1.5rem;
      width: 100%;
      margin-bottom: 1rem;
    }
  }
  .name-form {
    display: grid;
    max-width: 400px;
    margin: auto;
    grid-gap: 10px;
    justify-items: start;
  }
}
</style>
