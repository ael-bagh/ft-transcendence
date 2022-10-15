import MainLayout from "../layout/MainLayout";
import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import axiosInstance from "../../lib/axios";
import { AuthUserContext } from "../../contexts/authUser.context";
import { toast } from "react-toastify";

interface roomUser {
  login: string;
  nickname: string;
  avatar: string;
  is_admin: boolean;
}
function Example() {
  const { authUser } = useContext(AuthUserContext);
  const { id } = useParams();
  const [roomUsers, setRoomUsers] = useState<roomUser[]>([]);
  const [room, setRoom] = useState<Room | undefined>(undefined);
  const [isAuthAdmin, setIsAuthAdmin] = useState(false);
  const [bannedUsers, setBannedUsers] = useState<User[]>([]);
  const navigate = useNavigate();
  const onPromoteUser = (user: roomUser) => {
    //promoteHere
    axiosInstance
      .patch("/rooms/" + room?.room_id + "/promoteadmin", {
        user_login: user.login,
      })
      .catch((err) => {toast(err, {type: "error"})})
      .finally(() => {
        toast("User promoted", { type: "success" });
        navigate(`/chat/${room?.room_id}`);
      });
  };
  const onRevoqueUser = (user: roomUser) => {
    //revoqueHere
    axiosInstance
      .patch("/rooms/" + room?.room_id + "/revokeadmin", {
        user_login: user.login,
      })
      .catch((err) => {toast(err, {type: "error"})})
      .finally(() => {
        toast("Revoqued admine privelege", { type: "success" });
        navigate(`/chat/${room?.room_id}`);
      });
  };

  const onBanUser = (user: roomUser) => {
    //banHere
    axiosInstance
      .patch("/rooms/" + room?.room_id + "/banuser", {
        user_login: user.login,
      })
      .catch((err) => {toast(err, {type: "error"})})
      .finally(() => {
        toast("User banned", { type: "success" });
        navigate(`/chat/${room?.room_id}`);
      });
  };
  const onUnbanUser = (user: User) => {
    //unbanHere
    axiosInstance
      .patch("/rooms/" + room?.room_id + "/unbanuser", {
        user_login: user.login,
      })
      .catch((err) => {toast(err, {type: "error"})})
      .finally(() => {
        toast("User unbanned", { type: "success" });
        navigate(`/chat/${room?.room_id}`);
      });
  };

  useEffect(() => {
    axiosInstance.get("/rooms/" + id).then((res) => {
      setRoom(res.data);
      setRoomUsers(
        res.data.room_users.filter(
          (user: User) =>
            user.login !== res.data.room_creator_login &&
            user.login !== authUser?.login
        )
      );
      res.data.room_users.map((user: User) => {
        if (user.login === authUser?.login) setIsAuthAdmin(true);
      });
    }).catch((err) => {toast(err, {type: "error"})});
    axiosInstance.get("/rooms/" + id + "/bannedusers").then((res) => {
      setBannedUsers(res.data);
    }).catch(() => {})
  }, []);

  return (
    <>
      <>
      <div className="bg-gray-700 shadow overflow-hidden sm:rounded-md w-full">
          <ul role="list" className="divide-y divide-gray-200">
            {!roomUsers.length && (
              <div className="text-center text-white">No users</div>
            )}
        {!!roomUsers.length && roomUsers.map((roomUser) => (
                <li key={roomUser.login}>
                  <div className="block hover:bg-gray-700">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {roomUser.nickname}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {roomUser.is_admin ? "Admin" : "User"}
                          </p>
                        </div>
                      </div>
                      {isAuthAdmin && (
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            {roomUser.is_admin && (
                              <button
                                onClick={() => onRevoqueUser(roomUser)}
                                className="p-2 flex items-center text-sm text-white bg-red-500"
                              >
                                Revoke admin privelege
                              </button>
                            )}
                            {!roomUser.is_admin && (
                              <button
                                onClick={() => onPromoteUser(roomUser)}
                                className="p-2 flex items-center text-sm text-white bg-green-500"
                              >
                                Promote to room admin
                              </button>
                            )}
                            <button
                              className="p-2 mt-2 flex items-center text-sm text-white sm:mt-0 sm:ml-6 bg-red-500"
                              onClick={() => onBanUser(roomUser)}
                            >
                              Ban User
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
        </div>
      </>
      <>
        {bannedUsers.map((roomUser) => (
          <li key={roomUser.login}>
            <div className="block hover:bg-gray-700">
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-indigo-600 truncate">
                    {roomUser.nickname}
                  </p>
                </div>
                {isAuthAdmin && (
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <button
                        className="p-2 mt-2 flex items-center text-sm text-white sm:mt-0 sm:ml-6 bg-red-500"
                        onClick={() => onUnbanUser(roomUser)}
                      >
                        Unban User
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </>
    </>
  );
}

export default function RoomManagement() {
  const { id } = useParams();
  const [roomUsers, setRoomUsers] = useState<User[]>([]);
  const {authUser} = useContext(AuthUserContext);
  const navigate = useNavigate();
  useEffect(() => {
      axiosInstance.get("/rooms/" + id + "/" + authUser?.login + "/role").catch((err) => {
          navigate("/chat");
      }).catch((err) => {toast(err, {type: "error"})});
    axiosInstance.get("/rooms/" + id).then((res) => {
      setRoomUsers(
        res.data.room_users.filter(
          (user: User) => user.login !== res.data.room_creator_login
        )
      );
    }).catch(() => {});
  }, []);

  return (
    <MainLayout>
      <Example />
    </MainLayout>
  );
}
