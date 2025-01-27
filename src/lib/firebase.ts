import { FirebaseError, initializeApp } from "firebase/app";
import { doc, getFirestore, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { customAlphabet } from "nanoid";
import { Game, type PlayerId } from "./game";
import type { ScoringFormula, ScoringMethod } from "./scoring-method";

const ID_ALPHABET = "123456789abcdefghijkmnopqrstuvwxyz"; // excludes l/0 (similiar to I/O)


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
export async function newGame(players: string[], scoringMethod: ScoringMethod) {
    const MAX_RETRIES_PER_LENGTH = 5;
    const MAX_LENGTH = 9;
    for (let length = 6; length <= MAX_LENGTH; length++) {
        const nanoid = customAlphabet(ID_ALPHABET, length);

        for (let i = 0; i < MAX_RETRIES_PER_LENGTH; i++) {
            const id = nanoid();
            try {
                const gameJson = Game.new(id, players, scoringMethod).toJson();
                (gameJson as Record<string, unknown>).createdTime = serverTimestamp();
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
    }
    throw new Error("Unable to generate game. Please try again later (code: exceeded-max-create-retries)");
}

export async function updateBid(game: Game, roundNum: number, playerId: PlayerId, bid: number | null) {
    const gameClone = game.clone();
    gameClone.round(roundNum)[playerId].bid = bid;
    await updateDoc(doc(db, "games", gameClone.id), {
        rounds: gameClone.rounds
    });
}

export async function updateTricksWon(game: Game, roundNum: number, playerId: PlayerId, tricksWon: number | null) {
    const gameClone = game.clone();
    gameClone.round(roundNum)[playerId].won = tricksWon;
    await updateDoc(doc(db, "games", gameClone.id), {
        rounds: gameClone.rounds
    });
}

export async function updateCurrentRound(game: Game, currentRound: number) {
    await updateDoc(doc(db, "games", game.id), {
        currentRound: currentRound
    });
}

export class GameNotFoundError extends Error {
    constructor() {
        super("Game not found");
        this.name = "GameNotFonundError";
    }
}

/**
 * Attaches a callback to updates on the game. Returns a function to call to unsubscribe.
 */
export function onGameUpdate(gameId: string, onUpdate: (data: Game) => void, onError: (e: unknown) => void): () => void {
    const unsub = onSnapshot(doc(db, "games", gameId), (doc) => {
        try {
            if (!doc.exists()) {
                throw new GameNotFoundError();
            }
            console.log("firebasedirect", doc.data().players.map((p) => p.id).join(','));
            const g = Game.fromJson(doc.data() as Record<string, unknown>, gameId);
            console.log("firebase direct game players", g.players.map((p) => p.id).join(','));
            onUpdate(g);
        } catch (e) {
            onError(e);
        }
    });
    return unsub;
}

