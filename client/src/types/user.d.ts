interface Count {
  friends: number;
  games_lost: number;
  games_won: number;
  friend_requests: number;
}

interface User {
  user_id: string;
  login: string;
  nickname: string;
  password: string;
  email: string;
  avatar: string;
  status: string;
  creation_date: Date;
  is_banned: boolean;
  KDA: number;
  _count: Count;
  player_level: number;
  two_factor_auth_boolean?: boolean;
}

interface GamePlayer {
  login: string;
  nickname: string;
  avatar: string;
}

interface History {
  game_id: string;
  game_date: Date;
  game_winner_login: string;
  game_loser_login: string;
  game_winner_score: number;
  game_loser_score: number;
  game_winner: GamePlayer;
  game_loser: GamePlayer;
}

interface UserLeaderboard {
  id: number;
  avatar: string;
  name: string;
  experience: number;
  kda: number;
  winrate: number;
  rank: number;
}

interface Relation {
  is_request_sent: boolean;
  is_request_received: boolean;
  is_friend: boolean;
  is_blocked: boolean;
  is_self: boolean;
}
// model User {
// 	user_id Int @id @default(autoincrement())
// 	login String
// 	nickname String
// 	password String
// 	avatar String?
// 	status Status @default(OFFLINE)
// 	two_factor_auth String?
// 	creation_date DateTime?
// 	current_lobby String?
// 	is_banned Boolean?
// 	KDA	Decimal?
// 	games_lost Game[] @relation("winner")
// 	games_won Game[] @relation ("loser")
// 	achievements Achievement[] @relation("user_achievements")
// 	friends User[] @relation("friends")
// 	friends_relation User[] @relation("friends")
// 	friend_requests User[] @relation("friend_request")
// 	friends_request_relation User[] @relation("friend_request")
// 	friend_requests_sent User[] @relation("friend_request_sent")
// 	friends_request_sent_relation User[] @relation("friend_request_sent")
// 	rooms_created Room[] @relation("room_creator")
// 	messages_sent Message[] @relation("message_user")
// 	rooms_member Room[] @relation("room_user")
// 	banned_from Room[] @relation("room_banned_users")
// 	admin_in Room[] @relation("room_admins")
// 	player_level Float?
// 	winrate Float?

// 	@@unique([login])
// 	@@unique([nickname])
// }

// model Game {
// 	game_id Int @id @default(autoincrement())
// 	game_date DateTime
// 	game_winner_id Int
// 	game_loser_id Int
// 	game_winner User? @relation("winner", fields: [game_winner_id], references: [user_id])
// 	game_loser User? @relation("loser", fields: [game_loser_id], references: [user_id])
// 	game_winner_score Int?
// 	game_loser_score Int?
// }

// model Achievement {
// 	achievements_id Int @id @default(autoincrement())
// 	achievement_name Achievements_name
// 	achievement_image String
// 	achievement_user User[] @relation("user_achievements")
// }

// model Room {
// 	room_id Int @id @default(autoincrement())
// 	room_password String?
// 	room_name String
// 	room_private Boolean
// 	room_creation_date DateTime
// 	room_creator_id Int
// 	room_creator User @relation("room_creator", fields: [room_creator_id], references: [user_id])
// 	room_admins User[] @relation("room_admins")
// 	room_messages Message[] @relation("message_room")
// 	room_users User[] @relation("room_user")
// 	room_banned_users User[] @relation("room_banned_users")
// }

// model Message {
// 	message_id Int @id @default(autoincrement())
// 	message_content String
// 	message_time DateTime
// 	message_user_id Int
// 	message_user User @relation("message_user", fields: [message_user_id], references: [user_id])
// 	message_room_id Int
// 	message_room Room @relation("message_room", fields: [message_room_id], references: [room_id])
// }

// enum Status {
// 	OFFLINE
// 	ONLINE
// 	INGAME
// }

// enum Achievements_name {
// 	TheAddict
// 	WinStreak
// }
