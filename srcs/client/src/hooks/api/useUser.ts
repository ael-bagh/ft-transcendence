import { useState, useEffect } from "react";
import axiosInstance from "../../lib/axios";
import { useSocket } from "./useSocket";

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
      .patch("/user/update", data)
      .then((res) => setUserData(res.data))
      .catch(setError);
  return { updateUser, userData, error };
}

export function useHistory(id: string | undefined) {
  const [history, setHistory] = useState<Sett[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  const mutate = (id: string | undefined) =>
    id &&
    axiosInstance
      .get("/" + id + "/sets")
      .then((res) => {
        setHistory(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
      });

  useEffect(() => {
    mutate(id);
  }, []);
  return { history, loading, error, mutate };
}

export function useRelation(id: string | undefined) {
  const [relation, setRelation] = useState<Relation>({is_blocked: false, is_friend:false, is_request_received:false, is_request_sent:false, is_self:false});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
    const {} = useSocket();
    useEffect(() => {
    axiosInstance
      .get("/user/friend/" + id)
      .then((res) => {
        setRelation(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
      });
  }, []);
  return { relation, loading, error};
}