import MainLayout from "../components/layout/MainLayout";
import RankCard from "../components/leaderboard/RankCard";
import NavBar from "../components/NavBar";
import useFetchLeaderBoard from "../hooks/api/useLeaderBoard";

function LeaderBoard() {

  const { users, error } = useFetchLeaderBoard();
  return (
    <MainLayout>
        <div className="flex flex-col gap-3 text-white text-center">
        {users.map((user: UserLeaderboard, index: number) => {
          return (<RankCard key={index} user={user} />);
        })}
        </div>
    </MainLayout>
  );
}

export default LeaderBoard;