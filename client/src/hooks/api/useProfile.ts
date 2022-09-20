import { useState, useEffect } from "react";
import axiosInstance from "../../lib/axios";

export default function useFetchLeaderBoard() {
  const [profile, setProfile] = useState([]);
  const [error, setError] = useState(null);
  useEffect(() => {
    axiosInstance
      .get("/auth/me")
      .then((res) => {
        setProfile(res.data);
      })
      .catch((err) => {
        setError(err);
      });
  }, [profile]);
  return { profile, error };
}
