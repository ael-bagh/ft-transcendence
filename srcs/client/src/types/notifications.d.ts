interface Notification {
  notification_id: number;
  notification_type: string;
  notification_date: string;
  notification_receiver_login: string;
  notification_sender_login: string;
  notification_seen: boolean;
  notification_payload?: any;
}
