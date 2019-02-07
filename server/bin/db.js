
const MongoClient = require('mongodb').MongoClient;

const state = {
  db: null,
  rooms: null,
  users: null,
}
const options = { useNewUrlParser: true };

exports.connect = function(url, done) {
  if (state.db) return done()
  MongoClient.connect(url, options, function(err, db) {
    if (err) return done(err)
    state.db = db.db('reflex');
    state.rooms = state.db.collection('rooms');
    state.users = state.db.collection('users');
    done()
  })
}

exports.get = function() {
  return state;
}

exports.close = function(done) {
  if (state.db) {
    state.db.close(function(err, result) {
      state.db = null
      state.mode = null
      done(err)
    })
  }
}