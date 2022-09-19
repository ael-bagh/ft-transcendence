import {useContext, useState, ChangeEvent} from "react";
import { ChatContext } from "../../contexts/chat.context";
import TextMessage from "./TextMessage"
import {GiCrossedSwords} from 'react-icons/gi'
import {BiLeftArrow} from 'react-icons/bi'
import UserStatus from "../user/UserStatus";
import UserAvatar from "../user/UserAvatar";

interface Message 
{
    id: string;
    message: string;
    time: string;
    user: string;
}

export default function Conversation () {
    const authUser:string = 'KHAY SSERGHINI'
    const { setCurrentGroup ,currentGroup } = useContext(ChatContext);
        /* get conversationid where id = currentGroup */
    const [message, setMessage] = useState('');
    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>)=> {
            setMessage(e.currentTarget.value)
          };
    const onSubmitHandler = (e: React.SyntheticEvent)=> {
        e.preventDefault();
        if (message?.trim()) {
            const newMessage: Message = {
                id: '1',
                message: message,
                time: '10:00',
                user: authUser
            }
            setConversation([...conversation, newMessage])
        }
        setMessage('')
    }
    const [conversation, setConversation] = useState<Message[]>([{id:'1',  message : '3refti a khay sserghini',time: '10:00',user: 'Hamid nef7a' },
    {id:'2',  message : 'bghaw yrawdouni',time: '10:00',user: 'Hamid nef7A' },
    {id:'3',  message : 'Ewa XDERTI ?',time: '10:01',user: 'KHAY SSERGHINI' },
    {id:'4',  message : '3refti a khay sserghini NEDDT LBESST JELLABA D CHAMAL',time: '10:02',user: 'Hamid nef7a' },
    {id:'5',  message : 'bash tala dderbouni mayssewrou mni taaaa le3ba',time: '10:03',user: 'Hamid nef7A' },]);
    return (
        <div className={(!currentGroup)?"absolute w-0 md:w-3/4 h-0 md:h-full hidden pt-16" : "flex flex-col w-screen md:w-3/4 h-full pt-16"}>
            <div className="flex flex-row justify-between items-center border-b border-gray-200 p-4">
                <div className="flex flex-row gap-2 items-center">
                    <div className={(currentGroup)?"md:invisible md:w-0 hover:cursor-pointer":"invisible w-0"} onClick={()=> setCurrentGroup('')}><BiLeftArrow  className="w-10 h-10 text-purple-500"  /></div>
                    <UserAvatar username="Hamid" id={1235}/>
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