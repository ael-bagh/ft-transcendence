
interface Game {
    winner: string;
    loser: string;
    winner_score: number;
    loser_score: number;
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
