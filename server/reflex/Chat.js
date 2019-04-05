const Player = require('./Player');
// const { arrayDif } = require('../bin/helpers');
const { emit } = require('../io/events');

let io;

const injectIo = function(ioServer) {
  io = ioServer;
}
const MAX_CHAT_LENGTH = 10;

const Chat = function(roomName) {
  this.room = roomName;
  this.chat = [];

  this.postChat = function({ message, userId }) {
    console.log(message)
    let newMessage = {
      message,
      userId,
      timestamp: new Date(),
    };
    console.log(newMessage)
    let updatedChat = this.chat.concat(newMessage);

    // if the thread is too big, truncate it
    updatedChat = updatedChat.length <= MAX_CHAT_LENGTH ? updatedChat : updatedChat.slice(1); 

    this.chat = updatedChat;
    return Promise.resolve(this.chat);
  }
}

module.exports = { Chat, injectIo };