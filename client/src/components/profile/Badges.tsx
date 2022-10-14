import { useEffect, useState } from "react";
import first_game from "../../imgs/first_game.png";
import first_win from "../../imgs/first_win.png";
import welcome from "../../imgs/welcome.png";
import axiosInstance from "../../lib/axios";

interface Badge {
  id: number;
  name: string;
}
function Badges() {
  const [badges, setBadges] = useState<Badge[]>([]);
  useEffect(() => {
    axiosInstance.get("/user/achievements").then((res) => {
        setBadges(res.data);
        });
  }, []);
  return (
    <div className="flex flex-col">
      <h1 className="text-3xl font-sans text-center mb-4 font-extrabold">
        Badges
      </h1>
      <div className="achievements">
        { badges.map((badge) => 
        <div className="badge">
          <img src={badge.name} alt="badge" className="badgeImg" />
        </div>
      )}
      </div>
    </div>
  );
}

export default Badges;
