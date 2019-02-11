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
Express Generator 4 app.
Socket.io is wired up and listening on '/socket'
A mongodb connection is wired up - you just need to add MONGO_URL to the server .env
#### Client
Vue CLI 3 app with Vuex & Vue Router
Socket.io Client is being initialized in the Vuex state
A proxy is set up for '/socket' to listen to the dev node server in development

### TODO's
#### Client
1. Improve UI for PlayerList
1. Improve UI for RoomList
1. Improve UI for ChatWidget
1. Build out Room functionality
1. Figure out a good way to centralizie all socket code some how
#### Server
1. Organize abstract/organize socket code better
1. Figure out best way to persist chat if you refresh, or leave and come back. maybe only save a certain # of messages, or for a certain amount of time
1. Add basic room functionality: Room player list, Room chat, etc
1. Improve how we figure the player list. The reason is the connection is randomly lost and immediately reconnected on a different socket, so we can't rely on the socket connections alone to tell what players we have. Currently we persist the  player in DB for only 30 seconds after an update. We update player on connect and on 25 second heartbeat. if the socket connection is lost for more than 30 seconds the player is deleted from db, but we are not aware of this deletion... need to set up some pub/sub?
1. And of course- the game...
