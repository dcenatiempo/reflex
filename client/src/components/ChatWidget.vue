<template>
  <div id="chat-widget" class="widget">
    <h2>Chat</h2>
    <scrollable-ul :watch-data="messages" :max-height="400">
      <li v-for="(message, index) in messages" :key="index" :class="{ me: playerId === message.playerId }">
        <div class="chat-bubble">{{message.message}}<span class="name">{{message.name}}</span></div>
      </li>
    </scrollable-ul>
    <button-input
      @submit="handleSubmit"
      placeholder="Say something..."
      buttonText="Send"/>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import ButtonInput from './ButtonInput';
import ScrollableUl from './ScrollableUL';

export default {
  name: 'chat-widget',
  components: {
    ButtonInput,
    ScrollableUl,
  },
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
      chatElement: undefined,
    };
  },
  computed: {
    ...mapState(['socket', 'currentRoom']),
  },
  watch: {},
  methods: {
    ...mapActions(['sendMessage']),
    handleSubmit(input) {
      this.sendMessage({ mode: this.mode, message: input });
    }
  },
  mounted() {},
}
</script>

<style lang="scss">
#chat-widget {

  ul {

    li {
      display: flex;
      margin-bottom: 2em;


      &.me {
        justify-content: flex-end;

        .chat-bubble {
          background-color: rgb(48, 190, 238);
          
          .name {
            display: none;
          }
        }
        
      }
      &:not(.me) {
        justify-content: flex-start;

        .chat-bubble {
          background-color: rgb(238, 97, 231);
          
          .name {
            font-weight: normal;
            position: absolute;
            color: gray;
            top: 0;
            left: 0.5em;
            transform: translateY(-100%);
          }
        }
      }
      .chat-bubble {
        position: relative;
        padding: 1em;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        max-width: 80%;
      }
    }
  }
}
</style>
