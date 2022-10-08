import { useContext, useState, ChangeEvent, useEffect, useRef } from "react";
import { ChatContext } from "../../contexts/chat.context";
import TextMessage from "./TextMessage";
import { GiCrossedSwords } from "react-icons/gi";
import { BiLeftArrow } from "react-icons/bi";
import UserStatus from "../user/UserStatus";
import UserAvatar from "../user/UserAvatar";
import { AuthUserContext } from "../../contexts/authUser.context";
import { useSocket } from "../../hooks/api/useSocket";
import { getRoomName } from "../../lib/helpers";
import { Loading } from "../layout/Loading";
import { markMessagesAsRead } from "../../hooks/api/useRoom";

export default function Conversation() {
  const {
    setCurrentGroup,
    currentGroup,
    conversation,
    setConversation,
    setChatHistory,
  } = useContext(ChatContext);
  const { authUser } = useContext(AuthUserContext);
  const [message, setMessage] = useState("");
  const { socket, sendMessage } = useSocket();

  const chatboxRef = useRef<HTMLDivElement>(null);

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) =>
    setMessage(e.currentTarget.value);
  const onSubmitHandler = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (currentGroup && message) {
      const messageObject: Partial<Message> = {
        message_room_id: currentGroup.room_id,
        message_content: message.trim(),
        message_user_login: authUser?.login!,
      };
      sendMessage(messageObject as Message).finally(() => {
        setMessage("");
        chatboxRef.current?.scrollTo({
          behavior: "smooth",
          top: chatboxRef.current?.scrollHeight,
        });
      });
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    setIsLoading(true);
    socket.emit(
      "get_room_messages",
      { room_id: currentGroup?.room_id },
      (messages: Message[]) => {
        setConversation(messages.reverse());
        setIsLoading(false);
      }
    );
  }, [currentGroup]);

  return (
    <div
      className={
        !currentGroup
          ? "absolute w-0 md:w-3/4 h-0 md:h-full hidden"
          : "flex flex-col w-screen md:w-3/4 h-full"
      }
    >
      <div className="flex flex-row justify-between items-center border-b border-gray-200 p-4">
        <div className="flex flex-row gap-2 items-center">
          <div
            className={
              currentGroup
                ? "md:invisible md:w-0 hover:cursor-pointer"
                : "invisible w-0"
            }
            onClick={() => setCurrentGroup(null)}
          >
            <BiLeftArrow className="w-10 h-10 text-purple-500" />
          </div>
          <UserAvatar
            avatar={`https://avatars.dicebear.com/api/initials/${getRoomName(
              currentGroup,
              authUser
            )}.svg`}
          />
          <div className="flex flex-col">
            <div>{getRoomName(currentGroup, authUser)}</div>
            <UserStatus username="Hamid nef7a" id={1} />
          </div>
        </div>
        <div className="action-icons flex flex-row gap-2">
          <div className="rounded-full bg-gray-800 p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
            <GiCrossedSwords className="w-5 h-5" />
          </div>
        </div>
      </div>
      {isLoading && <Loading />}
      {!isLoading && (
        <div
          ref={chatboxRef}
          id="scrollableDiv"
          className="flex flex-col-reverse h-24 overflow-y-auto grow p-4"
        >
          {conversation.map((message) => (
            <TextMessage
              key={message.message_id}
              id={message.message_id}
              user={message.message_user_login}
              message={message.message_content}
              isOwnMessage={
                authUser?.login === message.message_user_login ? true : false
              }
            />
          ))}
        </div>
      )}
      <form className="p-4 flex flex-row relative bottom-0 w-full gap-2 mr-4 bg-black">
        <input
          type="text"
          className=" h-full w-5/6 bg-gray-900  text-gray-100 text-sm  focus:ring-purple-500 focus:border-purple-500"
          placeholder="Write a message..."
          value={message}
          onChange={onChangeHandler}
          onFocus={() => {
            if(currentGroup)
            markMessagesAsRead(currentGroup).finally(() => {
              setCurrentGroup({ ...currentGroup, unread_messages_count: 0 });
            });
          }}
        />
        <button
          type="submit"
          className="bg-purple-500 text-white p-2 w-1/6"
          onClick={onSubmitHandler}
        >
          Send
        </button>
      </form>
    </div>
  );
}
