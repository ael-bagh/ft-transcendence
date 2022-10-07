import io from "socket.io-client";

const sock = io("ws://backend.transcendance.com/", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

export default sock;