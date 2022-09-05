import { useState, useEffect } from "react";

export default function useFetchLeaderBoard() {
    const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetch(`${process.env.HOST_API}/leaderboard/0`)
      .then((res) => res.json())
      .then(
        (result) => {
          setUsers(result);
        },
        (error) => {
          setError(error);
        }
      );
  }, [users]);
    return { users, error };
}
