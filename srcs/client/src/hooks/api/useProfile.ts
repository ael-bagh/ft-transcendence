import { useState, useEffect, useContext } from "react";
import { AuthUserContext } from "../../contexts/authUser.context";
import axiosInstance from "../../lib/axios";

interface returnObject {
  profile: User | undefined;
  error: Error | undefined;
}

export default function useProfile(): returnObject {
  const { setIsAuthLoaded } = useContext(AuthUserContext);
  const [profile, setProfile] = useState<User | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  useEffect(() => {
    axiosInstance
      .get("/user/me")
      .then((res) => {
        setProfile(res.data);
        setIsAuthLoaded(true);
      })
      .catch((err: Error) => {
        setError(err);
        if (
          location.pathname !== "/" &&
          location.pathname.startsWith("/2fa/") === false
        ) {
          location.href = "/";
        }
      });
  }, []);
  return { profile, error };
}
