import { useState, useEffect } from "react";
import axiosInstance from "../../lib/axios";
export default function useFetchLeaderBoard() {
    const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    axiosInstance.get("/leaderboard").then((res) => {
      setUsers(res.data);
    }
    ).catch((err) => {
      setError(err);
    }
    );
  }, [users]);
    return { users, error };
}
