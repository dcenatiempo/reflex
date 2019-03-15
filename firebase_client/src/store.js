import Vue from 'vue';
import Vuex from 'vuex';
import fb from './firebaseConfig';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // services
    fb,
    socket: null,
    // user data
    currentUser: null,
    currentRoom: window.sessionStorage.getItem('currentRoom'),
    // Arena/Room data
    rooms: [],
    players: [],
    arenaChat: [],
    roomChat: [],
    colors: {},
  },
  getters: {
    socket: (state) => state.socket,
    fb: (state) => state.fb,
    currentUser: (state) => state.currentUser === null ? null : {
      name: state.currentUser.displayName,
      id: state.currentUser.uid
    },
    rooms: (state) => state.rooms,
    roomPlayers: (state) => {
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
    }),
  },
  mutations: {
    setSocket: (state, socket) => state.socket = socket,
    // user data
    setCurrentUser: (state, user) => state.currentUser = user,
    clearCurrentUser: (state) => state.currentUser = null,
    setCurrentRoom: (state, room) => {
      state.currentRoom = room;
      window.sessionStorage.setItem('currentRoom', room);
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
    signIn: ({ commit, getters }, name) => {
      // firebase sign in
      getters.fb.auth.signInAnonymously()
        .then( () => {
          // firebase set user name
          return getters.fb.auth.currentUser.updateProfile({ displayName: name }); // no data returned
        }).then( () => {
          // set vuex currentUser
          commit('setCurrentUser', getters.fb.auth.currentUser);
          // get firebase player associated with user
          return getters.fb.players.doc(getters.fb.auth.currentUser.uid).get();
        }).then( doc => {
          if (doc.exists) {
            console.log('player already exists. Updating...')
            // if player exist, update it
            let player = {
              name,
              updatedAt: new Date(),
              socketId: getters.socket.id,
            };
            return getters.fb.players.doc(getters.fb.auth.currentUser.uid).update(player);
          } else {
            // if player does not exist, create it
            let newPlayer = {
              name,
              wins: 0,
              gamesPlayed: 0,
              updatedAt: new Date(),
              createdAt: new Date(),
              id: getters.fb.auth.currentUser.uid,
              socketId: getters.socket.id,
            };
            return getters.fb.players.doc(getters.fb.auth.currentUser.uid).set(newPlayer)
          }
      }).then( () => {
        //
      }).catch( e => {
        console.log(e);
      });
    },
    signOut: ({ getters, commit }) => {
      // remove player from firebase
      getters.fb.players.doc(getters.currentUser.id).delete()
      .then( () => {
        // firebase user signout
        return getters.fb.auth.signOut()
      }).then( () => {
        console.log('Signed Out');
        // clear out vuex
        commit('clearCurrentUser');
        commit('clearCurrentRoom')
        commit('clearRoomChat');
        commit('clearArenaChat');
      }).catch( error => {
        console.error('Sign Out Error', error);
      });
    },

    // Rooms
    joinRoom: ({ getters, commit }, roomName) => {
      // firebase transaction      
      let docRef = getters.fb.rooms.doc(roomName);
      getters.fb.db.runTransaction( transaction => {

        // get the room
        return transaction.get(docRef).then( doc => {
          
          // if room doesn't exist, create it
          if (!doc.exists) {
            let newRoom = {
              name: roomName,
              players: [getters.currentUser.id],
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            transaction.set(docRef, newRoom);
            return
          }

          // otherwise add player to room
          let update = {
            updatedAt: new Date(),
            players: doc.data().players.concat([getters.currentUser.id])
          }
          transaction.update(docRef, update);
        });
      }).then( () => {
        getters.socket.emit('enter-room', roomName);
        commit('setCurrentRoom', roomName);
      }).catch( e => {
          console.error(e);
      });
    },
    leaveRoom: ({ commit, getters }, roomName) => {
      // firebase transaction
      let docRef = getters.fb.rooms.doc(roomName);
      getters.fb.db.runTransaction( transaction => {

        // get the room
        return transaction.get(docRef).then( doc => {
          
          // if room doesn't exist, return
          if (!doc.exists) {
            transaction.delete(docRef);
            return;
          }

          // if player is not in room return
          const newPlayers = doc.data().players.filter(playerId => playerId !== getters.currentUser.id);
          if (newPlayers.length === doc.data().players.length) {
            transaction.update(docRef, {});
            return;
          }
          
          // if room is empty, delete it
          if (newPlayers.length === 0) {
            transaction.delete(docRef);
            return;
          }

          // otherwise remove player from room
          const update = {
            updatedAt: new Date(),
            players: newPlayers
          }
          transaction.update(docRef, update);
        });
      }).then( () => {
        commit('clearCurrentRoom');
        commit('clearRoomChat');
      }).catch( e => {
          console.error(e);
      });

      // TODO: Move this to server or inside transaction?
      let room = getters.rooms.find(room => roomName === room.name);
      if (room) {
        let newPlayers = room.players.filter(player => player !== getters.currentUser.id)
        if (0 === newPlayers.length) {
          // Delete Firebase Chat
          getters.fb.chat.doc(`${roomName}Chat`).delete()
            .then( () => {})
            .catch( e => {
              console.log(e);
            });
        }
      }
    },

    // Chat
    sendMessage: ({ state, getters }, { room, message }) => {
      // firebase transactions
      getters.fb.db.runTransaction( transaction => {
        let docRef = state.fb.chat.doc(`${room}Chat`);

        // get the specific chat thread
        return transaction.get(docRef).then( doc => {
          let newMessage = {
            message,
            playerId: getters.currentUser.id,
            timestamp: new Date(),
          };

          // if chat doesn't exist, create it
          if (!doc.exists) {
            transaction.set(docRef, { room, chat: [newMessage] });
            return;
          }

          // otherwise push this message to the end of chat,
          let updatedChat = doc.data().chat.concat(newMessage);
          // if the thread is too big, truncate it
          updatedChat = updatedChat.length <= 10 ? updatedChat : updatedChat.slice(1); 
          transaction.update(docRef, { chat: updatedChat });
        });
      }).catch( err => {
          console.error(err);
      });
    },
  }
});
