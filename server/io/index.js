const io = require('socket.io')();
const db = require('../db').get();
const ObjectID = require('mongodb').ObjectID;


io.on('connection', function (socket) {
  let playerId = socket.handshake.query.playerId;
  let currentRoom = socket.handshake.query.currentRoom;
  playerId = 'null' == playerId ? null : ObjectID(playerId);
  currentRoom = 'null' == currentRoom ? null : currentRoom;

  if (playerId) {
    // update timestamp
    db.players.findOneAndUpdate({ _id: playerId }, { $set: { updatedAt: new Date(), socketId: socket.id} })
    .then (res => {
      if (0 == res.lastErrorObject.updatedExisting) {
        socket.emit('delete-player');
        // get all players
        db.players.find().toArray().then(allPlayers => {
          socket.emit('players-update', allPlayers);
        });
      } else {

        if (currentRoom) {
          console.log('Re-entering Room: ' + currentRoom);
      
          let sockets = Object.keys(io.sockets.clients().sockets);
          let rooms = Object.keys(io.sockets.adapter.rooms);
          let beforeRooms = rooms.filter(room => !sockets.includes(room));
      
          socket.join([currentRoom], (err) => {
            io.in(currentRoom).clients((err, clients) => {
              db.players.find({ socketId: {$in: clients } }).toArray()
                .then (players => {
                  io.to(currentRoom).emit('room-players-update', players);
                });
              });
            console.log('re-entering- - - - - - - - - -')
      
            let sockets = Object.keys(io.sockets.clients().sockets);
            let rooms = Object.keys(io.sockets.adapter.rooms);
            let afterRooms = rooms.filter(room => !sockets.includes(room));
      
            let dif = roomDif(beforeRooms, afterRooms);
            if (dif) {
              console.log('New Room: ' + dif.join(', '));
              io.sockets.emit('rooms-update', afterRooms);
            }
      
          });
        }


      }
    }).catch( err => {console.log(err)});
  }

  console.log('A user connected: '+ playerId + ', ' + socket.id);
  
  // get all players
  db.players.find().toArray().then(allPlayers => {
    socket.emit('players-update', allPlayers);
  });
  
  socket.conn.on('heartbeat', function() {
    console.log('heartbeat');
    if (!playerId) return;
    // update timestamp
    db.players.updateOne({ _id: playerId }, { $set: { updatedAt: new Date()} })
    .then (res => {
      if (0 == res.matchedCount) {
        socket.emit('delete-player');
        // get all players
        db.players.find().toArray().then(allPlayers => {
          socket.emit('players-update', allPlayers);
        });
      }
    }).catch( err => {console.log(err)});
  });

  socket.on('new-player', (name) => {
    console.log('New player: ' + name);

    let player = {
      name,
      wins: 0,
      gamesPlayed: 0,
      updatedAt: new Date(),
      socketId: socket.id
    }

    // add player to database
    db.players.insertOne(player).then( (res) => {
      playerId = res.insertedId;
      // send player their player id
      socket.emit('add-player', res.insertedId);
      
      // get updated player list
      db.players.find().toArray().then(allPlayers => {
        // send player list to all players
        io.sockets.emit('players-update', allPlayers);
      }); 
    });
  });

  socket.on('delete-player', (playerId) => {
    // remove player from players & rooms collection
    db.players.deleteOne({_id: ObjectID(playerId)}, (err, res) => {
      if(err) console.log(err);
      // console.log(res)
      console.log('player deleted');
      // get updated player list
      db.players.find().toArray().then(allPlayers => {
        // send playerlist to all players
        io.sockets.emit('players-update', allPlayers);
      }); 
    });
  });

  socket.on('enter-room', (room) => {
    currentRoom = room;
    console.log('Entering Room: ' + room);

    let sockets = Object.keys(io.sockets.clients().sockets);
    let rooms = Object.keys(io.sockets.adapter.rooms);
    let beforeRooms = rooms.filter(room => !sockets.includes(room));
    
    socket.join([room], (err) => {
      io.in(room).clients((err, clients) => {
        db.players.find({ socketId: {$in: clients } }).toArray()
          .then (players => {
            io.to(room).emit('room-players-update', players);
          });
        });
      console.log('entering - - - - - - - - - -')

      let sockets = Object.keys(io.sockets.clients().sockets);
      let rooms = Object.keys(io.sockets.adapter.rooms);
      let afterRooms = rooms.filter(room => !sockets.includes(room));

      let dif = roomDif(beforeRooms, afterRooms);
      if (dif) {
        console.log('New Room: ' + dif.join(', '));
        io.sockets.emit('rooms-update', afterRooms);
      }

    });
  });

  socket.on('leave-room', (room) => {
    console.log('Leaving Room: ' + room);
    currentRoom = null;

    let sockets = Object.keys(io.sockets.clients().sockets);
    let rooms = Object.keys(io.sockets.adapter.rooms);
    let beforeRooms = rooms.filter(room => !sockets.includes(room));
    
    socket.leave(room, (err) => {
      io.in(room).clients((err, clients) => {
        db.players.find({ socketId: {$in: clients } }).toArray()
          .then (players => {
            io.to(room).emit('room-players-update', players);
          });
        });
      console.log('leaving - - - - - - - - - -')

      let sockets = Object.keys(io.sockets.clients().sockets);
      let rooms = Object.keys(io.sockets.adapter.rooms);
      let afterRooms = rooms.filter(room => !sockets.includes(room));

      let dif = roomDif(afterRooms, beforeRooms);
      if (dif) {
        console.log('Destroy Room: ' + dif.join(', '));
        io.sockets.emit('rooms-update', afterRooms);
      }

    });
  });

  socket.on('request-rooms', () => {
    let sockets = Object.keys(io.sockets.clients().sockets);
    let rooms = Object.keys(io.sockets.adapter.rooms);
    
    // an array or room names
    rooms = rooms.filter(room => !sockets.includes(room));

    socket.emit('rooms-update', rooms);
  });

  socket.on('send-arena-chat', message => {
    console.log('sending message!!!')
    // let sockets = Object.keys(io.sockets.clients().sockets);
    // console.log(sockets);
    io.sockets.emit('update-arena-chat', {message: message, playerId});
  });

  socket.on('send-room-chat', payload => {
    io.to(payload.room).emit('update-room-chat', {message: payload.message, from: playerId});
  });

  socket.on('disconnect', () => {
    console.log('user disconnected: ' + playerId);

    // remove player from players & rooms collection
    // db.players.deleteOne({_id: playerId}, (err, res) => {
    //   if(err) console.log(err);
    //   console.log('player deleted');
    //   // get updated player list
    //   db.players.find().toArray().then(allPlayers => {
    //     // send playerlist to all players
    //     io.sockets.emit('players-update', allPlayers);
    //   }); 
    // });
  });

});

module.exports = io;

// helpers
function roomDif(before, after) {
  // TODO: consider refactor
  let dif = [...after].filter(x => !before.includes(x));

  if (dif.length === 0)
    return null;
  return dif;
}
