<template>
  <div id="chat-widget" class="widget" :class="colorMode">
    <h2 v-if="'' === colorMode">Chat</h2>
    <scrollable-ul :watch-data="messages" :max-height="100">
      <li v-for="(message, index) in messages" :key="index" :class="{ me: playerId === message.userId }">
        <div
            v-if="'' === colorMode"
            class="chat-bubble"
            :style="colors ? `background-color: ${colorMap[colors[message.userId]]}` : ''">
          {{message.message}}
        </div>
        <div
            v-if="'dark' === colorMode"
            class="chat-bubble"
            :style="colors ? `color: ${colorMap[colors[message.userId]]}` : ''">
          {{message.message}}
        </div>

        <span class="name">{{message.name}}</span>
      </li>
    </scrollable-ul>
    <button-input
      @submit="handleSubmit"
      placeholder="Say something..."
      buttonText="Send"
      :max-length="255"/>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
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
    colors: {
      type: Object,
    },
    colorMode: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      newMessage: '',
      chatElement: undefined,
    };
  },
  computed: {
    ...mapState(['currentRoom']),
    ...mapGetters(['colorMap']),
  },
  watch: {},
  methods: {
    ...mapActions(['sendMessage']),
    handleSubmit(message) {
      let room = 'arena' === this.mode ? this.mode : this.currentRoom;
      this.sendMessage( { room, message } );
    }
  },
  mounted() {},
}
</script>

<style lang="scss">
#chat-widget {
  display: flex;
  flex-flow: column nowrap;
  
  .scrollable-ul {
    padding-top: 0rem;
  }
  ul {
    padding-top: 1.5rem;

    li {
      display: flex;
      margin-bottom: 1.5rem;
      position: relative;

      .chat-bubble {
        position: relative;
        padding: 1rem;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        max-width: 80%;
        hyphens: auto;
        word-break: break-word;
        text-align: left;
      }
      &.me {
        justify-content: flex-end;

        .chat-bubble {
          background-color: rgb(48, 190, 238);
        }
        .name {
          display: none;
        }
      }
      &:not(.me) {
        justify-content: flex-start;

        .chat-bubble {
          background-color: rgb(238, 97, 231);
          background-color: lightgray;
        }
        .name {
          font-weight: normal;
          position: absolute;
          color: gray;
          top: 0;
          left: 0.5rem;
          transform: translateY(-100%);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
          max-width: 80%;
          text-align: left;
        }
      }
    }
  }
  &.dark {
    flex-basis: 300px;
    flex-grow: 3;
    overflow: hidden;
    flex-shrink: 1;

    .scrollable-ul {
      justify-content: flex-end;
    }

    ul {

      li {

        .chat-bubble {
          padding: 0 .5rem;
        }
        &.me {

          .chat-bubble {
            background-color: transparent;
          }
          .name {
            display: none;
          }
        }
        &:not(.me) {
          justify-content: flex-start;

          .chat-bubble {
            background-color: transparent;
            background-color: transparent;
          }
          .name {
            color: gray;
            top: 0;
            left: 0.5rem;
            transform: translateY(-100%);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
            max-width: 80%;
            text-align: left;
          }
        }
      }
    }
  }
}
</style>
