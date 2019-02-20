import io from 'socket.io-client';

import { mapMutations, mapGetters } from 'vuex';

export default {
  data() {
    return {
    };
  },
  computed: {
    ...mapGetters(['fb', 'currentUser', 'currentRoom']),
  },
  methods: {
    ...mapMutations(['setSocket']),
  },
  created() {
    let vm = this;

    let playerId = this.fb.auth.currentUser ? this.fb.auth.currentUser.uid : null;
    let socketConfig = {
      path: '/socket',
      query: {
        playerId: playerId,
        currentRoom: this.currentRoom,
      },
      autoConnect: false
    }
    let socket = io('http://localhost:8080', socketConfig);
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
        playerId: vm.currentUser.id,
        currentRoom: vm.currentRoom,
      }
    });
  },
  beforeDestroy() {
    this.socket.close();
  }
}

