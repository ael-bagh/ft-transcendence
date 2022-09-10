import { useContext} from "react";
import { ChatContext } from "../../contexts/chat.context";

interface user {
  name: string;
  id: number;
}

interface lastMessage {
  name: string;
  message: string;
}

export default function MessageCard(props: {id: string; Lastmessage: lastMessage; users: user[]; messages: number; time: string }) {
  const { currentGroup, setCurrentGroup } = useContext(ChatContext);
  /* remove messages prop and used state number of unread messages */
  /* listen on coming messages and increment number of unread messages for every message received*/
  /* add an onClick event to reset the number and send a post request to database to set messages as read */
  /*const [numberOfUnreadMessages, setNumberOfUnreadMessages] = useState(1);*/
  const cardCss = props.messages > 0 ? " bg-gradient-to-r from-purple-300 to-blue-400" : "";
  const message = props.Lastmessage.message.length > 20 ? props.Lastmessage.message.substring(0, 20) + "..." : props.Lastmessage.message;
  if (props.users.length === 1) {
    return (
      <div className={"flex flex-row p-2 hover:cursor-pointer" + cardCss} onClick={() => setCurrentGroup && setCurrentGroup(props.id)}>
        <div className="flex flex-row w-5/6">
          <img src="https://flowbite.com/docs/images/people/profile-picture-1.jpg" alt="avatar" className="h-14 w-14 rounded-full" />
          <div className="flex flex-col ml-4">
            <div className="font-bold text-white">{props.users[0].name}</div>
            <div className="text-gray-100 font-light text-sm">{message}</div>
          </div>
        </div>
        <div className="flex flex-col justify-between w-1/6 self-center items-end">
          <p className="text-sm">{props.time}</p>
          {props.messages > 0 && <p className="rounded-full bg-white text-purple-500 font-semibold w-6 h-6 text-center">{props.messages}</p>}
        </div>
      </div>
    );
  } else {
    return (
      <div className={"flex flex-row p-2 hover:cursor-pointer" + cardCss} onClick={() => setCurrentGroup && setCurrentGroup(props.id)}>
        <div className="flex flex-row w-5/6">
          <div className="flex -space-x-4">
            <div className="text-bold text-center bg-white text-purple-500 self-center items-center p-1 w-10 h-10 rounded-full border-2 border-white dark:border-gray-800"> LR </div>
          </div>
          <div className="flex flex-col ml-4">
            <div className="font-bold text-white">{props.users[0].name}</div>
            <div className="text-gray-100 font-light text-sm">{message}</div>
          </div>
        </div>
        <div className="flex flex-col justify-between w-1/6 self-center items-end">
          <p className="text-sm">{props.time}</p>
          {props.messages > 0 && <p className="rounded-full bg-white w-6 h-6 text-center text-purple-500 font-sans">{props.messages}</p>}
        </div>
      </div>
    );
  }
}
