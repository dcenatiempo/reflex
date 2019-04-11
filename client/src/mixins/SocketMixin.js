import io from 'socket.io-client';

import { mapMutations, mapGetters } from 'vuex';

export default {
  data() {
    return {
    };
  },
  computed: {
    ...mapGetters([ 'currentUser', 'currentRoom']),
  },
  methods: {
    ...mapMutations(['setSocket', 'clearCurrentUser', 'clearCurrentRoom']),
  },
  created() {
    // prevent duplicating the session
    if (sessionStorage.getItem('currentUser')) {
      // 1 = page refresh
      // 2 = duplicating tab
      if (2 === performance.navigation.type) {
        this.clearCurrentUser();
        this.clearCurrentRoom();
      }
    }
    let vm = this;

    let socketConfig = {
      path: '/socket',
      query: {
        currentUser: JSON.stringify(this.currentUser),
        currentRoom: this.currentRoom,
      },
      autoConnect: false
    }
    let socket = io(window.location.origin, socketConfig);
    // let socket = io('http://localhost:8080', socketConfig);
    this.setSocket(socket);

    socket.open();

    socket.on('disconnect', (reason) => {
      console.log(reason);
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, you need to reconnect manually
        vm.socket.connect();
      }
      // else the socket will automatically try to reconnect
    });

    socket.on('reconnect_attempt', () => {
      vm.socket.io.opts.query = {
        currentUser: JSON.stringify(this.currentUser),
        currentRoom: this.currentRoom,
      }
    });
  },
  beforeDestroy() {
    this.socket.close();
  }
}

