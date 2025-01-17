import { Timestamp } from "firebase/firestore";
import { randRange } from "./utils";
import { SCORING_FORMULA_OPTIONS, type ScoringFormula } from "./scoring-formula";

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
    readonly players: readonly Player[];
    readonly rounds: RoundResult[];
    readonly currentRound: number;
    readonly initialDealer: PlayerId;
    readonly scoringFormula: ScoringFormula;
    readonly tag: number;

    constructor(id: string, createdTime: Timestamp, players: readonly Player[], rounds: RoundResult[], currentRound: number, initialDealer: PlayerId, scoringFormula: ScoringFormula) {
        this.id = id;
        this.createdTime = createdTime;
        this.players = Object.freeze(players);
        this.rounds = rounds;
        this.currentRound = currentRound;
        this.initialDealer = initialDealer;
        this.scoringFormula = scoringFormula;
        this.tag = randRange(100000, 999999);
    }

    static new(id: string, players: string[], scoringFormula: ScoringFormula) {
        const mappedPlayers = players.map(name => ({ name, id: name }));
        return new Game(id, Timestamp.now(), mappedPlayers, [], 0, mappedPlayers[randRange(0, mappedPlayers.length)].id, scoringFormula);
    }

    static fromJson(json: Record<string, unknown>, id: string) {
        try {
            const rounds = json.rounds as Record<string, RoundResult>;
            if (!((json.scoringFormula as string) in SCORING_FORMULA_OPTIONS)) {
                throw new Error(`Invalid scoring formula`);
            }
            console.log("json", json.players)
            return new Game(
                id,
                json.createdTime as Timestamp,
                json.players as Player[],
                Array(Object.keys(rounds).length).fill(null).map((_, i) => rounds[i + ""]),
                json.currentRound as number,
                json.initialDealer as PlayerId,
                json.scoringFormula as ScoringFormula
            );
        } catch (e) {
            console.error(e);
            throw new Error(`Game data from server is invalid. (${e instanceof Error ? e.message : e})`);
        }
    }

    clone() {
        return new Game(this.id, this.createdTime, structuredClone(this.players), structuredClone(this.rounds), this.currentRound, this.initialDealer, this.scoringFormula);
    }

    toJson() {
        // we convert arrays for rounds into a map for better firestore semantics
        // firestore arrays only support set operations for updates
        return {
            createdTime: this.createdTime,
            players: this.players,
            rounds: Object.fromEntries(this.rounds.map((round, i) => [i + "", round])),
            currentRound: this.currentRound,
            initialDealer: this.initialDealer,
            scoringFormula: this.scoringFormula,
        };
    }

    /**
     * Returns a player by their id.
     */
    player(playerId: PlayerId): Player {
        return this.players[this.playerPosition(playerId)];
    }

    /**
     * Returns the zero-indexed position of the given player ID in the game.
     */
    playerPosition(playerId: PlayerId): number {
        return this.players.findIndex(p => p.id === playerId);
    }

    /**
     * Returns the player n positions after the given player.
     */
    playerAfter(playerId: PlayerId, n: number = 1): Player {
        const pos = this.playerPosition(playerId) + n;
        // support negative n
        const players = this.players.length;
        const newPos = ((pos % players) + players) % players;
        return this.players[newPos];
    }

    /**
     * Returns the round results for the specified round, or the
     * current round if not specified.
     */
    round(n?: number): RoundResult {
        if (n === undefined) {
            n = this.currentRound;
        }
        while (n >= this.rounds.length) {
            this.rounds.push(this.emptyRound());
        }
        return this.rounds[n];
    }

    /**
     * Returns the dealer for the current round.
     */
    currentDealer(): Player {
        return this.playerAfter(this.initialDealer, this.currentRound);
    }

    /**
     * Returns the first player to bid in the current round.
     */
    firstBidder(): Player {
        return this.playerAfter(this.currentDealer().id);
    }

    /**
     * Calculates the score for a given bid and number of tricks won.
     */
    calculateScore(won: number, bid: number) {
        return SCORING_FORMULA_OPTIONS[this.scoringFormula](won, bid);
    }

    /**
     * Returns the total score for a given player, up to the specified round.
     * (or all rounds if numRounds is negative)
     */
    playerScore(playerId: PlayerId, numRounds: number = -1) {
        return this.rounds.slice(0, numRounds < 0 ? this.currentRound : numRounds).reduce((sum, round) => sum + this.calculateScore(round[playerId].won ?? 0, round[playerId].bid ?? 0), 0);
    }

    /**
     * Returns the next player to bid in the current round (null if bidding is complete).
     */
    currentBidder(): Player | null {
        const firstBidder = this.playerAfter(this.currentDealer().id);
        for (let i = 0; i < this.players.length; i++) {
            const id = this.playerAfter(firstBidder.id, i).id;
            if (this.round()[id].bid === null) {
                return this.player(id);
            }
        }
        return null;
    }

    /**
     * Returns the number that the last player cannot bid in the current round, if any.
     */
    disabledBid(): number | null {
        const bidder = this.currentBidder();
        if (bidder === null || bidder !== this.currentDealer()) {
            return null;
        }
        const otherBidsSum = Object.values(this.round(this.currentRound)).reduce((sum, result) => sum + (result.bid ?? 0), 0);
        const disabledBid = (this.currentRound + 1) - otherBidsSum;
        if (disabledBid < 0) {
            return null;
        }
        return disabledBid;
    }

    /**
     * Creates an empty round result for the current game.
     */
    emptyRound(): RoundResult {
        return Object.fromEntries(this.players.map(p => [p.id, { bid: null, won: null }]));
    }

    /**
     * Returns the number of total rounds in the game before it is over. 
     */
    totalRounds(): number {
        return Math.min(13, Math.floor(51 / this.players.length));
    }

    /**
     * Returns true if the game is over.
     */
    isOver(): boolean {
        return this.currentRound + 1 > this.totalRounds();
    }
}