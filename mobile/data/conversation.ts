export type MessageType = {
  id: string;
  text: string;
  fromUser: boolean; // true if message is from current user, false if from other user
  time: string;
  timestamp: Date;
};

export type ConversationType = {
  id: number;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  lastMessage: string;
  time: string;
  timestamp: Date;
  messages: MessageType[];
};


