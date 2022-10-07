import { GiRank1, GiPodiumWinner, GiDeathJuice } from "react-icons/gi";
import Relationship from "./Relationship";

function ProfileHeader(props: { user: User | null }) {
  return (
    <div className="flex flex-col w-full">
      <div className="sm:h-96 w-full flex justify-center items-center">
        <img
          // src={`https://avatars.dicebear.com/api/avataaars/${props.user?.login}.svg`}
          src={props.user?.avatar ?? `https://avatars.dicebear.com/api/avataaars/${props.user?.login}.svg` }
          alt="avatar"
          className="sm:absolute sm:h-44 sm:w-44 h-full  sm:rounded-full w-screen sm:object-contain bg-gray-700"
        />
      </div>
      <div className="flex flex-row justify-between items-center bg-purple-500 p-2 pl-4 pr-4">
        <p>
          <GiRank1 className="inline text-3xl font-extrabold" />
          {props.user?.player_level}
        </p>
        <p>
          <GiPodiumWinner className="inline text-3xl font-extrabold" />
          {props.user?._count?.games_won}
        </p>
        <p>
          <GiDeathJuice className="inline text-3xl font-extrabold" />{" "}
          {props.user?._count?.games_lost}
        </p>
        <Relationship user={props.user}/>
      </div>
    </div>
  );
}

export default ProfileHeader;
