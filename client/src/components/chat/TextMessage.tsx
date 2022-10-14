import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../lib/axios";

export default function TextMessage(props:{id: string | number, user: string | undefined, message: string, isOwnMessage: boolean}) {
    const css = " w-4/6 m-2 h-fit shrink-0 text-white p-4 font-sans font-medium rounded";
    let messageCss = css + ((props.isOwnMessage )? " flex self-start bg-purple-500 h-fit" : " flex self-end bg-gray-200/50 h-fit");
    const [avatar, setAvatar] = useState("");
    useEffect(() => {
        axiosInstance.get("/user/"+props.user).then((res) => {
                setAvatar(res.data.avatar)
        });
        }, [])
    return (
        <div className={messageCss}>
            <img 
                src={avatar}
                className="h-10 w-10 rounded-full"
             />
             <div className="w-5/6">
                <Link to={`/profile/${props.user}`} className="text-black underline">{props.user}</Link>
                <p id={"message-id--" + props.id} className="break-words">{props.message}</p>
             </div>
        </div>
    )
}