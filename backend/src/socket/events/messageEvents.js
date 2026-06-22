import Message from "../../models/message.model.js";
import Conversation from "../../models/conversation.model.js";

const messageEvents = (io, socket) => {
  socket.on("send_message", async (data) => {
    try {
      const senderId = socket.user.userId;
      const { receiverId, text } = data;

      if (!receiverId || !text) {
        return socket.emit("error_message", {
          message: "Missing fields",
        });
      }

      // 1. Save message
      const newMessage = await Message.create({
        senderId,
        receiverId,
        text,
        status: "sent",
      });      

      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, receiverId],
          lastMessage: text,
          lastMessageSender: senderId,
        });
      } else {
        conversation.lastMessage = text;
        conversation.lastMessageSender = senderId;
        conversation.updatedAt = new Date();
        await conversation.save();
      }

        console.log("Sender:", senderId);
        console.log("Receiver:", receiverId);

        console.log(
          "Receiver room exists:",
          io.sockets.adapter.rooms.has(receiverId)
        );

      // 5. Emit message to receiver room
      io.to(receiverId).emit("receive_message", newMessage);

      // 6. Emit updated conversation to BOTH users
      io.to(senderId).emit("conversation_updated", conversation);
      io.to(receiverId).emit("conversation_updated", conversation);

    } catch (error) {
      console.log(error);

      socket.emit("error_message", {
        message: "Failed to send message",
      });
    }
  });
};

export default messageEvents;