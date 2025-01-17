export const SCORING_FORMULA_OPTIONS = {
    "0, 1": (won: number, bid: number) => won !== bid ? 0 : 1,
    "n, n + 10": (won: number, bid: number) => won !== bid ? won : won + 10,
    "n, n^2 + n + 10": (won: number, bid: number) => won !== bid ? won : won * won + won + 10,
};

export type ScoringFormula = keyof typeof SCORING_FORMULA_OPTIONS;
