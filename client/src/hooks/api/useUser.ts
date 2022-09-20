import { useState, useEffect } from "react";
import axiosInstance from "../../lib/axios";

export function useUserById(id: string) {
  const [user, setUser] = useState([]);
  const [error, setError] = useState(null);
  useEffect(() => {
    axiosInstance
      .get("/users/" + id)
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        setError(err);
      });
  }, [user]);
  return { user, error };
}

export function useUpdateUser(oldUserData: Record<string, any>) {
  const [userData, setUserData] = useState(oldUserData);
  const [error, setError] = useState(null);
  const updateUser = (data: Record<string, any>) =>
    axiosInstance
      .post("/users/update", data)
      .then((res) => setUserData(res.data))
      .catch(setError);
  return { updateUser, userData, error };
}
