import { useState, useEffect } from "react";
import axiosInstance from "../../lib/axios";

interface returnObject {
  user: User | undefined;
  error: Error | undefined;
}

export function useUserById(id: string | undefined): returnObject {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  useEffect(() => {
    axiosInstance
      .get("/user/" + id)
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        setError(err);
      });
  }, []);
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
