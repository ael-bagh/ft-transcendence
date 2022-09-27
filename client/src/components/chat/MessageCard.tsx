import { useContext } from "react";
import { ChatContext } from "../../contexts/chat.context";
import { truncate } from "../../lib/helpers";
import TimeAgo from "react-timeago";
import { markMessagesAsRead } from "../../hooks/api/useRoom";

export default function MessageCard({
  room,
  setRoom,
}: {
  room: Room;
  setRoom: (room: Room) => void;
}) {
  const { currentGroup, setCurrentGroup } = useContext(ChatContext);
  /* remove messages prop and used state number of unread messages */
  /* listen on coming messages and increment number of unread messages for every message received*/
  /* add an onClick event to reset the number and send a post request to database to set messages as read */
  /*const [numberOfUnreadMessages, setNumberOfUnreadMessages] = useState(1);*/
  const cardCss = room.unread_message_count
    ? " bg-gradient-to-r from-purple-300 to-blue-400"
    : "";
  const message = truncate(room.room_messages?.[0]?.message, 15);
  return (
    <div
      className={"flex flex-row p-2 hover:cursor-pointer" + cardCss}
      onClick={() => {
        setCurrentGroup && setCurrentGroup(room.room_id);
        markMessagesAsRead(room).finally(() =>
          setRoom({ ...room, unread_message_count: 0 })
        );
      }}
    >
      <div className="flex flex-row w-5/6">
        <div className="flex -space-x-4">
          <div className="text-bold text-center bg-white text-purple-500 self-center items-center p-1 w-10 h-10 rounded-full border-2 border-white dark:border-gray-800">
            {" "}
            LR{" "}
          </div>
        </div>
        <div className="flex flex-col ml-4">
          <div className="font-bold text-white">{room.room_name}</div>
          <div className="text-gray-100 font-light text-sm">{message}</div>
        </div>
      </div>
      {room?.room_messages?.[0] && (
        <div className="flex flex-col justify-between w-1/6 self-center items-end">
          <p className="text-sm">
            <TimeAgo date={room.room_messages[0].time} />
          </p>
          {!!room.unread_message_count && (
            <p className="rounded-full bg-white w-6 h-6 text-center text-purple-500 font-sans">
              {room.unread_message_count}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
