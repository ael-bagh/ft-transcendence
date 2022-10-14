import { useContext, useState, ChangeEvent, useEffect, useRef } from "react";
import { ChatContext } from "../../contexts/chat.context";
import TextMessage from "./TextMessage";
import { GiCrossedSwords, GiExitDoor } from "react-icons/gi";
import { BiLeftArrow } from "react-icons/bi";
import UserStatus from "../user/UserStatus";
import UserAvatar from "../user/UserAvatar";
import { AuthUserContext } from "../../contexts/authUser.context";
import { useSocket } from "../../hooks/api/useSocket";
import { getRoomName } from "../../lib/helpers";
import { Loading } from "../layout/Loading";
import { markMessagesAsRead } from "../../hooks/api/useRoom";
import { Link } from "react-router-dom";
import { FaUserEdit } from "react-icons/fa";
import axiosInstance from "../../lib/axios";
import RoomAvatar from "./RoomAvatar";

interface roomUser {
  login: string;
  nickname: string;
  avatar: string;
  is_admin: boolean;
}

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
  const [isAuthAdmin, setIsAuthAdmin] = useState(false);
  const { socket, sendMessage } = useSocket();

  const chatboxRef = useRef<HTMLDivElement>(null);

  const onLeaveRoom = async () => {
    await axiosInstance.delete(
      "/rooms/" + currentGroup?.room_id + "/leaveroom"
    );
    setCurrentGroup(null);
    await axiosInstance.get("/rooms").then((res: any) => {
      setChatHistory(
        res.data?.sort((b: any, a: any) => {
          return (
            new Date(
              a.room_messages.length > 0
                ? a.room_messages?.[0]?.message_time
                : a.room_creation_date
            ).valueOf() -
            new Date(
              b.room_messages.length > 0
                ? b.room_messages?.[0]?.message_time
                : b.room_creation_date
            ).valueOf()
          );
        })
      );
    });
  };

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
    if (currentGroup) {
      currentGroup?.room_creator_login === authUser?.login &&
        setIsAuthAdmin(true);
      currentGroup?.room_users.map((u: roomUser) => {
        if (u.login === authUser?.login && u.is_admin) {
          setIsAuthAdmin(true);
        }
      });
    }
  }, [currentGroup]);
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
          : "flex flex-col md:w-3/4 h-full"
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
          {!currentGroup?.room_direct_message && (
            <RoomAvatar
              avatar={`https://avatars.dicebear.com/api/initials/${getRoomName(
                currentGroup,
                authUser
              )}.svg`}
            />
          )}
          {currentGroup?.room_direct_message && (
            <UserAvatar
              user={currentGroup.room_users.find(
                (u: roomUser) => u.login !== authUser?.login
              )}
            />
          )}
          <div className="flex flex-col">
            <div>{getRoomName(currentGroup, authUser)}</div>
          </div>
        </div>
        <div
          className="action-icons flex flex-row gap-2 hover:cursor-pointer"
          onClick={onLeaveRoom}
        >
          {!currentGroup?.room_direct_message && (
            <div className="rounded-full bg-gray-800 p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
              <GiExitDoor className="w-5 h-5" />
            </div>
          )}
          {currentGroup?.room_direct_message && (
            <div className="rounded-full bg-gray-800 p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
              <GiCrossedSwords className="w-5 h-5" />
            </div>
          )}
          {!currentGroup?.room_direct_message && isAuthAdmin && (
            <Link
              to={"/rooms/" + currentGroup?.room_id + "/edit"}
              className="rounded-full bg-gray-800 p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              <FaUserEdit className="w-5 h-5" />
            </Link>
          )}
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
            if (currentGroup)
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
