import NavBar from "../components/NavBar";
import MessageCard from "../components/chat components/MessageCard";
import { useState } from "react";
import Conversation from "../components/chat components/Conversation";
import ChatProvider from "../contexts/chat.context";

export default function Chat() {
  return (
    <ChatProvider>
      <ChatComponent />
    </ChatProvider>
  );
}

function ChatComponent() {
  const [messages, setMessages] = useState(false);
  const conversations = [
    {
      id: '1',
      users: [
        { name: "John", id: 1 },
        { name: "Jane", id: 2 },
      ],
      lastMessage: { name: "John", message: "Lorem ipsum down for a game ?" },
      messages: 1,
      time: "10:00",
    },
    {
      id: '2',
      users: [
        { name: "John", id: 1 },
        { name: "Jane", id: 2 },
      ],
      lastMessage: { name: "John", message: "Lorem ipsum down for a game ?" },
      messages: 1,
      time: "10:00",
    },
    {
      id: '3',
      users: [
        { name: "John", id: 1 },
        { name: "Jane", id: 2 },
        { name: "Jane", id: 2 },
        { name: "Jane", id: 2 },
      ],
      lastMessage: { name: "John", message: "Lorem ipsum down for a game ?" },
      messages: 1,
      time: "10:00",
    },
    {
      id: '4',
      users: [{ name: "John", id: 1 }],
      lastMessage: { name: "John", message: "Lorem ipsum down for a game ?" },
      messages: 10,
      time: "10:00",
    },
    {
      id: '5',
      users: [{ name: "John", id: 1 }],
      lastMessage: { name: "John", message: "Lorem ipsum down for a game ?" },
      messages: 10,
      time: "10:00",
    },
    {
      id: '6',
      users: [{ name: "John", id: 1 }],
      lastMessage: { name: "John", message: "Lorem ipsum down for a game ?" },
      messages: 0,
      time: "10:00",
    },
  ];
  return (
    <div className="text-white h-screen">
      <NavBar />
      <div className="flex flex-row w-screen h-full">
        <div className="flex flex-col p-4 w-1/4 h-full">
          <div className="flex w-full">
            <div className="relative w-full">
              <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                </svg>
              </div>
              <input
                type="text"
                id="simple-search"
                className="bg-gray-900  text-gray-100 text-sm  focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search"
                required
              />
            </div>
          </div>
          <h1 className="pt-4 font-bold text-gray-100">Messages</h1>
          <div className="pt-4">
            {conversations
              .filter((conversation) => conversation.users.length === 1)
              .map((conversation) => (
                <MessageCard id={conversation.id} Lastmessage={conversation.lastMessage} users={conversation.users} messages={conversation.messages} time={conversation.time} />
              ))}
          </div>
          <h1 className="pt-4 font-bold text-gray-100"># Group Messages</h1>
          <div className="pt-4">
            {conversations
              .filter((conversation) => conversation.users.length > 1)
              .map((conversation) => (
                <MessageCard id={conversation.id} Lastmessage={conversation.lastMessage} users={conversation.users} messages={conversation.messages} time={conversation.time} />
              ))}
          </div>
        </div>
        <Conversation />
      </div>
    </div>
  );
}
