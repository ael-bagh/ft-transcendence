import { ChatContext } from "../../contexts/chat.context";
import { useContext, useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, redirect } from "react-router-dom";

import Select from "react-select";
import axiosInstance from "../../lib/axios";

type Inputs = {
  friends: string[];
  message: string;
};

export default function NewConversationModal() {
  const { currentGroup, setCurrentGroup } = useContext(ChatContext);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Inputs>();
  /* once i submit the data the response gotta return the id of the conversation created */
  interface Friend {
    value: string;
    label: string;
  }
  const [friends, setFriends] = useState<Friend[]>([]);
  useEffect(() => {
    axiosInstance.get("/user/friends").then((res) => {
      setFriends(res.data.map((friend: User) => ({
        value: friend.user_id,
        label: friend.login,
      }))
      );
    });
  },[currentGroup])

  const [roomLogin, setRoomLogin] = useState<string | undefined>("");
  const navigate = useNavigate();
  const onSendMessage = () => {
    axiosInstance.post("/rooms/create_direct_message/"+ roomLogin).then((ret) => {
        navigate("/chat/" + ret.data , {replace : true});
    })
  };

  return (
    <div className="w-full h-96 flex flex-col gap-2 bg-black p-2">
      <label className="text-left">Select friend(s)</label>
      <Controller
        name="friends"
        control={control}
        rules={{ required: true }}
        render= {({ field: { onChange } }) => (
          <Select
        options={friends}
        onChange={(e) => setRoomLogin(e?.label)}
        theme={(theme) => ({
          ...theme,
          borderRadius: 0,
          colors: {
            ...theme.colors,
            primary50: "#7d3af2",
            primary25: "#7d3af2",
            primary75: "#7d3af2",
            primary: "#7d3af2",
            neutral0: "black",
            neutral5: "#111827",
            neutral20: "#111827",
            neutral10: "#7d3af2",
            neutral80: "white",
            neutral60: "white",
            neutral70: "white",
          },
        })}
        className="basic-multi-select"
        classNamePrefix="select friends"
      />
        )}
      />
      <label className="text-left">Send your first message</label>
      {errors.friends && <span>This field is required</span>}
      <button onClick={onSendMessage} className="bg-purple-500 p-2">
        Start conversation
      </button>
    </div>
  );
}
