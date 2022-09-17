import NavBar from "../components/NavBar";
import { useState } from "react";
import Conversation from "../components/chatComponents/Conversation";
import ChatProvider from "../contexts/chat.context";
import ChatHistory from "../components/chatComponents/ChatHistory";

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
    <div className="text-white h-screen">
      <NavBar />
      <div className="flex flex-col md:flex-row h-screen w-screen border-t-2 border-gray-300">
        <hr></hr>
        <ChatHistory />
        <Conversation />
      </div>
    </div>
  );
}
