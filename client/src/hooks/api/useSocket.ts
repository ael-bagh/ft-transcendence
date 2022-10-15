import sock from "../../lib/socket";
import { Body } from "matter-js";

const socket = sock;

(window as any).aymane_socket = socket;

socket.on("exception", (data: any) => {
  console.log("exception", data);
});

export function useSocket() {
  const relation = (object: { target_login?: string }) => {
    return new Promise((resolve, reject) => {
        socket.emit("relationship", object, (obj: any, err: any) => {
          if (err) return reject(err);
          resolve(obj);
        });
      }
    );
  };
  const sendMessage = (message: Message) => {
    return new Promise((resolve, reject) => {
      if (message.message_content !== "") {
        socket.emit(
          "send_user_message",
          message,
          (message: Message, err: any) => {
            if (err) return reject(err);
            resolve(message);
          }
        );
      }
    });
  };
  // human relationships are just like sockets...so complicated
  const sendFriendRequest = (object: { target_login?: string }) => {
    return new Promise((resolve, reject) => {
      socket.emit("add_friend_request", object, (obj: any) => {
        resolve(obj?.isFriend);
      });
    });
  };
  const acceptFriendRequest = (object: { target_login?: string }) => {
    return new Promise((resolve, reject) => {
      socket.emit("accept_friend_request", object);
      socket.once("friend_request_accepted", (obj, err) => {
        if (err) return reject(err);
        resolve(obj);
      });
    });
  };
  const deleteFriendRequest = (object: { target_login?: string }) => {
    return new Promise((resolve, reject) => {
      socket.emit("delete_friend_request", object);
      socket.once("decline_friend_request", (obj, err) => {
        if (err) return reject(err);
        resolve(obj);
      });
    });
  };
  const deleteFriend = (object: { target_login?: string }) => {
    return new Promise((resolve, reject) => {
      socket.emit("delete_friend", object, (obj: any, err: any) => {
        if (err) return reject(err);
        resolve(obj);
      });
    });
  };
  const deleteSentFriendRequest = (object: { target_login?: string }) => {
    return new Promise((resolve, reject) => {
      socket.emit("delete_sent_friend_request", object);
      socket.once("cancel_friend_request", (obj, err) => {
        if (err) return reject(err);
        resolve(obj);
      });
    });
  };
  const blockUser = (object: { target_login?: string }) => {
    return new Promise((resolve, reject) => {
      socket.emit("block_user", object);
      socket.once("blocked", (obj, err) => {
        if (err) return reject(err);
        resolve(obj);
      });
    });
  };
  const unblockUser = (object: { target_login?: string }) => {
    return new Promise((resolve, reject) => {
      socket.emit("unblock_user", object);
      socket.once("unblocked", (obj, err) => {
        if (err) return reject(err);
        resolve(obj);
      });
    });
  };
  const queueUp = (mode: 'ONE' | 'NORMAL' | 'RANKED') => {
    return new Promise((resolve, reject) => {
      socket.emit("join_game_queue", { mode });
      socket.once("accept_game", (data, err) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  };

  const quitQueue = (mode: 'ONE' | 'NORMAL' | 'RANKED') => {
    return new Promise((resolve, reject) => {
      socket.emit("quit_queue", { mode });
      socket.once("queue_quitted", (data, err) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  };
  const acceptGame = (obj:{isAccepted: boolean}) => {
    return new Promise((resolve, reject) => {
      socket.emit("accept_response", obj);
      socket.on("game_accepted", (data, err) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  };

  const gameInv = () => {
    return new Promise((resolve, reject) => {
      socket.emit("join_game_invit");
      socket.once("match_found", (data, err) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  };
  const Move = (m :number) => {
    socket.emit('move', m);
  };
  const Correction = (bar1: Body, bar2 : Body, myball: Body, score1: React.Dispatch<React.SetStateAction<number>>, score2: React.Dispatch<React.SetStateAction<number>>) => {
    socket.on('correction', (bar_1: [number, number], bar_2: [number, number], ball: [number, number], score :[number, number]) => {
      Body.setPosition(bar1, {x: bar_1[0], y: bar_1[1]});
      Body.setPosition(bar2, {x: bar_2[0], y: bar_2[1]});
      Body.setPosition(myball, {x: ball[0], y: ball[1]});
      score1(score[0]);
      score2(score[1]);
    });
  }
  const CorrectionOff = () => {
    socket.off('correction');
  }
  return {
    socket,
    sendMessage,
    sendFriendRequest,
    acceptFriendRequest,
    blockUser,
    unblockUser,
    deleteFriendRequest,
    deleteFriend,
    deleteSentFriendRequest,
    relation,
    queueUp,
    gameInv,
    Move,
    Correction,
    CorrectionOff,
    acceptGame,
    quitQueue
  };
}
