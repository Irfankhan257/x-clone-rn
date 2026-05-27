import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [String], // Clerk userIds
      required: true,
    },

    lastMessage: {
      type: String,
      default: "",
    },

    lastMessageSender: {
      type: String,
      default: "",
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model(
  "Conversation",
  conversationSchema
);

export default Conversation;