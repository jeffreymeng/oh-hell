import { FirebaseError, initializeApp } from "firebase/app";
import { doc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";
import { customAlphabet } from "nanoid";

// todo: maybe use sqids or some other counter + hash based method
const ID_ALPHABET = "123456789abcdefghijkmnopqrstuvwxyz"; // excludes l/0 (similiar to I/O)
const nanoid = customAlphabet(ID_ALPHABET, 8);

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
export const db = getFirestore(app);

export enum GameStatus {
    BIDDING = "BIDDING",
    PLAYING = "PLAYING"
}

export async function newGame(players: string[]) {
    const MAX_RETRIES = 10;
    for (let i = 0; i < MAX_RETRIES; i++) {
        const id = nanoid();
        try {
            await setDoc(doc(db, "games", id), {
                created_time: serverTimestamp(),
                players: players.map(name => ({
                    name,
                    points: 0
                })),
                history: [],
                round: 1,
                status: GameStatus.BIDDING
            });
            return id;
        } catch (e) {
            if (e instanceof FirebaseError && e.code === "permission-denied") {
                // id is in use
                continue;
            }
            throw e;
        }
    }
    throw new Error("Unable to generate game. Please try again later (code: exceeded-max-create-retries)");
}

