import RankCard from "../components/leaderboard components/RankCard";
import NavBar from "../components/NavBar";

function LeaderBoard() {
  return (
    <div>
      <NavBar />
      <div className="m-20 flex flex-col gap-3">
      <div className="flex flex-col gap-3 text-white text-center">
        <RankCard rank={1} />
        <RankCard rank={2} />
        <RankCard rank={3} />
        <RankCard rank={4} />
      </div>
      </div>
    </div>
  );
}

export default LeaderBoard;