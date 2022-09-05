import RankCard from "../components/leaderboard components/RankCard";
import NavBar from "../components/NavBar";
import useFetchLeaderBoard from "../hooks/useFetchLeaderBoard";
import {UserLeaderboard} from "../types/user.interface";

function LeaderBoard() {

  const { users, error } = useFetchLeaderBoard();
  return (
    <div>
      <NavBar />
      <div className="m-20 flex flex-col gap-3">
      <div className="flex flex-col gap-3 text-white text-center">
        {users.map((user: UserLeaderboard, index: number) => {
          return (<RankCard key={index} user={user} />);
        })}
      </div>
      </div>
    </div>
  );
}

export default LeaderBoard;