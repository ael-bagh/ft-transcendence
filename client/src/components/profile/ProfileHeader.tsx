import { GiRank1, GiPodiumWinner, GiDeathJuice } from "react-icons/gi";
import { useLoaderData } from "react-router-dom";
import { useRelation } from "../../hooks/api/useUser";
import Relationship from "./Relationship";

function ProfileHeader() {
  const { data: user } = useLoaderData() as { data: User | null };

  const divStyle = {
    backgroundImage: "url(" + user?.avatar + ")",
  };
  return (
    <div className="flex flex-col w-full">
      <div className="sm:h-96 w-full flex justify-center items-center">
        <div className="sm:bg-repeat sm:w-full sm:h-full overflow-clip" style={divStyle}></div>
        <img
          src={`https://avatars.dicebear.com/api/pixel-art-neutral/${user?.login}.svg`}
          alt="avatar"
          className="sm:absolute sm:h-44 sm:w-44 h-full  sm:rounded-full w-screen sm:object-contain"
        />
      </div>
      <div className="flex flex-row justify-between items-center bg-purple-500 p-2 pl-4 pr-4">
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
        <Relationship user={user}/>
      </div>
      <div className="playerInfo">
        <h1 className="text-2xl font-sans font-bold">{user?.login}</h1>
        <p>{user?.status}</p>
      </div>
    </div>
  );
}

export default ProfileHeader;
