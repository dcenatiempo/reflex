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
      debugger
      let room = state.rooms.find(room => state.currentRoom === room.name);
      let playerArray = room ? room.players : [];
      return state.players.filter(player => playerArray.includes(player.id));
    },
    arenaChat: (state) => state.arenaChat.map(message => {
        const player = state.players.find(player => player.id == message.playerId);
        const name = player ? player.name : 'player has left the arena...';
        return Object.assign({}, message, { name });
    }),
    roomChat: (state) => state.roomChat.map(message => {
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
          debugger
          return state.fb.players.doc(state.fb.auth.currentUser.uid).get();
        }).then( doc => {
          debugger
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

    sendMessage: ({ state }, { room, message }) => {
      // grab reference to chat document
      let docRef = state.fb.chat.doc(`${room}Chat`);

      // start transaction
      state.fb.db.runTransaction( transaction => {

        // get the doc
        return transaction.get(docRef).then( doc => {
          let newMessage = {
            message,
            playerId: state.currentUser.id,
            timestamp: new Date(),
          };

          // if it doesn't exist, create it
          if (!doc.exists) {
            transaction.set(docRef, { chat: [newMessage] });
            return [newMessage];
          }

          // otherwise push this message to the end of chat, and slice off first message if its too big
          let updatedChat = doc.data().chat.concat(newMessage);
          updatedChat = updatedChat.length <= 10 ? updatedChat : updatedChat.slice(1); 
          transaction.update(docRef, { chat: updatedChat });
          return [updatedChat]
        });
      // }).then( currentChat => {
          // console.log("After Transaction, the currentChat is: ", currentChat);
      }).catch( err => {
          console.error(err);
      });
    },
  }
});
