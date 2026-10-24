import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDqmVxziFacAoNEAaPplaeEstPm8P2TOTw",
  authDomain: "sentinel-firewall-145b3.firebaseapp.com",
  projectId: "sentinel-firewall-145b3",
  storageBucket: "sentinel-firewall-145b3.firebasestorage.app",
  messagingSenderId: "848873935661",
  appId: "1:848873935661:web:9d1bd34c0729fc48f679a4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);