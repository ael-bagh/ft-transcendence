import React from "react";

interface authUserContextInterface {
  authUser: User | undefined;
  setAuthUser: (user: User) => void;
  isAuthLoaded: boolean;
  setIsAuthLoaded: (isLoaded: boolean) => void;
}

const authUserContextDefaultValues: authUserContextInterface = {
  authUser: undefined,
  setAuthUser: () => null,
  isAuthLoaded: false,
  setIsAuthLoaded: () => null,
};

export const AuthUserContext = React.createContext<authUserContextInterface>(
  authUserContextDefaultValues
);

const AuthUserProvider = ({ children }: { children?: React.ReactNode }) => {
  const [authUser, setAuthUser] = React.useState<User>();
  const [isAuthLoaded, setIsAuthLoaded] = React.useState(false);
  return (
    <AuthUserContext.Provider
      value={{
        authUser,
        setAuthUser,
        isAuthLoaded,
        setIsAuthLoaded,
      }}
    >
      {children}
    </AuthUserContext.Provider>
  );
};

export default AuthUserProvider;
