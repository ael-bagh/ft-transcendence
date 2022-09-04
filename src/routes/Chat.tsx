import NavBar from "../components/NavBar";
import { useState } from "react";
import Conversation from "../components/chat components/Conversation";
import ChatProvider from "../contexts/chat.context";
import ChatHistory from "../components/chat components/ChatHistory";

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
    <div className="text-white">
      <NavBar />
      <div className="flex flex-col md:flex-row w-screen h-full mt-16">
        <ChatHistory />
        <Conversation />
      </div>
    </div>
  );
}
