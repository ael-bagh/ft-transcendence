
interface Game {
    winner: string;
    loser: string;
    winner_score: number;
    loser_score: number;
}

interface Sett {
    set_Games: Game[];
    set_id: string;
    set_winner_login: string;
    set_loser_login: string;
    set_winner_score: number;
    set_loser_score: number;
    set_type: "ONE" | "NORMAL" | "RANKED";
}

interface GameData {
    game_id: string;
    game_type: string;
    games: Game[];
    winner: string;
    loser: string;
    winnner_score: number;
    loser_score: number;
}

interface GameInv {
    target_login: string;
    mode: "ONE" | "NORMAL" | "RANKED";
  }
