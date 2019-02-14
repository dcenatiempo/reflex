<template>
  <div id="chat-widget">
    <h2>Chat</h2>
    <ul>
      <li v-for="(message, index) in messages" :key="index" :class="{ me: playerId === message.playerId }">
        <div class="chat-bubble">{{message.message}}<span class="name">{{message.name}}</span></div>
      </li>
    </ul>
    <button-input
      @submit="handleSubmit"
      placeholder="Say something..."
      buttonText="Send"/>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import ButtonInput from './ButtonInput';

export default {
  name: 'chat-widget',
  components: {
    ButtonInput,
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
  watch: {
    messages() {
      let vm = this;
      setTimeout(() => {
        debugger
        vm.chatElement.scrollTop = vm.chatElement.scrollHeight;
      }, 0);
    }
  },
  methods: {
    ...mapActions(['sendMessage']),
    handleSubmit(input) {
      debugger
      this.sendMessage({ mode: this.mode, message: input });
    }
  },
  mounted() {
    this.chatElement = document.querySelector('#chat-widget ul');
  },
}
</script>

<style lang="scss">
#chat-widget {
  padding: 1em;
  border: 1px solid lightgray;
  border-radius: 5px;
  margin: .5em;

  ul {
    padding: 0;
    margin: 0;
    list-style-type: none;
    max-height: 400px;
    overflow-y: auto;
    scroll-behavior: smooth;

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
