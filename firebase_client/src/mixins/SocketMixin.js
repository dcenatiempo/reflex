import io from 'socket.io-client';

import { mapState } from 'vuex';

export default {
  data() {
    return {
      socket: null
    };
  },
  computed: {
    ...mapState(['fb'])
  },
  methods: {},
  created() {
    debugger
    let vm = this;

    let socketConfig = {
      path: '/socket',
      query: {
        playerId: this.fb.auth.currentUser.uid,
        currentRoom: window.sessionStorage.getItem('currentRoom'),
      },
      autoConnect: false
    }
    this.socket = io('http://localhost:8080', socketConfig);

    this.socket.open();

    this.socket.on('disconnect', (reason) => {
      console.log(reason);
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, you need to reconnect manually
        vm.socket.connect();
      }
      // else the socket will automatically try to reconnect
    });

    this.socket.on('reconnect_attempt', () => {
      vm.socket.io.opts.query = {
        playerId: this.fb.auth.currentUser.uid,
        currentRoom: window.sessionStorage.getItem('currentRoom')
      }
    });
  },
  beforeDestroy() {
    this.socket.close();
  }
}

