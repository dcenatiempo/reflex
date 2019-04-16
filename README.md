# reflex
A multiplayer Tron game with web sockets

### To install:
- From project root: `cd server; npm install`
- From project root:`cd client; npm install`

### To run:
- A)
    - From client dir: `npm run build`
    - From server dir: `npm start`
    - In the browser, navigate to: `http://localhost:3000/`
- B)
    - uncomment proxy code in client/vue.config.js
    - uncomment line 37 in client/source/mixins/SocketMixin.js
    - From client dir: `npm run serve`
    - From server dir: `npm start`
    - In the browser, navigate to: `http://localhost:8080/`

### Description
#### Server
Express Generator 4 app.
Socket.io is wired up and listening on '/socket'

#### Client
Vue CLI 3 app with Vuex & Vue Router
Socket.io Client is being initialized in the Vuex state
A proxy is set up for '/socket' to listen to the dev node server in development

### TODO's
- Refactor/Clean up Code - especially server side
- Figure out a better build process
- Set up tests
