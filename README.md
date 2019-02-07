# reflex
A multiplayer Tron game with web sockets

### To install:
- From project root: `cd server; npm install`
- From project root:`cd client; npm install`

### To run:
- From project root: `npm run server`
- From project root: `npm run clent`
- In the browser, navigate to: `http://localhost:8080/`

### Description
#### Server
So far this is just a basic Express Generator install on the backend.
Socket.io is wired up and listening on '/socket'
A mongodb connection is wired up - you just need to add MONGO_URL to the server .env
#### Client
So far this is just a basic Vue CLI install on the frontend with Vuex & Router
I am currently importing socket.io through a CDN
A proxy is set up for '/socket' to listen to the dev node server

### TODO's
