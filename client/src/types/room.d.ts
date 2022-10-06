interface Room {
  room_id: string;
  room_password: string;
  room_name: string;
  room_private: boolean;
  room_direct_message: boolean;
  room_creation_date: Date;
  room_creator_login: string;
  room_creator: User;
  room_admins: User[];
  room_messages: Message[];
  room_users: User[];
  room_banned_users: User[];
  unread_message_count?: number;
}
