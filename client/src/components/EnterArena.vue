<template>
  <div class="name-form">
    <div class="relative name-input">
      <input
        type="text"
        placeholder="Enter Your Name"
        v-model="name"
        v-on:keyup="handleInput"
        v-on:blur="handleInput"/>
      <span v-show="alreadyExists" class="warning">Name is already taken, choose another</span>
    </div>
    <button class="arena-btn" :disabled="!canSubmit" @click="submitPlayerName(name)">Enter Arena</button>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 16;

export default {
  name: 'EnterArena',
  components: {},
  data() {
    return {
      name: '',
      enterArena: false,
    }
  },
  computed: {
    ...mapState(['socket', 'players']),
    alreadyExists() {
      return Object.values(this.players).find(player => this.name.toLowerCase() === player.toLowerCase()) ? true : false;
    },
    nameIsTooShort () {
      return this.name.length < MIN_NAME_LENGTH;
    },
    canSubmit () {
      return !(this.nameIsTooShort || this.alreadyExists);
    }
  },
  methods: {
    ...mapActions(['signIn']),
    submitPlayerName(name) {
      this.socket.emit('sign-in', name);
    },
    handleInput(event) {
      if (this.name.length > MAX_NAME_LENGTH) {
        this.name = this.name.slice(0, MAX_NAME_LENGTH);
      }
      if ('Enter' != event.code && 'NumpadEnter' != event.code) return;
      if (!this.canSubmit) return;
      this.submitPlayerName(this.name);
    }
  },
  mounted() {},
  watch: {},
}
</script>

<style lang="scss">
.name-form {
  display: grid;
  max-width: 400px;
  margin: auto;
  grid-gap: 10px;
  padding: 0 1rem;
  justify-items: start;

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
      margin-bottom: 1.5rem;
    }
  }
}
</style>
