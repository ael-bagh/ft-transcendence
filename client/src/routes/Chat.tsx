import { useState } from "react";
import Conversation from "../components/chat/Conversation";
import ChatProvider from "../contexts/chat.context";
import ChatHistory from "../components/chat/ChatHistory";
import MainLayout from "../components/layout/MainLayout";

export default function Chat() {
  return (
    <ChatProvider>
      <ChatComponent />
    </ChatProvider>
  );
}

function ChatComponent() {
  const [messages, setMessages] = useState(false);
  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row h-screen w-screen border-t-2 border-gray-300">
        <hr></hr>
        <ChatHistory />
        <Conversation />
      </div>
    </MainLayout>
  );
}
