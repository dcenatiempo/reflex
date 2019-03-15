import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth'

// firebase init goes here
const config = {
	apiKey: "AIzaSyD_eWOGyoVpMj677AHrzi4WwT5Io_jLzdQ",
    authDomain: "reflex-4d023.firebaseapp.com",
    databaseURL: "https://reflex-4d023.firebaseio.com",
    projectId: "reflex-4d023",
    storageBucket: "reflex-4d023.appspot.com",
    messagingSenderId: "197376390708"
};
firebase.initializeApp(config);
// firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

// firebase utils
const db = firebase.firestore();
const auth = firebase.auth();

// firebase collections
const players = db.collection('players');
const rooms = db.collection('rooms');
const chat = db.collection('chat');

export default {
    db,
    auth,
    players,
    rooms,
    chat,
}