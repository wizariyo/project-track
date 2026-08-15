// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAdPNa0ofPRhMVgcwo3ZRMGSOeJ6_b4FCo",
  authDomain: "protrack-51ca3.firebaseapp.com",
  projectId: "protrack-51ca3",
  storageBucket: "protrack-51ca3.firebasestorage.app",
  messagingSenderId: "202583626330",
  appId: "1:202583626330:web:9160f4b6907d453aae3e63",
  measurementId: "G-LCVEP1CK9E"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage ? firebase.storage() : null;

window.db = db;
window.auth = auth;
