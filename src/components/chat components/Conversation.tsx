import { useContext } from "react";
import { ChatContext } from "../../contexts/chat.context";
import TextMessage from "./TextMessage"


export default function Conversation () {
    const { currentGroup } = useContext(ChatContext);
    return (
        <div className="flex flex-col w-3/4 h-full">
            <div className="conversation-header flex flex-row justify-between items-center border-b-2 border-gray-200 p-4">
                <div className="conversation-info">
                    Player name "{currentGroup}"
                </div>
                <div className="action-icons flex flex-row gap-2">
                    <div>icon</div>
                    <div>icon</div>
                    <div>icon</div>
                </div>
            </div>
            <div className="conversation flex flex-col-reverse h-4/6 overflow-y-scroll p-4">
                <TextMessage user="Hamid neff7a" message="haa lghdr bda" isOwnMessage={true}/>
                <TextMessage user="Hamid neff7a" message="haa lghdr bda" isOwnMessage={false}/>
                <TextMessage user="Hamid neff7a" message="haa lghdr bda" isOwnMessage={true}/>
                <TextMessage user="Hamid neff7a" message="haa lghdr bda" isOwnMessage={false}/>
                <TextMessage user="Hamid neff7a" message="haa lghdr bda" isOwnMessage={true}/>
                <TextMessage user="Hamid neff7a" message="haa lghdr bda" isOwnMessage={false}/>
                <TextMessage user="Hamid neff7a" message="haa lghdr bda" isOwnMessage={false}/>
                <TextMessage user="Hamid neff7a" message="haa lghdr bda" isOwnMessage={false}/>
                <TextMessage user="Hamid neff7a" message="haa lghdr bda" isOwnMessage={false}/>
                <TextMessage user="Hamid neff7a" message="haa lghdr bda" isOwnMessage={false}/>
                <TextMessage user="Hamid neff7a" message="haa lghdr bda" isOwnMessage={false}/>
            </div>
            <div className="p-4">
                <input type="text" className="w-full h-full border-2 border-gray-200 rounded-lg p-2"/>
            </div>
        </div>
    )
}