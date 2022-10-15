import React, { useEffect, useState } from "react";
import { useSocket } from "../hooks/api/useSocket";

interface ChatContextInterface {
  currentGroup: Room | null;
  setCurrentGroup: (group: Room | null) => void;
  conversation: Message[];
  setConversation: (messages: Message[]) => void;
  chatHistory: Room[];
  setChatHistory: (rooms: Room[]) => void;
}

const ChatContextDefaultValues: ChatContextInterface = {
  currentGroup: null,
  setCurrentGroup: () => null,
  conversation: [],
  setConversation: () => null,
  chatHistory: [],
  setChatHistory: () => null,
};

export const ChatContext = React.createContext<ChatContextInterface>(
  ChatContextDefaultValues
);

const ChatProvider = ({ children }: { children?: React.ReactNode }) => {
  const [currentGroup, setCurrentGroup] = useState<Room | null>(null);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<Room[]>([]);
  const { socket } = useSocket();

  useEffect(() => {
    const onReceiveMessage = (m: Message, err: any) => {
      if (m.message_room_id == currentGroup?.room_id)
        setConversation((prev) => [m, ...prev]);
    };
    socket.on("message", onReceiveMessage);

    return () => {
      socket.off("message", onReceiveMessage);
    }
  }, [currentGroup]);

  return (
    <ChatContext.Provider
      value={{
        currentGroup,
        setCurrentGroup,
        conversation,
        setConversation,
        chatHistory,
        setChatHistory,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
