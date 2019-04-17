import Vue from 'vue';
import Vuex from 'vuex';

const currentUser = JSON.parse(window.sessionStorage.getItem('currentUser'));
const currentRoom = window.sessionStorage.getItem('currentRoom');

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // services
    socket: null,
    // user data
    currentUser,
    currentRoom,
    // Arena/Room data
    rooms: [],
    players: {},
    arenaChat: [],
    roomChat: [],
    colors: {},
  },
  getters: {
    socket: (state) => state.socket,
    currentUser: (state) => state.currentUser,
    currentUserId: (state) => state.currentUser === null ? null : state.currentUser.id,
    rooms: (state) => state.rooms,
    roomPlayers: (state) => {
      let room = state.rooms.find(room => state.currentRoom === room.name);
      let playerArray = room ? room.players : [];
      return playerArray.reduce((roomPlayers, id) => {
        roomPlayers[id] = state.players[id];
        return roomPlayers;
      }, {});
    },
    arenaChat: (state) => state.arenaChat.map(message => {
        const player = state.players[message.userId];
        const name = player ? player : 'player has left the arena...';
        return Object.assign({}, message, { name });
    }),
    roomChat: (state) => state.roomChat.map(message => {
        const player = state.players[message.userId];
        const name = player ? player : 'player has left the arena...';
        return Object.assign({}, message, { name });
    }),
    playerColors: (state) => {
      return Object.keys(state.colors).reduce((obj, color) => {
        if (state.colors[color] !== null) {
          obj[state.colors[color]] = color;
        }
        return obj;
      },{})
    },
    colorMap: () => ({
      red: '#ff5e69',
      blue: '#6bb5ff',
      yellow: '#fcff6a',
      orange: '#ffad69',
      green: '#6bff69',
      purple: '#d29bff',
      fuchsia: 'fuchsia',
      aqua: 'aqua',
    }),
  },
  mutations: {
    setSocket: (state, socket) => state.socket = socket,
    // user data
    setCurrentUser: (state, user) => {
      window.sessionStorage.setItem('currentUser', JSON.stringify(user));
      state.currentUser = user;
    },
    clearCurrentUser: (state) => {
      window.sessionStorage.removeItem('currentUser');
      state.currentUser = null;
    },
    setCurrentRoom: (state, room) => {
      window.sessionStorage.setItem('currentRoom', room);
      state.currentRoom = room;
    },
    clearCurrentRoom: (state) => {
      state.currentRoom = null;
      window.sessionStorage.removeItem('currentRoom');
    },

    // Arena/Room data
    updatePlayerList: (state, players) => state.players = players,
    updateRoomList: (state, rooms) => state.rooms = rooms,
    setArenaChat: (state, chat) => state.arenaChat = chat,
    setRoomChat: (state, chat) => state.roomChat = chat,
    clearRoomChat: (state) => state.roomChat = [],
    clearArenaChat: (state) => state.arenaChat = [],
    setColors: (state, colors) => state.colors = colors,
  },
  actions: {
    // Players
    requestSignIn: ({ getters }, name) => {
      getters.socket.emit('sign-in', name);
    },
    confirmSignIn: ({ commit }, user) => {
      commit('setCurrentUser', user);
    },
    requestSignOut: ({ getters }) => {
      getters.socket.emit('sign-out');
    },
    confirmSignOut: ({ commit }) => {
      commit('clearRoomChat');
      commit('clearCurrentRoom');
      commit('clearArenaChat');
      commit('clearCurrentUser');
    },

    // Rooms
    requestJoinRoom: ({ getters }, roomName) => {  
      getters.socket.emit('enter-room', roomName);
    },
    confirmJoinRoom: ({ commit }, roomName) => {
      commit('setCurrentRoom', roomName);
    },

    requestLeaveRoom: ({ getters }) => {
      getters.socket.emit('leave-room')
    },
    confirmLeaveRoom: ({ commit }) => {
      commit('clearCurrentRoom');
      commit('clearRoomChat');
    },

    // Chat
    sendMessage: ({ getters }, { room, message }) => {
      getters.socket.emit('post-chat', {room, message, userId: getters.currentUserId});
    },
  }
});
