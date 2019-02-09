import Vue from 'vue'
import Vuex from 'vuex'
import io from 'socket.io-client';

Vue.use(Vuex)

const socketConfig = {
  path: '/socket'
};

export default new Vuex.Store({
  state: {
    // the current (and only) socket connection
    socket: io('http://localhost:8080', socketConfig),

    // list of all rooms - corespond to socket channels
    rooms: [],

    //list of all players connected to app
    players: [{name: 'Devin', wins: 0, gamesPlayed: 2}],

    // current "logged in" player
    player: {
      name: null,
      wins: 0,
      gamesPlayed: 0,
    },
  },
  getters: {

  },
  mutations: {

  },
  actions: {

  }
})
