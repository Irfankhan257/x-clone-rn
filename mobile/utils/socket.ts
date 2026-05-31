import { io } from "socket.io-client";

const SOCKET_URL = "https://x-clone-rn-production.up.railway.app";
// if auth token required
export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: false,
  
});