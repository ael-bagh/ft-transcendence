import { useState, useEffect, useContext } from "react";
import axiosInstance from "../../lib/axios";
import MainLayout from "../layout/MainLayout";
import TimeAgo from "react-timeago";
import { RiChatPrivateLine, RiUserShared2Fill } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import { AuthUserContext } from "../../contexts/authUser.context";

function Room(props: { room: Room }) {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const onJoinRoom = (room: Room, password: string | "") => {
    axiosInstance
      .post("/rooms/" + room.room_id + "/join_room", {
        room_id: room.room_id,
        password: password,
      })
      .then((res) => {
        navigate(`/chat/${res.data.room_id}`);
      })
      .catch(() => {
        alert("Incorrect password");
      });
  };
  return (
    <div className="block hover:bg-gray-500">
      <div className="px-4 py-4 flex items-center sm:px-6">
        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
          <div className="truncate">
            <div className="flex text-sm">
              <p className="font-medium text-purple-500 truncate">
                {props.room.room_name}
              </p>
              <p className="ml-10 flex-shrink-0 font-normal text-xl text-gray-100">
                {props.room.room_private ? (
                  <RiChatPrivateLine />
                ) : (
                  <RiUserShared2Fill />
                )}
              </p>
            </div>
            <div className="mt-2 flex">
              <div className="flex items-center text-sm text-gray-100">
                <p>
                  Created by {props.room.room_creator_login}{" "}
                  <TimeAgo
                    className="text-purple-500"
                    date={props.room.room_creation_date}
                  />
                </p>
              </div>
            </div>
            {props.room.room_private && (
              <div className="mt-2 flex">
                <div className="flex items-center text-sm text-gray-100">
                  <div className="flex flex-col">
                    <p>password:</p>
                    <input
                      className="text-sm text-black"
                      type="password"
                      onChange={(e) => setPassword(e.currentTarget.value)}
                    />
                  </div>
                </div>
              </div>
            )}
            <button
              className="p-2 bg-purple-500 text-sm mt-2"
              onClick={() => onJoinRoom(props.room, password)}
            >
              Join
            </button>
          </div>
          <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
            <div className="flex overflow-hidden -space-x-1">
              {props.room.room_users.map(
                (user: roomUser, index: number) =>
                  index < 3 && (
                    <img
                      key={user.nickname}
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-purple-500"
                      src={user.avatar}
                      alt={user.nickname}
                    />
                  )
              )}
              {props.room.room_users.length > 3 && (
                <span className="inline-block h-6 w-6 rounded-full ring-2 ring-purple-500">
                  +{props.room.room_users.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const { authUser } = useContext(AuthUserContext);
  useEffect(() => {
    axiosInstance.get("/rooms/group_rooms").then((res) => {
      setRooms(
        res.data.filter(
          (room: Room) =>
            !room.room_users.find(
              (user: roomUser) => user.login === authUser?.login
            )
        )
      );
    });
  }, []);

  return (
    <div className="bg-gray-700 shadow overflow-hidden sm:rounded-md w-full mt-3">
      <ul role="list" className="divide-y divide-gray-200">
        {rooms.map((room) => (
          <li key={room.room_id}>
            <Room room={room} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ChatRooms() {
  return (
    <MainLayout>
      <div className="bg-black px-4 py-5 border-b border-gray-500 sm:px-6 w-full">
        <div className="-ml-4 -mt-2 flex items-center justify-between flex-wrap sm:flex-nowrap">
          <div className="ml-4 mt-2">
            <h3 className="text-lg leading-6 font-medium text-gray-100">
              Rooms
            </h3>
          </div>
          <div className="ml-4 mt-2 flex-shrink-0">
            <Link
              to={"/rooms/create"}
              type="button"
              className="relative inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400"
            >
              Create new Room
            </Link>
          </div>
        </div>
        <Rooms />
      </div>
    </MainLayout>
  );
}
