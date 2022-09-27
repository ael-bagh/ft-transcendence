import { GiRank1, GiPodiumWinner, GiDeathJuice } from "react-icons/gi";
import { IoMdPersonAdd } from "react-icons/io";
import { AuthUserContext } from "../../contexts/authUser.context";
import { useContext, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { useSocket } from "../../hooks/api/useSocket";

function ProfileHeader() {
  const { data: user } = useLoaderData() as { data: User | null };
  const [requestSent, setRequestSent] = useState(false);
  const onRequestSent = () => {
    sendFriendRequest({
    friend_login: authUser?.login,
      }).finally(() => onRequestSent())
    setRequestSent(true);
  };
  const divStyle = {
    backgroundImage: "url(" + user?.avatar + ")",
  };
  const { sendFriendRequest } = useSocket();
  const { authUser } = useContext(AuthUserContext);
  return (
    <div className="flex flex-col w-screen">
      <div className="sm:h-96 flex justify-center items-center">
        <div className="bg-repeat sm:w-full sm:h-full" style={divStyle}></div>
        <img
          src={`https://avatars.dicebear.com/api/pixel-art-neutral/${user?.login}.svg`}
          alt="avatar"
          className="sm:absolute sm:h-44 sm:w-44 h-96  sm:rounded-full w-screen sm:object-contain"
        />
      </div>
      <div className="flex flex-row justify-between items-center bg-purple-500 p-2">
        <p>
          <GiRank1 className="inline text-3xl font-extrabold" />
          {user?.player_level}
        </p>
        <p>
          <GiPodiumWinner className="inline text-3xl font-extrabold" />
          {user?._count?.games_won}
        </p>
        <p>
          <GiDeathJuice className="inline text-3xl font-extrabold" />{" "}
          {user?._count?.games_lost}
        </p>

        {!requestSent && authUser?.login !== user?.login && <button
          className="bg-purple-600 p-2 rounded-3xl flex-none text-center font-normal border-2 border-white inline items-center"
          onClick={onRequestSent}
        >
          {" "}
          <IoMdPersonAdd className="inline" /> Add friend
        </button>}
      </div>
      <div className="playerInfo">
        <h1 className="text-2xl font-sans font-bold">{user?.login}</h1>
        <p>{user?.status}</p>
      </div>
    </div>
  );
}

export default ProfileHeader;
