import {useContext, useState, ChangeEvent, useEffect} from "react";
import { ChatContext } from "../../contexts/chat.context";
import TextMessage from "./TextMessage"
import {GiCrossedSwords} from 'react-icons/gi'
import {BiLeftArrow} from 'react-icons/bi'
import UserStatus from "../user/UserStatus";
import UserAvatar from "../user/UserAvatar";
import {AuthUserContext} from '../../contexts/authUser.context'
import { useSocket } from "../../hooks/api/useSocket";
import { useRoom } from "../../hooks/api/useRoom";

const MessageDefaultValue : Message[] = 
[]

export default function Conversation () {
    const { setCurrentGroup ,currentGroup } = useContext(ChatContext);
    const { authUser } = useContext(AuthUserContext);
    const [conversation, setConversation] = useState<Message[]>(MessageDefaultValue);
    const [message, setMessage] = useState('');
    const { sendMessage } = useSocket();
    const { room } = useRoom(currentGroup);

    const onMessageSent = (message: Message) => {
        if (message) setConversation([...conversation, message]);
        setMessage('');
    }
    const avatar: string | undefined = (room?.room_direct_message) ? room?.room_users.find(user => user.user_id !== authUser?.user_id)?.avatar : `https://ui-avatars.com/api/?length=1?name=${room?.room_name}`;

    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => setMessage(e.currentTarget.value);
    const onSubmitHandler = (e: React.SyntheticEvent)=> {
        e.preventDefault();
        const messageObject: Message = {
            currentRoom: currentGroup,
            message,
            user: authUser?.login,
            user_login: authUser?.login,
            time: new Date()
        }
        sendMessage(messageObject, currentGroup).finally(() => onMessageSent(messageObject));
    }
    return (
        <div className={(!currentGroup)?"absolute w-0 md:w-3/4 h-0 md:h-full hidden" : "flex flex-col w-screen md:w-3/4 h-full"}>
            <div className="flex flex-row justify-between items-center border-b border-gray-200 p-4">
                <div className="flex flex-row gap-2 items-center">
                    <div className={(currentGroup)?"md:invisible md:w-0 hover:cursor-pointer":"invisible w-0"} onClick={()=> setCurrentGroup('')}><BiLeftArrow  className="w-10 h-10 text-purple-500"  /></div>
                    <UserAvatar avatar={avatar}/>
                    <div className="flex flex-col">
                        <div>Conversation "{currentGroup}"</div>
                        <UserStatus username="Hamid nef7a" id={1}/>
                    </div>
                </div>
                <div className="action-icons flex flex-row gap-2">
                    <div><GiCrossedSwords className="w-10 h-10" /></div>
                </div>
            </div>
            <div className="flex flex-col-reverse h-24 overflow-x-auto grow p-4">
                {conversation.slice(0).reverse().map((message, index) => (
                    <TextMessage key={index} user={message.user} message={message.message} isOwnMessage={(authUser === message.user)? true : false}/>
                ))}
            </div>
            <form className="p-4 flex flex-row relative bottom-0 w-full gap-2 mr-4 bg-black">
                <input type="text" className=" h-full w-5/6 bg-gray-900  text-gray-100 text-sm  focus:ring-purple-500 focus:border-purple-500" placeholder="Write a message..." value={message} onChange={onChangeHandler}/>
                <button type="submit" className="bg-purple-500 text-white p-2 w-1/6" onClick={onSubmitHandler}>Send</button>
            </form>
        </div>
    )
}