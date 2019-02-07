var io = require('socket.io')();

io.on('connection', function (socket) {
  console.log('A user connected');
  
  socket.emit('news', { hello: 'world' });
  
  socket.on('my other event', function (data) {
    console.log(data);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

module.exports = io;