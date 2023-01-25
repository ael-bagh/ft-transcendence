import MainLayout from "../layout/MainLayout";

/* This example requires Tailwind CSS v2.0+ */
import { useEffect, useState } from "react";
import { Switch } from "@headlessui/react";
import axiosInstance from "../../lib/axios";
import { useNavigate } from "react-router-dom";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function Toggle(props: {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}) {
  return (
    <Switch
      checked={props.enabled}
      onChange={props.setEnabled}
      className={classNames(
        props.enabled ? "bg-purple-600" : "bg-gray-200",
        "relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
      )}
    >
      <span className="sr-only">Use setting</span>
      <span
        className={classNames(
          props.enabled ? "translate-x-5" : "translate-x-0",
          "pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
        )}
      >
        <span
          className={classNames(
            props.enabled
              ? "opacity-0 ease-out duration-100"
              : "opacity-100 ease-in duration-200",
            "absolute inset-0 h-full w-full flex items-center justify-center transition-opacity"
          )}
          aria-hidden="true"
        >
          <svg
            className="h-3 w-3 text-gray-400"
            fill="none"
            viewBox="0 0 12 12"
          >
            <path
              d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span
          className={classNames(
            props.enabled
              ? "opacity-100 ease-in duration-200"
              : "opacity-0 ease-out duration-100",
            "absolute inset-0 h-full w-full flex items-center justify-center transition-opacity"
          )}
          aria-hidden="true"
        >
          <svg
            className="h-3 w-3 text-purple-600"
            fill="currentColor"
            viewBox="0 0 12 12"
          >
            <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
          </svg>
        </span>
      </span>
    </Switch>
  );
}

export default function RoomCreate() {
  const [enabled, setEnabled] = useState(false);
  const [err, setErr] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleSubmit = (e: any) => {
    e.preventDefault();
    axiosInstance
      .post("/rooms/create_room", {
        name: name,
        password: password,
        is_private: enabled,
        is_direct_message: false,
      })
      .then((res) => {
        navigate(`/chat/${res.data.room_id}`);
      })
      .catch((err) => {
        setErr(err.response.data)
      });
  };
  useEffect(() => {
    setPassword("");
  }, [enabled]);
  return (
    <MainLayout>
      <form
        className="flex flex-col h-fit w-3/4 p-3 self-center text-center mx-auto gap-3 justify-self-center text-white text-xl"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-row">
          <label className="w-1/4 text-left">Room Name</label>
          <input
            onChange={(e) => setName(e.currentTarget.value)}
            className="w-3/4 text-black"
            type="text"
            required
            minLength={5}
            maxLength={50}
          />
        </div>
        <div className="flex flex-row">
          <label className="w-1/4 text-left">Private</label>
          <Toggle enabled={enabled} setEnabled={setEnabled} />
        </div>
        {enabled && (
          <div className="flex flex-row">
            <label className="w-1/4 text-left">Password</label>
            <input
              className="w-3/4 text-black"
              type="password"
              onChange={(e) => setPassword(e.currentTarget.value)}
              required={enabled}
              minLength={8}
              maxLength={25}
            />
          </div>
        )}
        <button
          type="submit"
          className="w-1/4 self-center bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        >
          Create
        </button>
      </form>
    </MainLayout>
  );
}
