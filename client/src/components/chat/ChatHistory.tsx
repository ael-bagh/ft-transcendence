import MessageCard from "./MessageCard";
import { useContext, useEffect, useState } from "react";
import { ChatContext } from "../../contexts/chat.context";
import { BsChatRightTextFill } from "react-icons/bs";
import NewConversationModal from "./NewConversationModal";
import { useRooms } from "../../hooks/api/useRoom";
import Conversation from "./Conversation";
import axiosInstance from "../../lib/axios";

export default function ChatHistory() {
  const {currentGroup ,chatHistory,  setChatHistory, conversation} = useContext(ChatContext);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const newConversation = () => {
    setShowNewConversation(!showNewConversation);
  }
  useEffect(() => {
    axiosInstance
    .get("/rooms")
    .then((res : any) => {
      setChatHistory(res.data?.sort(
        (b: any, a: any) =>{
          return new Date((a.room_messages.length > 0)? a.room_messages?.[0]?.message_time : a.room_creation_date).valueOf() -
          new Date((b.room_messages.length > 0)? b.room_messages?.[0]?.message_time : b.room_creation_date).valueOf()}
      ));
    }).catch(() => {}); // No need to handle error here
    setShowNewConversation(false);
  }, [conversation, currentGroup]);
  return (
    <div
      className={
        !currentGroup
          ? "flex flex-col h-full w-full md:shrink-0 justify-between"
          : "hidden md:flex md:flex-col md:h-full md:w-1/4 md:shrink-0 md:min-w-1/4"
      }
      style={{ height: 'calc(100vh - 4rem)' }}
    >
      <div className="w-full">
        <div className="relative w-full">
          <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
            <svg
              aria-hidden="true"
              className="w-5 h-5 text-gray-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          <input
            type="text"
            id="simple-search"
            className="bg-gray-900  text-gray-100 text-sm  focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 p-2.5"
            placeholder="Search"
          />
        </div>
      </div>
      <div className="flex flex-col h-full overflow-scroll">
        <div className="p-4 w-full flex flex-col gap-4">
          <h1 className="font-bold text-gray-100">Messages</h1>
            {chatHistory?.map((room: Room, idx: Number) => (
                <MessageCard
                  key={room.room_id + "-" + idx}
                  room={room}
                />
              ))}
        </div>
      </div>
      <div className=" bg-purple-600 flex flex-col justify-center text-center items-center gap-2 pt-2">
        <div className="hover:cursor-pointer mb-2" onClick={newConversation}>
          {" "}
          <BsChatRightTextFill className="bg-white shadow-lg rounded-full text-purple-500 p-2 w-12 h-12" />{" "}
        </div>
        {showNewConversation && <NewConversationModal />}
      </div>
    </div>
  );
}
