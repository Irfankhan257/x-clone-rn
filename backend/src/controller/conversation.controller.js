import { getAuth } from "@clerk/express";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";


const formatTime = (date) => {
  const diff = Date.now() - new Date(date).getTime();

  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);

  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;

  return `${Math.floor(hours / 24)}d`;
};



export const fetchConversationsForUser = async (req, res) => {
    const { userId } = getAuth(req);
     try {
    const currentUserId = userId;

    console.log("Fetching conversations for user:", currentUserId);

    const conversations = await Conversation.find({
      participants: currentUserId,
    }).sort({ updatedAt: -1 });

    console.log("Conversations found:", conversations.length);

    const result = await Promise.all(
      conversations.map(async (conv, index) => {
        // 1. find receiver
        const receiverId = conv.participants.find(
          (p) => p !== currentUserId
        );

        // 2. get receiver user info
        const receiver = await User.findOne({ clerkId: receiverId });
        console.log("Receiver found:", receiver ? receiver.username : "None");
        // 3. get messages
        const messagesRaw = await Message.find({
          $or: [
            { senderId: currentUserId, receiverId },
            { senderId: receiverId, receiverId: currentUserId },
          ],
        }).sort({ createdAt: 1 });

        // 4. format messages like your UI expects
        const messages = messagesRaw.map((msg, i) => ({
          id: i + 1,
          text: msg.text,
          fromUser: msg.senderId === currentUserId,
          timestamp: msg.createdAt,
          time: formatTime(msg.createdAt),
        }));

        // 5. build response like your sample
        return {
          id: index + 1,
          user: {
            id: receiverId,
            name: receiver?.firstName || "Unknown",
            username: receiver?.username || "",
            avatar:
              receiver?.profilePicture ||
              "https://via.placeholder.com/100",
            verified: receiver?.verified || false,
          },
          lastMessage: conv.lastMessage,
          time: formatTime(conv.updatedAt),
          timestamp: conv.updatedAt,
          messages,
        };
      })
    );

    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
}