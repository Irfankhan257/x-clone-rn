import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import { ENV } from "../config/env.js";

import socketAuth from "./socketAuth.js";

import messageEvents from "./events/messageEvents.js";
import mongoose from "mongoose";



const socketServer = http.createServer();

const io = new Server(socketServer, {
  cors: {
    origin: "*",
  },
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Socket DB connected"))
  .catch(err => console.log(err));

io.use(socketAuth);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.user.userId);
    
  messageEvents(io, socket);

});

const PORT = process.env.PORT || 4000;

socketServer.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});