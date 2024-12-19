import { Timestamp } from "firebase/firestore";
import { randRange } from "./utils";

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
    readonly initialDealer: PlayerId;


    constructor(id: string, createdTime: Timestamp, players: Player[], rounds: RoundResult[], initialDealer: PlayerId) {
        this.id = id;
        this.createdTime = createdTime;
        this.players = players;
        this.rounds = rounds;
        this.initialDealer = initialDealer;
    }

    static new(id: string, players: string[]) {
        return new Game(id, Timestamp.now(), players.map(name => ({ name, id: name })), [], players[randRange(0, players.length)]);
    }

    static fromJson(json: Record<string, unknown>, id: string) {
        try {
            const rounds = json.rounds as Record<string, RoundResult>;
            return new Game(
                id,
                json.createdTime as Timestamp,
                json.players as Player[],
                Array(Object.keys(rounds).length).fill(null).map((_, i) => rounds[i + ""]),
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
            initialDealer: this.initialDealer
        };
    }


    player(playerId: PlayerId): Player {
        return this.players[this.playerPosition(playerId)];
    }

    playerPosition(playerId: PlayerId): number {
        return this.players.findIndex(p => p.id === playerId);
    }

    playerAfter(playerId: PlayerId, n: number = 1): Player {
        const pos = this.playerPosition(playerId) + n;
        // support negative n
        const players = this.players.length;
        const newPos = ((pos % players) + players) % players;
        return this.players[newPos];
    }

    /**
     * Returns the current round number.
     */
    currentRoundNumber(): number {
        for (let i = this.rounds.length - 1; i >= 0; i--) {
            if (isCompleteRound(this.round(i))) {
                return i + 1;
            }
        }
        return 0;
    }

    round(n: number): RoundResult {
        while (n >= this.rounds.length) {
            this.rounds.push(this.emptyRound());
        }
        return this.rounds[n];
    }

    currentDealer(): Player {
        return this.playerAfter(this.initialDealer, this.currentRoundNumber());
    }

    currentBidder(): Player | null {
        const firstBidder = this.playerAfter(this.currentDealer().id);
        for (let i = 0; i < this.players.length; i++) {
            const id = this.playerAfter(firstBidder.id, i).id;
            if (this.round(this.currentRoundNumber())[id].bid === null) {
                return this.player(id);
            }
        }
        return null;
    }

    disabledBid(): number | null {
        const roundNum = this.currentRoundNumber();
        const bidder = this.currentBidder();
        if (bidder === null || bidder !== this.currentDealer()) {
            return null;
        }
        const otherBidsSum = Object.values(this.round(roundNum)).reduce((sum, result) => sum + (result.bid ?? 0), 0);
        const disabledBid = (roundNum + 1) - otherBidsSum;
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

