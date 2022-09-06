import {useContext, useState, ChangeEvent} from "react";
import { ChatContext } from "../../contexts/chat.context";
import TextMessage from "./TextMessage"

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
        <div className={(!currentGroup)?"absolute w-0 md:w-3/4 h-0 md:h-full invisible pt-16" : "flex flex-col w-screen md:w-3/4 h-full pt-16"}>
            <div className="flex flex-row justify-between items-center border-b-2 border-gray-200 p-4">
                <div className="flex flex-row gap-2">
                    <div className={(currentGroup)?"md:invisible md:w-0":"invisible w-0"} onClick={()=> setCurrentGroup('')}>Back</div>
                    <div>Conversation "{currentGroup}"</div>
                </div>
                <div className="action-icons flex flex-row gap-2">
                    <div>icon</div>
                    <div>icon</div>
                    <div>icon</div>
                </div>
            </div>
            <div className="flex flex-col-reverse h-24 overflow-x-auto grow p-4">
                {conversation.slice(0).reverse().map((message, index) => (
                    <TextMessage key={index} user={message.user} message={message.message} isOwnMessage={(authUser === message.user)? true : false}/>
                ))}
            </div>
            <form className="p-4 flex flex-row relative bottom-0 w-full gap-2 mr-4 bg-black">
                <input type="text" className="text-black h-full border-2 border-gray-200 rounded-lg p-2 w-5/6" value={message} onChange={onChangeHandler}/>
                <button type="submit" className="bg-purple-500 text-white rounded-lg p-2 w-1/6" onClick={onSubmitHandler}>Send</button>
            </form>
        </div>
    )
}