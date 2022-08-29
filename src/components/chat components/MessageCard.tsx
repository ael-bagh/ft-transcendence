import { useState } from "react"

interface user {
    name: string,
    id: number
}

interface lastMessage {
    name : string,
    message : string
}

export default function MessageCard(props: {Lastmessage: lastMessage , users: user[] , messages: number, time: string}) {
    /* remove messages prop and used state number of unread messages */
    /* listen on coming messages and increment number of unread messages for every message received*/
    /* add an onClick event to reset the number and send a post request to database to set messages as read */
    /*const [numberOfUnreadMessages, setNumberOfUnreadMessages] = useState(1);*/
    const cardCss = props.messages > 0 ? " bg-gradient-to-r from-purple-300 to-blue-400" : "";
    const message = (props.Lastmessage.message.length > 20) ? props.Lastmessage.message.substring(0, 20) + "..." : props.Lastmessage.message;
    if (props.users.length === 1) {
        return (
                <div className={"flex flex-row p-2 hover:cursor-pointer" + cardCss}>
                    <div className="flex flex-row w-5/6">
                        <img src="https://flowbite.com/docs/images/people/profile-picture-1.jpg" alt="avatar" className="h-14 w-14 rounded-full"/>
                        <div className="flex flex-col ml-4">
                            <div className="font-bold text-white">{props.users[0].name}</div>
                            <div className="text-gray-100 font-light text-sm">{message}</div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-between w-1/6 self-center items-end">
                        <p className="text-sm">{props.time}</p>
                        {(props.messages > 0) && <p className="rounded-full bg-purple-500 w-8 h-8 text-center p-1">{props.messages}</p>}
                    </div>
                </div>
        )
    } else {
            return (
                <div className={"flex flex-row p-2 hover:cursor-pointer" + cardCss}>
                    <div className="flex flex-row w-5/6">
                        <div className="flex -space-x-4">
                        {(props.users.map((ele, index) =>
                            index < 3 && <img className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800" src="https://flowbite.com/docs/images/people/profile-picture-1.jpg" alt={ele.name}/>
                            ))}
                            {(props.users.length > 2) && <a className="flex justify-center items-center w-10 h-10 text-xs font-medium text-white bg-gray-700 rounded-full border-2 border-white hover:bg-gray-600 dark:border-gray-800" href="#">+{props.users.length - 3}</a>}    
                        </div>
                        <div className="flex flex-col ml-4">
                            <div className="font-bold text-white">{props.users[0].name}</div>
                            <div className="text-gray-100 font-light text-sm">{message}</div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-between w-1/6 self-center items-end">
                        <p className="text-sm">{props.time}</p>
                        {(props.messages > 0) && <p className="rounded-full bg-purple-500 w-8 h-8 text-center p-1">{props.messages}</p>}
                    </div>
                </div>
            )
        }
    }