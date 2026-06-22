import { ConversationType, MessageType } from "@/data/conversation";
import { convoApi, useApiClient } from "@/utils/api";
import { socket } from "@/utils/socket";
import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useAuth } from "@clerk/clerk-expo";

const MessagesScreen = () => {

  const api = useApiClient();
  const { getToken } = useAuth();
  const myUserId = useAuth().userId;

  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [conversationsList, setConversationsList] =
  useState<ConversationType[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationType | null>(null);
  const [currentChat,setCurrentChat] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const chatScrollRef = useRef<FlatList>(null);

  useEffect(() => {
  const connectSocket = async () => {
    const token = await getToken();

    socket.auth = {
      token,
    };

    socket.connect();
  };

  connectSocket();

  return () => {
    socket.disconnect();
  };
}, []);


  useEffect(() => {
  loadConversations();
}, []);


useEffect(() => {
  socket.on("receive_message", (message) => {
    console.log("NEW MESSAGE", message);
    const normalizedMessage = {
    id: message._id,
    text: message.text,
    fromUser: false,
    time: message.createdAt,
    timestamp: message.createdAt
    };
      setSelectedConversation((prev) => {
        if (!prev) return prev;
  
        return {
          ...prev,
          messages: [...prev.messages, normalizedMessage],
        };
      });

    setConversationsList((prev) =>
      prev.map((conv) =>
        conv.user.id === message.senderId
          ? {
              ...conv,
              messages: [...conv.messages, normalizedMessage ],
              lastMessage: message.text,
              time: "now",
            }
          : conv
      )
    );
  });
}, []);

  const loadConversations = async () => {
    console.log("Fetching conversations...");
    try {
      const response = await convoApi.fetchConversations(api);
      setConversationsList(response.data);
    } catch (error) {
      console.log("Error fetching conversations", error);
    }
  };


  const openConversation = (conversation: ConversationType) => {
    setSelectedConversation(conversation);
    setIsChatOpen(true);
  };

  const closeChatModal = () => {
    setIsChatOpen(false);
    // setSelectedConversation(null);
    setNewMessage("");
  };

const sendMessage = () => {
  if (!newMessage.trim() || !selectedConversation) return;

  const text = newMessage.trim();
  const now = new Date();

  const tempMessage: MessageType = {
    id: `temp-${Date.now()}`, 
    text,
    fromUser: true,
    time: "now",
    timestamp: now,
  };

  const payload = {
    receiverId: selectedConversation.user.id,
    text,
  };

  socket.emit("send_message", payload);

  // optimistic UI update
  setSelectedConversation((prev) => {
    if (!prev) return prev;
    return {
      ...prev,
      messages: [...prev.messages, tempMessage],
    };
  });

  setConversationsList((prev) =>
    prev.map((conv) =>
      conv.id === selectedConversation.id
        ? {
            ...conv,
            messages: [...conv.messages, tempMessage],
            lastMessage: text,
            time: "now",
            timestamp: now,
          }
        : conv
    )
  );

  setNewMessage("");
};

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900">Messages</Text>
        <TouchableOpacity>
          <Feather name="edit" size={24} color="#1DA1F2" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
          <Feather name="search" size={20} color="#657786" />
          <TextInput
            placeholder="Search for people and groups"
            className="flex-1 ml-3 text-base"
            placeholderTextColor="#657786"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* CONVERSATIONS LIST */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
      >
        {conversationsList.map((conversation) => (
          <TouchableOpacity
            key={conversation.id}
            className="flex-row items-center p-4 border-b border-gray-50 active:bg-gray-50"
            onPress={() => openConversation(conversation)}
          >
            <Image
              source={{ uri: conversation.user?.avatar }}
              className="size-12 rounded-full mr-3"
            />

            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center gap-1">
                  <Text className="font-semibold text-gray-900">
                    {conversation.user.name}
                  </Text>
                  {conversation.user.verified && (
                    <Feather
                      name="check-circle"
                      size={16}
                      color="#1DA1F2"
                      className="ml-1"
                    />
                  )}
                  <Text className="text-gray-500 text-sm ml-1">
                    @{conversation.user.username}
                  </Text>
                </View>
                <Text className="text-gray-500 text-sm">
                  {conversation.time}
                </Text>
              </View>
              <Text className="text-sm text-gray-500" numberOfLines={1}>
                {conversation.lastMessage}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Quick Actions */}
      <View className="px-4 py-2 border-t border-gray-100 bg-gray-50">
        <Text className="text-xs text-gray-500 text-center">
          Tap to open • Long press to delete
        </Text>
      </View>

      <Modal
        visible={isChatOpen}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedConversation && (
          <SafeAreaView className="flex-1">
            {/* Chat Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
              <TouchableOpacity onPress={closeChatModal} className="mr-3">
                <Feather name="arrow-left" size={24} color="#1DA1F2" />
              </TouchableOpacity>
              <Image
                source={{ uri: selectedConversation.user.avatar }}
                className="size-10 rounded-full mr-3"
              />
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="font-semibold text-gray-900 mr-1">
                    {selectedConversation.user.name}
                  </Text>
                  {selectedConversation.user.verified && (
                    <Feather name="check-circle" size={16} color="#1DA1F2" />
                  )}
                </View>
                <Text className="text-gray-500 text-sm">
                  @{selectedConversation.user.username}
                </Text>
              </View>
            </View>

            {/* Chat Messages Area */}
            <FlatList
              ref={chatScrollRef}
              data={selectedConversation?.messages || []}
              keyExtractor={(item) => item.id.toString() || item.receiverId.toString()}
              renderItem={({ item: message }) => {
                 const isMyMessage = message.senderId === myUserId;

                return (
                <View
                  className={`flex-row mb-3 ${
                    (message.fromUser || isMyMessage) ? "justify-end" : ""
                  }`}
                >
                  {(!message.fromUser && !isMyMessage)&& (
                    <Image
                      source={{ uri: selectedConversation?.user.avatar }}
                      className="size-8 rounded-full mr-2"
                    />
                  )}

                  <View className={`flex-1 ${(message.fromUser || isMyMessage) ? "items-end" : ""}`}>
                    <View
                      className={`rounded-2xl px-4 py-3 max-w-xs ${
                        (message.fromUser || isMyMessage) ? "bg-blue-500" : "bg-gray-100"
                      }`}
                    >
                      <Text
                        className={
                          (message.fromUser || isMyMessage) ? "text-white" : "text-gray-900"
                        }
                      >
                        {message.text}
                      </Text>
                    </View>

                    <Text className="text-xs text-gray-400 mt-1">
                      {message.time}
                    </Text>
                  </View>
                </View>
              )}}
              contentContainerStyle={{ padding: 16 }}
            />

            {/* Message Input */}
            <View className="flex-row items-center px-4 py-3 border-t border-gray-100">
              <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-3 mr-3">
                <TextInput
                  className="flex-1 text-base"
                  placeholder="Start a message..."
                  placeholderTextColor="#657786"
                  value={newMessage}
                  onChangeText={setNewMessage}
                  multiline
                />
              </View>
              <TouchableOpacity
                onPress={sendMessage}
                className={`size-10 rounded-full items-center justify-center ${
                  newMessage.trim() ? "bg-blue-500" : "bg-gray-300"
                }`}
                disabled={!newMessage.trim()}
              >
                <Feather name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
};

export default MessagesScreen;
