export interface User {
    id: number;
    name: string;
    avatar: string;
    email: string;
    password: string;
    created_at: Date;
    updated_at: Date;
};

export interface UserLeaderboard {
    id: number;
    avatar: string;
    name: string;
    experience: number;
    kda: number;
    winrate: number;
    rank: number;
};



