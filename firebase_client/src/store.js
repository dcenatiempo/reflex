import Vue from 'vue';
import Vuex from 'vuex';
import fb from './firebaseConfig';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    fb,
    rooms: [],
    players: [],
    arenaChat: [],
    roomChat: [],
    currentUser: null,
    // keys: 'arrows',
    currentRoom: window.sessionStorage.getItem('currentRoom'),
  },
  getters: {
    currentUser: (state) => state.currentUser = state.currentUser === null ? null : {
      name: state.currentUser.displayName,
      id: state.currentUser.uid
    },
    // playerInfo: (state) => state.players.find(player => state.playerId === player.id),
    roomPlayers: (state) => {
      let room = state.rooms.find(room => state.currentRoom === room.name);
      let playerArray = room ? room.players : [];
      return state.players.filter(player => playerArray.includes(player.id));
    },
    arenaChat: (state) => state.arenaChat.map(message => {
        debugger;
        const player = state.players.find(player => player.id == message.playerId);
        const name = player ? player.name : 'player has left the arena...';
        return Object.assign({}, message, { name });
    }),
    roomChat: (state) => state.roomChat.map(message => {
        debugger;
        const player = state.players.find(player => player.id == message.playerId);
        const name = player ? player.name : 'player has left the arena...';
        return Object.assign({}, message, { name });
    }),
  },
  mutations: {
    // Players
    setCurrentUser: (state, user) => state.currentUser = user,
    updatePlayerList: (state, players) => state.players = players,

    // Rooms
    updateRoomList: (state, rooms) => state.rooms = rooms,
    setRoom: (state, room) => state.currentRoom = room,

    // Chat
    setArenaChat: (state, chat) => state.arenaChat = chat,
    setRoomChat: (state, chat) => state.roomChat = chat,
    clearRoomChat: (state) => state.roomChat = [],
    clearArenaChat: (state) => state.arenaChat = [],
  },
  actions: {
    // Players
    signIn: ({ commit, state }, name) => {
      state.fb.auth.signInAnonymously()
        .then( () => { 
          return state.fb.auth.currentUser.updateProfile({ displayName: name });
        }).then( () => {
          commit('setCurrentUser', state.fb.auth.currentUser);
          return state.fb.players.doc(state.fb.auth.currentUser.uid).get();
        }).then( doc => {
          if (doc.exists) {
              let player = {
                name,
                updatedAt: new Date(),
              };
              return state.fb.players.doc(state.fb.auth.currentUser.uid).update(player);
          } else {
              let newPlayer = {
                name,
                wins: 0,
                gamesPlayed: 0,
                updatedAt: new Date(),
                createdAt: new Date(),
                id: state.fb.auth.currentUser.uid,
              };
              return state.fb.players.doc(state.fb.auth.currentUser.uid).set(newPlayer)
          }
      }).catch( error => {
        debugger
        console.log(error);
      });
    },
    signOut: ({ state, commit }) => {
      state.fb.players.doc(state.currentUser.id).delete()
      .then( () => {
        return state.fb.auth.signOut()
      }).then( () => {
        console.log('Signed Out');
        commit('setCurrentUser', null);
        commit('clearRoomChat');
        commit('clearArenaChat');
        window.sessionStorage.removeItem('currentRoom');
      }).catch( error => {
        debugger
        console.error('Sign Out Error', error);
      });
    },

    // Rooms
    joinRoom: ({ state, commit }, roomName) => {
      commit('setRoom', roomName);
      window.sessionStorage.setItem('currentRoom', roomName);
      let room = state.rooms.find(room => roomName === room.name);
      if (!room) {
        state.fb.rooms.doc(roomName).set({
          name: roomName,
          players: [state.currentUser.id],
          createdAt: new Date(),
          updatedAt: new Date(),
        }).catch( e => {
          console.log(e);
        });
      } else {
        state.fb.rooms.doc(roomName).update({
          players: room.players.concat(state.currentUser.id),
          updatedAt: new Date(),
        }).catch( e => {
          console.log(e);
        });
      }
    },
    leaveRoom: ({ commit, state }, roomName) => {
      commit('setRoom', null);
      commit('clearRoomChat');
      window.sessionStorage.removeItem('currentRoom');
      debugger
      let room = state.rooms.find(room => roomName === room.name);
      if (room) {
        let newPlayers = room.players.filter(player => player !== state.currentUser.id)
        if (0 === newPlayers.length) {
          state.fb.rooms.doc(roomName)
            .delete()
            .then( () => {
              return state.fb.chat.doc(roomName).delete()
            }).then( () => {
            }).catch( e => {
              console.log(e);
            });
        } else {
          state.fb.rooms.doc(roomName).update({
            players: newPlayers,
            updatedAt: new Date(),
          }).then( () => {
          }).catch( e => {
            console.log(e);
          });
        }
      }
    },

    // Chat
    sendArenaMessage: ({ state }, message) => {
      let newChat = state.arenaChat.concat({
        message,
        playerId: state.currentUser.id,
        timestamp: new Date(),
      });
      if (newChat.length === 1) {
        state.fb.chat.doc('arenaChat').set({
          chat: newChat
        }).then( () => {
          debugger
        }).catch( e => {
          console.log(e);
        });
      }
      if (newChat.length > 10) newChat.shift();
      state.fb.chat.doc('arenaChat').update({
        chat: newChat
      }).then( () => {
        debugger
      }).catch( e => {
        console.log(e);
      });
    },
    sendRoomMessage: ({ state }, message) => {
      let newChat = state.roomChat.concat({
        message,
        playerId: state.currentUser.id,
        timestamp: new Date(),
      });
      if (newChat.length === 1) {
        state.fb.chat.doc(`${state.currentRoom}Chat`).set({
          chat: newChat
        }).then( () => {
          debugger
        }).catch( e => {
          console.log(e);
        });
      }
      if (newChat.length > 10) newChat.shift();
      state.fb.chat.doc(`${state.currentRoom}Chat`).update({
        chat: newChat
      }).then( () => {
        debugger
      }).catch( e => {
        console.log(e);
      });
    }
  }
})
