import Conversation from "../components/chat/Conversation";
import ChatProvider from "../contexts/chat.context";
import ChatHistory from "../components/chat/ChatHistory";
import MainLayout from "../components/layout/MainLayout";

export default function Chat() {
  return (
    <MainLayout>
      <ChatProvider>
        <div className="flex flex-grow flex-col md:flex-row w-screen">
          <ChatHistory />
          <Conversation />
        </div>
      </ChatProvider>
    </MainLayout>
  );
}
