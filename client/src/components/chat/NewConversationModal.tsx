import { ChatContext } from "../../contexts/chat.context";
import { useContext } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";

import Select from "react-select";

type Inputs = {
  friends: string[];
  message: string;
};

const friendsList = [
  { label: "John", value: "1" },
  { label: "Jane", value: "2" },
  { label: "hamid whoever", value: "3" },
  { label: "someone else", value: "4" },
];

export default function NewConversationModal() {
  const { currentGroup, setCurrentGroup } = useContext(ChatContext);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Inputs>();
  /* once i submit the data the response gotta return the id of the conversation created */
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    setCurrentGroup && setCurrentGroup("1")
  };
  return (
    <form className="w-full h-96 flex flex-col gap-2 bg-black p-2" onSubmit={handleSubmit(onSubmit)}>
      <label className="text-left">Select friend(s)</label>
      <Controller
        name="friends"
        control={control}
        rules={{ required: true }}
        render= {({ field: { onChange } }) => (
          <Select
        options={friendsList}
        isMulti
        onChange={onChange}
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
      <input
        type="text"
        id="simple-search"
        className="bg-gray-900  text-gray-100 text-sm  focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 p-2.5"
        placeholder="Heeey there !"
        {...register("message", { required: true })}
      />
      {errors.friends && <span>This field is required</span>}
      <button type="submit" className="bg-purple-500 p-2">
        Start conversation
      </button>
    </form>
  );
}
