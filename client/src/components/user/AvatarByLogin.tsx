import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axios";

export default function AvatarByLogin(props:{login: string}){
    const other = "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-blue-400"
    const [avatar, setAvatar] = useState("");
    useEffect(() => {
    axiosInstance.get("/user/"+props.login).then((res) => {
            setAvatar(res.data.avatar)
    }).catch(() => {});
    }, [])
    return (
        <span className="inline-block relative object-contain">
        <img
          className="h-16 w-16 rounded-full"
          src={avatar}
          alt=""
        />
      </span>
    )
}