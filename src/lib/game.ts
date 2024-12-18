import { Timestamp } from "firebase/firestore";
import { randRange } from "./utils";

export enum GameStatus {
    BIDDING = "BIDDING",
    PLAYING = "PLAYING"
}

export type PlayerId = string;

/// roundResult[i] = the result for players[i] in that round
export type RoundResult = {
    [K: PlayerId]: {
        bid: number | null,
        won: number | null
    }
};

export type Player = {
    name: string,
    id: PlayerId
}

export class Game {
    readonly id: string;
    readonly createdTime: Timestamp;
    readonly players: Player[];
    readonly rounds: RoundResult[];
    readonly status: GameStatus;
    readonly initialDealer: PlayerId;

    constructor(id: string, createdTime: Timestamp, players: Player[], rounds: RoundResult[], status: GameStatus, initialDealer: PlayerId) {
        this.id = id;
        this.createdTime = createdTime;
        this.players = players;
        this.rounds = rounds;
        this.status = status;
        this.initialDealer = initialDealer;
    }

    static new(id: string, players: string[]) {
        return new Game(id, Timestamp.now(), players.map(name => ({ name, id: name })), [], GameStatus.BIDDING, players[randRange(0, players.length)]);
    }

    static fromJson(json: Record<string, unknown>, id: string) {
        try {
            const rounds = json.rounds as Record<string, RoundResult>;
            return new Game(
                id,
                json.createdTime as Timestamp,
                json.players as Player[],
                Array(Object.keys(rounds).length).fill(null).map((_, i) => rounds[i + ""]),
                json.status as GameStatus,
                json.initialDealer as PlayerId
            );
        } catch (e) {
            console.error(e);
            throw new Error(`Game data from server is invalid. (${e instanceof Error ? e.message : e})`);
        }
    }

    toJson() {
        // we convert arrays for rounds into a map for better firestore semantics
        // firestore arrays only support set operations for updates
        return {
            createdTime: this.createdTime,
            players: this.players,
            rounds: Object.fromEntries(this.rounds.map((round, i) => [i + "", round])),
            status: this.status,
            initialDealer: this.initialDealer
        };
    }

    /**
     * Returns the current round number.
     */
    protected currentRoundNoInsert(): number {
        for (let i = this.rounds.length - 1; i >= 0; i--) {
            if (isCompleteRound(this.rounds[i])) {
                return i + 1;
            }
        }
        return 0;
    }

    player(playerId: PlayerId): Player {
        return this.players[this.playerPosition(playerId)];
    }

    playerPosition(playerId: PlayerId): number {
        return this.players.findIndex(p => p.id === playerId);
    }

    playerAfter(playerId: PlayerId, n: number = 1): Player {
        const pos = this.playerPosition(playerId);
        return this.players[(pos + n) % this.players.length];
    }

    /**
     * Returns the current round number. If this does not exist in the game,
     * it will be created.
     */
    currentRound(): number {
        const round = this.currentRoundNoInsert();
        if (round >= this.rounds.length) {
            this.rounds.push(this.emptyRound());
        }
        return round;
    }

    currentDealer(): Player {
        return this.playerAfter(this.initialDealer, this.currentRound());
    }

    currentBidder(): Player | null {
        const firstBidder = this.playerAfter(this.currentDealer().id);
        for (let i = 0; i < this.players.length; i++) {
            const id = this.playerAfter(firstBidder.id, i).id;
            if (this.rounds[this.currentRound()][id].bid === null) {
                return this.player(id);
            }
        }
        return null;
    }

    disabledBid(): number | null {
        const round = this.currentRound();
        const bidder = this.currentBidder();
        if (bidder === null || bidder !== this.currentDealer()) {
            return null;
        }
        const otherBidsSum = Object.values(this.rounds[round]).reduce((sum, result) => sum + (result.bid ?? 0), 0);
        const disabledBid = (round + 1) - otherBidsSum;
        if (disabledBid < 0) {
            return null;
        }
        return disabledBid;
    }

    emptyRound(): RoundResult {
        return Object.fromEntries(this.players.map(p => [p.id, { bid: null, won: null }]));
    }
}
function isCompleteRound(round: RoundResult) {
    return Object.values(round).every(result => result.bid !== null && result.won !== null);
}

