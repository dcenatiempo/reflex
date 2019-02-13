<template>
  <div id="chat-widget">
    <h2>Chat</h2>
    <ul>
      <li v-for="(message, index) in messages" :key="index">
        <span :class="{ me: playerId === message.playerId }">{{message.message}}</span>
      </li>
    </ul>
    <input v-model="newMessage" type="text" placeholder="Enter Message" />
    <button @click="sendMessage({ mode, message: newMessage })">Send Message</button>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
export default {
  name: 'chat-widget',
  props: {
    messages: {
      type: Array,
      default: () => [],
    },
    playerId: {
      type: String,
      default: '',
    },
    mode: {
      type: String,
      default: 'arena', // 'room'
    },
  },
  data() {
    return {
      newMessage: '',
    };
  },
  computed: {
    ...mapState(['socket', 'currentRoom']),
  },
  watch: {},
  methods: {
    ...mapActions(['sendMessage'])
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
