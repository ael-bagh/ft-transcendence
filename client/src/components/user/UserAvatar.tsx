import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axios";

export default function UserAvatar(props:{user: roomUser | undefined}){
    const online = "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-400"
    const offline = "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-red-400"
    const other = "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-blue-400"
    const [status, setStatus] = useState(other);
    const [avatar, setAvatar] = useState("");
    useEffect(() => {
    axiosInstance.get("/user/"+props.user?.login).then((res) => {
            setAvatar(res.data.avatar)
        if(res.data.status === "ONLINE"){
            setStatus(online)
        }else if(res.data.status === "OFFLINE"){
            setStatus(offline)
        }
    });
    }, [])
    return (
        <span className="inline-block relative object-contain">
        <img
          className="h-10 w-10 rounded-full"
          src={avatar}
          alt=""
        />
        <span className={status}/>
      </span>
    )
}