import Conversation from "../components/chat/Conversation";
import ChatProvider, { ChatContext } from "../contexts/chat.context";
import ChatHistory from "../components/chat/ChatHistory";
import MainLayout from "../components/layout/MainLayout";
import { useLoaderData, useParams } from "react-router-dom";
import { useEffect, useContext } from "react";
import { useSocket } from "../hooks/api/useSocket";
import axiosInstance from "../lib/axios";

export default function Chat() {
  return (
    <MainLayout>
      <ChatProvider>
        <ChatComponent />
      </ChatProvider>
    </MainLayout>
  );
}

function ChatComponent() {
  const { setCurrentGroup, currentGroup, setChatHistory } = useContext(ChatContext);
  const loaderData = useLoaderData() as any;
  const {id} = useParams();
  const { socket } = useSocket();
  useEffect(() => {
    console.log("allllllloooooooo");
    socket.on("message", ((message: Message) => {
      axiosInstance
      .get("/rooms")
      .then((res : any) => {
        setChatHistory(res.data.filter((r : any) => r.room_messages.length > 0)?.sort(
          (b: any, a: any) =>
            new Date(a.room_messages[0].message_time).valueOf() -
            new Date(b.room_messages[0].message_time).valueOf()
        ));
      })
    }));
    if (loaderData?.data) setCurrentGroup(loaderData?.data);

    return () => {
      socket.off("message");
    }
  }, [id]);

  return (
    <div className="flex flex-grow flex-col md:flex-row w-screen divide-x divide-gray-200">
      <ChatHistory />
      {currentGroup && <Conversation />}
    </div>
  );
}
