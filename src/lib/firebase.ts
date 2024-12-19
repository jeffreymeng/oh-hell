import { FirebaseError, initializeApp } from "firebase/app";
import { doc, getFirestore, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { customAlphabet } from "nanoid";
import { Game, type PlayerId } from "./game";

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


/**
 * Creates a new game with the provided list of player names.
 */
export async function newGame(players: string[]) {
    const MAX_RETRIES = 10;
    for (let i = 0; i < MAX_RETRIES; i++) {
        const id = nanoid();
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const gameJson: any = Game.new(id, players).toJson();
            gameJson.createdTime = serverTimestamp();
            await setDoc(doc(db, "games", id), gameJson);
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

export async function updateBid(game: Game, roundNum: number, playerId: PlayerId, bid: number | null) {
    game.round(roundNum)[playerId].bid = bid;
    await updateDoc(doc(db, "games", game.id), {
        rounds: game.rounds
    });
}

export async function updateTricksWon(game: Game, roundNum: number, playerId: PlayerId, tricksWon: number) {
    console.log("updateTricksWon", game.round(roundNum), playerId, tricksWon);
    game.round(roundNum)[playerId].won = tricksWon;
    await updateDoc(doc(db, "games", game.id), {
        rounds: game.rounds
    });
}

/**
 * Attaches a callback to updates on the game. Returns a function to call to unsubscribe.
 */
export function onGameUpdate(gameId: string, onUpdate: (data: Game) => void, onError: (e: unknown) => void): () => void {
    const unsub = onSnapshot(doc(db, "games", gameId), (doc) => {
        try {
            onUpdate(Game.fromJson(doc.data() as Record<string, unknown>, gameId));
        } catch (e) {
            onError(e);
        }
    });
    return unsub;
}

