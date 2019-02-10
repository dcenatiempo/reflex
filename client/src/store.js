import Vue from 'vue'
import Vuex from 'vuex'
import io from 'socket.io-client';

Vue.use(Vuex)

const playerId = window.sessionStorage.getItem('playerId');
const socketConfig = {
  path: '/socket',
  query: `playerId=${playerId}`,
  autoConnect: false
};

export default new Vuex.Store({
  state: {
    // the current (and only) socket connection
    socket: io('http://localhost:8080', socketConfig),

    // list of all rooms - corespond to socket channels
    rooms: [],

    //list of all players connected to app
    players: [{name: 'ChatBot', wins: 0, gamesPlayed: 0, _id: 0}],

    arenaChat: [],

    roomChat: [],

    // current "logged in" player information
    playerId: window.sessionStorage.getItem('playerId'),
    // keys: 'arrows',
    currentRoom: null,
  },
  getters: {
    playerInfo: (state) => state.players.find(player => state.playerId === player._id),
  },
  mutations: {
    authenticatePlayer: (state, id) => state.playerId = id,
    updatePlayerList: (state, players) => state.players = players,
    updateRoomList: (state, rooms) => state.rooms = rooms,
    setRoom: (state, room) => state.currentRoom = room,
    addArenaChat: (state, message) => state.arenaChat = state.arenaChat.concat(message),
    addRoomChat: (state, message) => state.roomChat.concat(message),
  },
  actions: {

  }
})
