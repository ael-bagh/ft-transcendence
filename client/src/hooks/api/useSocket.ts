import io from "socket.io-client";

const socket = io("ws://backend.transcendance.com/", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

(window as any).aymane_socket = socket;

export function useSocket() {
  const sendMessage = (message: Message, currentGroup: string) => {
    return new Promise((resolve, reject) => {
      if (message.message.trim() && currentGroup) {
        socket.emit("message", message, (message: Message, err: any) => {
          if (err) return reject(err);
          resolve(message);
        });
      }
    });
  };
  const sendFriendRequest = (object: { friend_login?: string }) => {
    return new Promise((resolve, reject) => {
      socket.emit(
        "add_friend_request",
        object,
        (object: { friend_login: string }, err: any) => {
          if (err) return reject(err);
          resolve(object);
        }
      );
    });
  };
  const acceptFriendRequest = (object: { sender_login: string }) => {
    return new Promise((resolve, reject) => {
      socket.emit("accept_friend_request", object, (object: any, err: any) => {
        if (err) return reject(err);
        resolve(object);
      });
    });
  };
  const deleteFriendRequest = (object: { sender_login: string }) => {
    return new Promise((resolve, reject) => {
      socket.emit("delete_friend_request", object, (object: any, err: any) => {
        if (err) return reject(err);
        resolve(object);
      });
    });
  };
  const deleteFriend = (object: { friend_login: string }) => {
    return new Promise((resolve, reject) => {
      socket.emit("delete_friend", object, (object: any, err: any) => {
        if (err) return reject(err);
        resolve(object);
      });
    });
  };
  const delete_sent_friend_request = (object: { receiver_login: string }) => {
    return new Promise((resolve, reject) => {
      socket.emit(
        "delete_sent_friend_request", object, (object: any, err: any) => {
          if (err) return reject(err);
          resolve(object);
        }
      );
    });
  };
  return { socket, sendMessage, sendFriendRequest, acceptFriendRequest, deleteFriendRequest, deleteFriend, delete_sent_friend_request };
}
