import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD3vtSQO3Q2YR4jTsDp4i96fdNDmy7CZQU",
    authDomain: "oh-hell-scorekeeper.firebaseapp.com",
    projectId: "oh-hell-scorekeeper",
    storageBucket: "oh-hell-scorekeeper.firebasestorage.app",
    messagingSenderId: "457072011172",
    appId: "1:457072011172:web:dd58abca7d3a6147494331",
    measurementId: "G-878RJ0PKYJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
