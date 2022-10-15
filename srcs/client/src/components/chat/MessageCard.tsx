import { useContext } from "react";
import { ChatContext } from "../../contexts/chat.context";
import { AuthUserContext } from "../../contexts/authUser.context";
import { truncate } from "../../lib/helpers";
import TimeAgo from "react-timeago";
import { markMessagesAsRead } from "../../hooks/api/useRoom";
import UserAvatar from "../user/UserAvatar";
import { getRoomName } from "../../lib/helpers";
import RoomAvatar from "./RoomAvatar";

export default function MessageCard({ room }: { room: Room | undefined }) {
  const { setCurrentGroup } = useContext(ChatContext);
  const { authUser } = useContext(AuthUserContext);

  /* remove messages prop and used state number of unread messages */
  /* listen on coming messages and increment number of unread messages for every message received*/
  /* add an onClick event to reset the number and send a post request to database to set messages as read */
  /*const [numberOfUnreadMessages, setNumberOfUnreadMessages] = useState(1);*/
  const cardCss = room?.unread_messages_count
    ? " bg-gradient-to-r from-purple-300 to-blue-400"
    : "";
  return (
    <>
      {room && (
        <div
          className={"block relative p-2 hover:cursor-pointer" + cardCss}
          onClick={() => {
            markMessagesAsRead(room).finally(() => {
              setCurrentGroup({ ...room, unread_messages_count: 0 });
            });
          }}
        >
          <div className="flex flex-row w-full items-center">
            <div className="flex -space-x-4">
              {room.room_direct_message && (
                <UserAvatar
                  user={room.room_users.find(
                    (u: roomUser) => u.login !== authUser?.login
                  )}
                />
              )}
              {!room.room_direct_message && (
                <RoomAvatar
                  avatar={`https://avatars.dicebear.com/api/initials/${getRoomName(
                    room,
                    authUser
                  )}.svg`}
                />
              )}
            </div>
            <div className="flex flex-col w-full ml-4">
              <div className="font-bold text-white flex flex-row justify-between w-full">
                <span>{getRoomName(room, authUser)}</span>
                <span className="text-xs whitespace-nowrap">
                  {!!room.room_messages?.length && (
                    <TimeAgo date={room.room_messages[0].message_time} />
                  )}
                </span>
              </div>
              <div className="text-gray-100 font-light text-sm">
                {truncate(room.room_messages?.[0]?.message_content, 15)}
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 p-2 flex items-center justify-center">
            {!!room.unread_messages_count && (
              <p className="rounded-full bg-white w-6 h-6 text-center text-purple-500 font-sans">
                {room.unread_messages_count}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
