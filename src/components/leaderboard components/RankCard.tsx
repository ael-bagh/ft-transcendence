import { FaCrown } from "react-icons/fa";
import PlayerData from "./PlayerData";
import { UserLeaderboard } from "../../types/user.interface";

export default function RankCard(props: {key: number, user: UserLeaderboard}) {
    const bg = props.key === 1 ? "rankCard flex flex-col md:flex-row bg-purple-500 p-3 shadow-inner shadow-black rounded-md sm:rounded-none" : "rankCard flex flex-col md:flex-row bg-gray-400 p-3 shadow-inner shadow-black rounded-md sm:rounded-none";
    const ic = props.key === 1 ? "text-yellow-500 text-4xl": "invisible h-0 w-0";
    return (
        <div className={bg}>
            <div className="flex flex-col md:w-1/6 text-center justify-center items-center">
                <FaCrown className={ic} />
                <div className="text-3xl text-yellow-500">Rank#{props.key}</div>
            </div>
            <div className="md:w-1/6 flex flex-col justify-center m-auto mb-3">
                <img src="https://i.pinimg.com/736x/25/78/61/25786134576ce0344893b33a051160b1.jpg" className="w-24 h-24 p-0" />
            </div>
            <PlayerData />
            <button className=" justify-center items-center md:w-1/6 p-5 bg-gradient-to-r from-blue-600 to-purple-600 text-xl font-semibold m-5 rounded-2xl">
                visit profile
            </button>
        </div>
    )
}