import io from "socket.io-client";

const sock = io(import.meta.env.VITE_WEBSOCKET_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

export default sock;
