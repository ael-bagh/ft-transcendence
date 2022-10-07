interface Message {
  message_content: string;
  message_id: string | number;
  message_room_id: string | number;
  message_time: string;
  message_type: "USER";
  message_user_login: string;
}
