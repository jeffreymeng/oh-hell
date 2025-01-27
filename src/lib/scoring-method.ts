export const SCORING_METHODS: {
    name: string;
    formula: ScoringMethod;
    function: (won: number, bid: number) => number;
}[] = [
        {
            name: "Original",
            formula: "n, n^2 + n + 10",
            function: (won: number, bid: number) => won !== bid ? won : won * won + won + 10,
        },
        {
            name: "Richard's Variant",
            formula: "n, n^2 + 10",
            function: (won: number, bid: number) => won !== bid ? won : won * won + 10,
        },
        {
            name: "More Balanced",
            formula: "n, n + 10",
            function: (won: number, bid: number) => won !== bid ? won : won + 10,
        },
        {
            name: "Precision",
            formula: "0, 1",
            function: (won: number, bid: number) => won !== bid ? 0 : 1
        },
    ];
export const DEFAULT_SCORING_METHOD: ScoringMethod = "n, n^2 + n + 10";

export type ScoringMethod = string; // formula
