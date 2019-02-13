import Vue from 'vue'
import Vuex from 'vuex'
import io from 'socket.io-client';

Vue.use(Vuex)

const playerId = window.sessionStorage.getItem('playerId');
const currentRoom = window.sessionStorage.getItem('currentRoom');
const socketConfig = {
  path: '/socket',
  query: {
    playerId,
    currentRoom,
  },
  autoConnect: false
};

export default new Vuex.Store({
  state: {
    // the current (and only) socket connection
    socket: io('http://localhost:8080', socketConfig),

    // list of all rooms - corespond to socket channels
    rooms: [],

    //list of all players connected to app
    players: [],

    roomPlayers: [],

    arenaChat: [],

    roomChat: [],

    // current "logged in" player information
    playerId: playerId,
    // keys: 'arrows',
    currentRoom: currentRoom,
  },
  getters: {
    playerInfo: (state) => state.players.find(player => state.playerId === player._id),
    roomPlayers: (state) => state.roomPlayers,
  },
  mutations: {
    // Players
    authenticatePlayer: (state, id) => state.playerId = id,
    updatePlayerList: (state, players) => state.players = players,
    updateRoomPlayers: (state, players) => state.roomPlayers = players,

    // Rooms
    updateRoomList: (state, rooms) => state.rooms = rooms,
    setRoom: (state, room) => state.currentRoom = room,

    // Chat
    addArenaChat: (state, message) => state.arenaChat = state.arenaChat.concat(message),
    addRoomChat: (state, message) => {debugger; state.roomChat = state.roomChat.concat(message);},
  },
  actions: {
    // Players
    addPlayer: (context, id) => {
      context.commit('authenticatePlayer', (id));
      window.sessionStorage.setItem('playerId', id);
    },
    deletePlayer: (context, id) => {
      context.commit('authenticatePlayer', null);
      window.sessionStorage.removeItem('playerId');
      window.sessionStorage.removeItem('currentRoom');
      context.state.socket.emit('delete-player', id);
    },

    // Rooms
    joinRoom: (context, room) => {
      context.commit('setRoom', room);
      window.sessionStorage.setItem('currentRoom', room);
      context.state.socket.emit('enter-room', room);
    },
    leaveRoom: (context, room) => {
      debugger
      context.commit('setRoom', null);
      context.commit('updateRoomPlayers', [])
      window.sessionStorage.removeItem('currentRoom');
      context.state.socket.emit('leave-room', room);
    },

    // Chat
    sendMessage: (context, { mode, message }) => {
      debugger
      context.state.socket.emit(`send-${mode}-chat`, message);
    }
  }
})
