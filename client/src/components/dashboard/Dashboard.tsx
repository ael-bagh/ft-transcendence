import MainLayout from "../layout/MainLayout";
import { Searching } from "../layout/Loading";
import { useContext, useEffect, useState } from "react";
import { QueueContext } from "../../contexts/queue.context";
import { Link, useNavigate } from "react-router-dom";
import { useSocket } from "../../hooks/api/useSocket";
import axiosInstance from "../../lib/axios";

export default function Dashboard() {
  const { queue, setQueue } = useContext(QueueContext);
  const { queueUp } = useSocket();
  let navigate = useNavigate();
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
      .catch((err) => console.log("already in queue"));
  };



  return (
    <MainLayout>
      <div className="flex flex-col w-full p-2 gap-2">
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
        <div className="w-full">
          <div className="relative w-full">
            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
              <svg
                aria-hidden="true"
                className="w-5 h-5 text-gray-500 dark:text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <input
              type="text"
              id="simple-search"
              className="bg-gray-900  text-gray-100 text-sm  focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 p-2.5"
              placeholder="Search"
            />
          </div>
        </div>
          <Friends />
      </div>
    </MainLayout>
  );
}

function Friends() {
  const [friends, setFriends] = useState<User[]>([]);
  useEffect(() => {
    axiosInstance.get("/user/friends").then((res) => {setFriends(res.data)});
  }, []);
  return (
    <div className="bg-gray-900 shadow overflow-scroll sm:rounded-md flex-grow p-4">
      <ul role="list" className="divide-y divide-gray-200">
        {friends.map((friend) => (
          <li key={friend.user_id}>
            <div className="block">
              <div className="px-4 py-4 sm:px-6">
                  <span className="inline-block relative">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={friend.avatar}
                      alt=""
                    />
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-400" />
                  </span>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-purple-600 truncate">
                    {friend.nickname}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {friend.login}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <Link to={"/profile/" + friend.login} className="bg-purple-500 p-2 text-white text-sm">
                      Visit profile
                    </Link>
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
