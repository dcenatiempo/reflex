const admin = require('firebase-admin');
const { emit } = require('../io/events');
const reflex = require('../reflex');

const state = {
    db: null,
    rooms: null,
    players: null,
};

exports.init = (io) => {
    const options = {
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail:  process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    };
    
    admin.initializeApp(options);

    state.db = admin.firestore();

    initObservers(io);
}

exports.get = () => state;

const initObservers = (io) => {
    const roomsCollection = state.db.collection('rooms');
    const playersCollection = state.db.collection('players');
    const chatCollection = state.db.collection('chat');

    roomsCollection.onSnapshot(roomsSnapshot => {
        console.count(`Received room snapshot`);
        
        // Handle games
        roomsSnapshot.docChanges().forEach(change => {
            let room = change.doc.data();
            if (change.type === 'added')
                reflex.createGameRoom(room.name, room.players).then( game => { 
                    console.log('emiting: game-object to ' + room.name)
                    io.to(room.name).emit('game-object', game)
                });
            if (change.type === 'modified')
                reflex.setPlayers(room.name, room.players).then( game => io.to(room.name).emit('game-object', game));
            if (change.type === 'removed')
                reflex.destroyGameRoom(room.name).then( () => io.to(room.name).emit('game-object', {} ));
        });

        // emit game data to clients
        state.rooms = [];
        roomsSnapshot.forEach(doc => {
            state.rooms.push(doc.data())
        });
        io.sockets.emit(emit.UPDATE_ROOM_LIST, state.rooms);
    }, err => {
        console.log(`Encountered error: ${err}`);
    });

    // TODO: Only return recent players?
    //       Delete old players and their Users?
    playersCollection.onSnapshot(playersSnapshot => {
        console.count(`Received players snapshot`);
        state.players = [];
        playersSnapshot.forEach(doc => {
            state.players.push(doc.data())
        });
        io.sockets.emit(emit.UPDATE_PLAYER_LIST, state.players);
    }, err => {
        console.log(`Encountered error: ${err}`);
    });

    chatCollection.onSnapshot(chatSnapshot => {
        console.count(`Received chat snapshot`);
        chatSnapshot.docChanges().forEach(change => {
            let data = change.doc.data();
            if (change.type === 'added' || change.type === 'modified') {
                if ('arena' === data.room ) {
                    io.sockets.emit(emit.UPDATE_ARENA_CHAT, data.chat);
                }
                else {
                    io.to(data.room).emit(emit.UPDATE_ROOM_CHAT, data.chat);
                }
            }
            if (change.type === 'removed') {
                console.log('removed')
                // TODO: should this be differente than above?
                if ('arena' === data.room) io.sockets.emit(emit.UPDATE_ARENA_CHAT, data.chat);
                else io.to(data.room).emit(emit.UPDATE_ROOM_CHAT, data.chat);
            }
        });
    }, err => {
        console.log(`Encountered error: ${err}`);
    });
}

