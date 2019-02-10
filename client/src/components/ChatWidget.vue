<template>
  <div id="chat-widget">
    <h2>Chat</h2>
    <ul>
      <li v-for="(message, index) in messages" :key="index">
        <span :class="{ me: playerId === message.playerId }">{{message.message}}</span>
      </li>
    </ul>
    <input v-model="newMessage" type="text" placeholder="Enter Message" />
    <button @click="sendMessage">Send Message</button>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'chat-widget',
  props: {
    messages: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      newMessage: '',
    };
  },
  computed: {
    ...mapState(['socket', 'players', 'playerId', 'currentRoom']),
  },
  watch: {},
  methods: {
    sendMessage() {
      this.socket.emit('send-arena-chat', this.newMessage);
    }
  },
  mounted() {},
}
</script>

<style lang="scss">
#chat-widget {
  border: 1px solid lightgray;
  .me {
    color: red;
  }
}
</style>
