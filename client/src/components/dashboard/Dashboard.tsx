import MainLayout from "../layout/MainLayout";
import { useContext, useEffect, useState } from "react";
import { QueueContext } from "../../contexts/queue.context";
import { Link } from "react-router-dom";
import { useSocket } from "../../hooks/api/useSocket";
import axiosInstance from "../../lib/axios";
import { FaRegEye } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { GiCrossedSwords } from "react-icons/gi";
import { MdPersonSearch } from "react-icons/md";
import sock from "../../lib/socket";
import { useNavigate } from "react-router-dom";
import UserAvatar from "../user/UserAvatar";
import { AuthUserContext } from "../../contexts/authUser.context";
import { toast } from 'react-toastify';
export default function Dashboard() {
  const { queue, setQueue } = useContext(QueueContext);
  const { queueUp } = useSocket();
  const [segment, setSegment] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [searchTimer, setSearchTimer] = useState<any>(null);

  const queueUpByMode = (mode: "ONE" | "NORMAL" | "RANKED") => {
    setQueue({
      inQueue: true,
      match: mode,
      matchFound: false,
    });
    queueUp(mode)
      .then(() => {
        setQueue({
          inQueue: true,
          match: mode,
          matchFound: true,
        });
      })
      .catch((err) => toast(err , {type: "error"}));
  };
  useEffect(() => {
    if (segment)
      axiosInstance.get("/user/some/" + segment).then((res: any) => {
        setUsers(res.data);
      }).catch(() => {});
    else setUsers([]);
  }, [segment]);
  return (
    <MainLayout>
      <div className="flex flex-col w-full p-2 gap-2">
        <div className="flex justify-center w-full h-fit">
          <div className="w-full">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdPersonSearch
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <input
                onChange={(e) => {
                  searchTimer && clearTimeout(searchTimer);
                  setSearchTimer(
                    setTimeout(() => setSegment(e.target.value), 500)
                  );
                }}
                id="search"
                name="search"
                className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-gray-700 text-gray-300 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-white focus:ring-white focus:text-gray-900 sm:text-sm"
                placeholder="Search"
                type="search"
              />
            </div>
          </div>
        </div>
        <Example users={users} />
        {!queue.inQueue && (
          <div className="flex flex-col md:flex-row">
            <div className="flex flex-col w-full p-4 gap-2">
              <div
                className="flex flex-row h-20 bg-gray-700 w-full"
                onClick={() => queueUpByMode("ONE")}
              >
                <div className="w-44 h-full bg-purple-500"></div>
                <div className="grow h-full m-auto text-center min-w-44">
                  ONE: single Match
                </div>
              </div>
            </div>
            <div className="flex flex-col w-full p-4 gap-2">
              <div
                className="flex flex-row h-20 bg-gray-700 w-full"
                onClick={() => queueUpByMode("NORMAL")}
              >
                <div className="w-44 h-full bg-purple-500"></div>
                <div className="grow h-full m-auto text-center min-w-44">
                  NORMAL : Best of 3
                </div>
              </div>
            </div>
            <div className="flex flex-col w-full p-4 gap-2">
              <div
                className="flex flex-row h-20 bg-gray-700 w-full"
                onClick={() => queueUpByMode("RANKED")}
              >
                <div className="w-44 h-full bg-purple-500"></div>
                <div className="grow h-full m-auto text-center min-w-44">
                  RANKED : Best of 3
                </div>
              </div>
            </div>
          </div>
        )}
        <Friends />
      </div>
    </MainLayout>
  );
}

function Friends() {
  const { queue, setQueue } = useContext(QueueContext);
  const {authUser} = useContext(AuthUserContext);
  const navigate = useNavigate();
  const [friends, setFriends] = useState<User[]>([]);
  const onChallenge = (user_login: string) => {
    setQueue({
      inQueue: true,
      match: "ONE",
      matchFound: false,
    });
    sock.emit("invite_to_game", {target_login: user_login, mode: "ONE"} ,(data: any) => {
      setQueue({
        inQueue: false,
        match: "ONE",
        matchFound: false,
      });

      navigate("/game/" + data);
    });
  };
  useEffect(() => {
    sock.on("friend_updated_status", (data: any) => {
      setFriends((prev) => {
        const index = prev.findIndex((f) => f.login === data.login);
        if (index !== -1) {
          prev[index].status = data.status;
          return [...prev];
        }
        return prev;
      });
    });
    axiosInstance.get("/user/friends").then((res) => {
      setFriends(res.data);
    }).catch(() => {});

    return () => {
      sock.off("friend_updated_status");
    }
  }, []);
  return (
    <div className="bg-gray-900 shadow overflow-scroll sm:rounded-md flex-grow p-4">
      <ul role="list" className="divide-y divide-gray-200">
        {friends.map((friend) => (
          <li key={friend.user_id}>
            <div className="block">
              <div className="px-4 py-4 sm:px-6">
                <UserAvatar user={{...friend , is_admin:false}} />
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-purple-600 truncate">
                    {friend.nickname}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {friend.status}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 gap-3">
                    <Link
                      to={"/profile/" + friend.login}
                      className="bg-purple-500 p-2 text-white text-sm rounded-full  hover:cursor-pointer"
                    >
                      <CgProfile className="w-5 h-5 rounded-full" />
                    </Link>
                    {friend.status === "INGAME" && (
                      <button
                        onClick={() => {
                          sock.emit("spectate", {target_login: friend.login}, (ret :{lobby: string}) => {
                            navigate("/game/" + ret.lobby);
                          });
                        }}
                        className="bg-purple-500 p-2 text-white text-sm flex flex-row rounded-full hover:cursor-pointer"
                      >
                        <FaRegEye className="w-5 h-5 rounded-full" />
                      </button>
                    )}
                    {friend.status === "ONLINE" && authUser?.status === "ONLINE" &&(
                      <div
                        onClick={() => {onChallenge(friend.login)}}
                        className="bg-purple-500 p-2 text-white text-sm rounded-full hover:cursor-pointer"
                      >
                        <GiCrossedSwords className="w-5 h-5 rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Example(props: { users: User[] }) {
  return (
    <ul role="list" className="divide-y divide-gray-200">
      {props.users.map((user) => (
        <li key={user.user_id} className="py-4">
          <Link to={"/profile/" + user.login}>
            <div className="flex space-x-3">
              <img className="h-6 w-6 rounded-full" src={user.avatar} alt="" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">{user.nickname}</h3>
                </div>
                <p className="text-sm text-gray-500">{user.login}</p>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
